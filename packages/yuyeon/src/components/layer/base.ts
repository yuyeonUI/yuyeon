import {
  type ComponentInternalInstance,
  type ComponentPublicInstance,
  computed,
  getCurrentInstance,
  nextTick,
  type PropType,
  ref,
  watchEffect,
} from 'vue';

import { propsFactory } from '@/util/component';

export type BaseType =
  | string
  | Element
  | ComponentPublicInstance
  | [x: number, y: number]
  | undefined;

export const pressBasePropsOptions = propsFactory(
  {
    base: [String, Object, Array] as PropType<BaseType>,
    baseProps: Object as PropType<Record<string, any>>,
  },
  'YLayer.base',
);

interface BaseProps {
  base: BaseType;
  baseProps: Record<string, any> | undefined;
  modelValue?: boolean;
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

  watchEffect(
    () => {
      if (!base$.value) {
        if (!baseFromSlotEl.value && props.base && !Array.isArray(props.base)) {
          baseEl.value = base.value as HTMLElement;
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
    },
    { flush: 'post' },
  );

  // If the node is created before rendering or before its parent layer component, baseEl is looked up once more.
  nextTick(() => {
    if (vm?.proxy?.$el && !base.value) {
      baseEl.value = getBase(props.base, vm);
    }
  });

  return {
    /**
     * for templateRef from base slot
     */
    base$,
    baseEl,
    baseSlot,
    base,
    baseFromSlotEl,
  };
}

function getBase(selector: BaseType, vm: ComponentInternalInstance) {
  if (!selector) return;

  let ret: any;

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
