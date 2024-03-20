import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  PropType,
  computed,
  getCurrentInstance,
  ref,
  watchEffect,
} from 'vue';

import { propsFactory } from '../../util/vue-component';

export type BaseType =
  | string
  | Element
  | ComponentPublicInstance
  | [x: number, y: number]
  | undefined;

export const pressBasePropsOptions = propsFactory(
  {
    base: [String, Object, Array] as PropType<BaseType>,
  },
  'YLayer.base',
);

interface BaseProps {
  base: BaseType;
}

export function useBase(props: BaseProps) {
  const vm = getCurrentInstance()!;

  const base$ = ref();
  const baseSlot = ref();
  const baseEl = ref<HTMLElement>();

  const baseFromSlotEl = computed(() => {
    const el = baseSlot.value?.[0]?.el;
    if (el && el.nodeType === Node.ELEMENT_NODE) {
      return el;
    }
    return undefined;
  });

  const base = computed(() => {
    if (baseEl.value) {
      return baseEl.value;
    }
    return getBase(props.base, vm);
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
      if (base$.value.$el.nodeType === Node.ELEMENT_NODE) {
        base = base$.value.$el;
      }
    }
    baseEl.value = base;
  });

  return {
    base$,
    baseEl,
    baseSlot,
    base,
  };
}

function getBase(selector: BaseType, vm: ComponentInternalInstance) {
  if (!selector) return;

  let ret;

  if (selector === 'parent') {
    let el = vm?.proxy?.$el?.parentNode;
    while (el?.hasAttribute('data-base-parent')) {
      el = el.parentNode;
    }
    ret = el;
  }
  // Selector
  else if (typeof selector === 'string') {
    ret = document.querySelector(selector);
  }
  // Component
  else if ('$el' in selector) {
    ret = selector.$el;
  }
  // HTMLElement | Element | [x, y]
  else {
    ret = selector;
  }

  return ret;
}
