import { Ref, computed, ref, watch } from 'vue';

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
  duration = 1000,
  options?: { tickDuration: number },
) {
  const { tickDuration } = options ?? {};
  let tickInterval = tickDuration ?? 100;
  let timer = -1;

  const tickStart = ref(0);
  const drift = ref(duration);
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
    drift.value = duration;
  }

  return {
    start,
    stop,
    reset,
    drift,
    isWork,
  }
}
