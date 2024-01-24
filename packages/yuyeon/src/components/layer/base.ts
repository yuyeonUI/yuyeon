import { computed, getCurrentInstance, ref, watchEffect } from 'vue';

import { propsFactory } from '../../util/vue-component';

export const pressBasePropsOptions = propsFactory(
  {
    base: String,
  },
  'YLayer.base',
);

export function useBase() {
  const vm = getCurrentInstance();

  const base$ = ref();
  const baseSlot = ref();
  const baseEl = ref<HTMLElement>();

  const baseFromSlotEl = computed(() => {
    return baseSlot.value?.[0]?.el;
  });

  watchEffect(() => {
    if (!base$.value) {
      baseEl.value = baseFromSlotEl.value;
      return;
    }
    let base = base$.value;
    if (base.baseEl) {
      base = base.baseEl;
    }
    if (base$.value?.$el) {
      if (base$.value.$el.nodeType === 1) {
        base = base$.value.$el;
      }
    }
    baseEl.value = base;
  });

  return {
    base$,
    baseEl,
    baseSlot,
  };
}
