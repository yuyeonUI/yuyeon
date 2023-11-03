import type { ComputedGetter } from 'vue';
import { computed, reactive, toRefs, watchEffect } from 'vue';

/**
 * For Destructuring assignment
 * @param getter
 */
export function $computed<T extends object>(getter: ComputedGetter<T>) {
  const refs = reactive({}) as T;
  const base = computed(getter);
  watchEffect(
    () => {
      for (const key in base.value) {
        refs[key] = base.value[key];
      }
    },
    { flush: 'sync' },
  );
  return toRefs(refs);
}
