import { computed, shallowRef, watch } from 'vue';

export function useProgress(props: any) {
  const delta = shallowRef(0);

  const numValue = computed(() => {
    const { value } = props;
    const numValue = Number(value);
    if (Number.isNaN(numValue) || numValue < 0) {
      return 0;
    }
    if (numValue > 100) {
      return 100;
    }
    return numValue;
  });

  watch(numValue, (neo, old) => {
    delta.value = neo - old;
  });

  return {
    numValue,
    delta,
  };
}
