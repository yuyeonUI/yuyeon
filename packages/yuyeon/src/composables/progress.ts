import { computed } from 'vue';

export function useProgress(props: any) {
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

  return {
    numValue,
  };
}
