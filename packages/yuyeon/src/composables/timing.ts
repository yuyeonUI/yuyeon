import { Ref, computed, ref, watch, MaybeRef, unref } from 'vue';

export function useLazy(eager: Ref<boolean | undefined>, updated: Ref<any>) {
  const tick = ref(false);
  const tack = ref();
  tack.value = updated.value;
  const lazyValue = computed(() => {
    if (eager.value) return updated.value;
    return tack.value;
  });
  watch(updated, () => {
    if (!tick.value) {
      tack.value = updated.value;
    }
    if (!eager.value) {
      tick.value = true;
    }
  });
  function onAfterUpdate() {
    tack.value = updated.value;
    if (!eager.value) {
      tick.value = false;
    }
  }
  return {
    entered: tick,
    lazyValue,
    onAfterUpdate,
  };
}

export function useTimer(
  cb: () => void,
  duration: MaybeRef<number>,
  options?: { tickDuration: number },
) {
  const { tickDuration } = options ?? {};
  let tickInterval = tickDuration ?? 100;
  let timer = -1;

  const tickStart = ref(0);
  const drift = ref(unref(duration));
  const isWork = ref(false);

  function tick() {
    const now = Date.now();
    const realTick = now - tickStart.value;
    drift.value = drift.value - realTick;
    if (drift.value < 1) {
      cb();
    } else {
      const tickDrift = now - tickStart.value + tickInterval;
      const nextInterval = tickDrift >= 1 ? tickDrift : tickInterval;
      tickStart.value = now;
      timer = window.setTimeout(tick, nextInterval);
    }
  }

  function start() {
    if (isWork.value) return;
    isWork.value = true;
    tickStart.value = Date.now();
    timer = window.setTimeout(tick, tickInterval);
  }

  function stop() {
    window.clearTimeout(timer);
    timer = -1;
    isWork.value = false;
  }

  function reset() {
    stop();
    drift.value = unref(duration);
  }

  return {
    start,
    stop,
    reset,
    drift,
    isWork,
  }
}

type DelayType = 'closeDelay' | 'openDelay';

export function useDelay(props: any, callback?: (active: boolean) => void) {
  const state: Partial<Record<DelayType, number>> = {};

  function clearDelay(propKey: DelayType) {
    state[propKey] && window.clearTimeout(state[propKey]);
    delete state[propKey];
  }

  function setDelay(propKey: DelayType, timeout: number, resolve: any) {
    state[propKey] = window.setTimeout(() => {
      const active = propKey === 'openDelay';
      callback?.(active);
      resolve(active);
    }, timeout);
  }

  const generateDelay = (propKey: DelayType) => () => {
    clearDelay('openDelay');
    clearDelay('closeDelay');
    const delayTime = props[propKey] ?? 0;
    return new Promise<boolean>((resolve) => {
      const delay = parseInt(String(delayTime), 10);
      setDelay(propKey, delay, resolve);
    });
  };

  return {
    startOpenDelay: generateDelay('openDelay'),
    startCloseDelay: generateDelay('closeDelay'),
  };
}

