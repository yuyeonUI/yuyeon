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
    if (baseEl.value && !props.base) {
      return baseEl.value;
    }
    return getBase(props.base, vm);
  });

  watchEffect(() => {
    if (!base$.value) {
      if (!baseFromSlotEl.value && props.base && !Array.isArray(props.base)) {
        baseEl.value = base.value;
        return;
      }
      baseEl.value = baseFromSlotEl.value;
      return;
    }
    let toEl = base$.value;
    if (toEl.baseEl) {
      toEl = toEl.baseEl;
    }
    if (base$.value?.$el) {
      if (base$.value.$el.nodeType === Node.ELEMENT_NODE) {
        toEl = base$.value.$el;
      }
    }
    if (toEl?.nodeType !== Node.ELEMENT_NODE) {
      toEl = baseFromSlotEl.value;
    }
    baseEl.value = toEl;
  }, { flush: 'post' });

  return {
    base$,
    baseEl,
    baseSlot,
    base,
    baseFromSlotEl,
  };
}

function getBase(selector: BaseType, vm: ComponentInternalInstance) {
  if (!selector) return;

  let ret;

  if (selector === 'parent') {
    let el = vm?.proxy?.$el?.parentNode;
    let parentEl = el;
    while (el) {
      if (el?.hasAttribute('data-base-parent')) {
        parentEl = el;
        break;
      }
      el = el.parentNode;
    }
    ret = parentEl;
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
