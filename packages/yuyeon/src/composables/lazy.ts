import { computed, Ref, ref, watch } from "vue";

export function useLazy(eager: boolean, updated: Ref<any>) {
  const tick = ref(false);
  const tack = ref();
  tack.value = updated.value;
  const lazyValue = computed(() => {
    if (eager) return updated.value;
    return tack.value;
  });
  watch(updated, () => {
    if (!tick.value) {
      tack.value = updated.value;
    }
    if (!eager) {
      tick.value = true
    }
  });
  function onAfterUpdate() {
    tack.value = updated.value;
    if (!eager) {
      tick.value = false;
    }
  }
  return {
    entered: tick,
    lazyValue,
    onAfterUpdate,
  }
}
