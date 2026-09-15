import {
  computed,
  getCurrentScope,
  type MaybeRef,
  onScopeDispose,
  type Ref,
  ref,
  shallowRef,
  unref,
  watch,
} from 'vue';

export function useLazy<T>(
  eager: MaybeRef<boolean | undefined>,
  source: Ref<T>,
) {
  const isLocked = ref(false);
  const cachedValue = shallowRef<T>(source.value);

  const lazyValue = computed(() =>
    unref(eager) ? source.value : cachedValue.value,
  );

  watch(
    [source, () => Boolean(unref(eager))],
    ([value, isEager], [, wasEager]) => {
      // 즉시 반영 모드이거나 모드가 전환되면 동기화하고 고정 해제
      if (isEager || isEager !== wasEager) {
        cachedValue.value = value;
        isLocked.value = false;
        return;
      }

      // 첫 변경값을 반영한 뒤 후속 변경은 보류
      if (!isLocked.value) {
        cachedValue.value = value;
        isLocked.value = true;
      }
    },
  );

  function onAfterUpdate() {
    cachedValue.value = source.value;
    isLocked.value = false;
  }

  return {
    entered: isLocked,
    lazyValue,
    onAfterUpdate,
  };
}

export function useTimer(
  cb: () => void,
  duration: MaybeRef<number>,
  options?: { tickDuration?: number },
) {
  const tickInterval = normalizeDelay(options?.tickDuration, 100, 1);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let deadline = 0;
  let runId = 0;

  const drift = ref(normalizeDelay(unref(duration)));
  const isWork = ref(false);

  function clearTimer() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  function schedule(id: number, delay: number) {
    timer = setTimeout(() => tick(id), delay);
  }

  function tick(id: number) {
    if (!isWork.value || id !== runId) return;

    const left = deadline - Date.now();
    drift.value = left;

    if (left <= 0) {
      timer = undefined;
      isWork.value = false;
      cb();
      return;
    }

    schedule(id, Math.min(tickInterval, left));
  }

  function start() {
    if (isWork.value) return;

    isWork.value = true;
    runId += 1;
    deadline = Date.now() + Math.max(0, finiteOrZero(drift.value));
    const remaining = Math.max(0, finiteOrZero(drift.value));
    schedule(runId, Math.min(tickInterval, remaining));
  }

  function stop() {
    if (isWork.value) {
      drift.value = deadline - Date.now();
    }

    runId += 1;
    clearTimer();
    isWork.value = false;
  }

  function reset() {
    stop();
    drift.value = normalizeDelay(unref(duration));
  }

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }

  return {
    start,
    stop,
    reset,
    drift,
    isWork,
  };
}

type DelayType = 'closeDelay' | 'openDelay';
type DelayProps = Partial<Record<DelayType, unknown>>;
type DelayHandle = ReturnType<typeof setTimeout>;

interface PendingDelay {
  timer: DelayHandle;
  resolve: (active: boolean) => void;
}

export function useDelay(
  props: DelayProps,
  callback?: (active: boolean) => void,
) {
  const state: Partial<Record<DelayType, PendingDelay>> = {};

  function clearDelay(propKey: DelayType) {
    const pending = state[propKey];
    if (!pending) return;

    clearTimeout(pending.timer);
    delete state[propKey];
    pending.resolve(false);
  }

  function setDelay(
    propKey: DelayType,
    timeout: number,
    resolve: (active: boolean) => void,
  ) {
    const pending = {
      timer: undefined as unknown as DelayHandle,
      resolve,
    };
    state[propKey] = pending;

    pending.timer = setTimeout(() => {
      if (state[propKey] !== pending) return;

      delete state[propKey];
      const active = propKey === 'openDelay';
      resolve(active);
      callback?.(active);
    }, timeout);
  }

  const generateDelay = (propKey: DelayType) => () => {
    clearDelay('openDelay');
    clearDelay('closeDelay');
    const delayTime = props[propKey] ?? 0;
    return new Promise<boolean>((resolve) => {
      const delay = normalizeDelay(delayTime);
      setDelay(propKey, delay, resolve);
    });
  };

  if (getCurrentScope()) {
    onScopeDispose(() => {
      clearDelay('openDelay');
      clearDelay('closeDelay');
    });
  }

  return {
    startOpenDelay: generateDelay('openDelay'),
    startCloseDelay: generateDelay('closeDelay'),
  };
}

function finiteOrZero(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function normalizeDelay(value: unknown, fallback = 0, minimum = 0): number {
  const delay = Number(value);
  if (!Number.isFinite(delay)) return fallback;
  return Math.max(minimum, delay);
}
