import type { InjectionKey, Ref } from 'vue';
import {
  getCurrentInstance,
  inject,
  provide,
  shallowRef,
  watch,
  watchPostEffect,
} from 'vue';

export interface ActiveStackProvide {
  push: (instance: any) => void;
  pop: (instance?: any) => void;
  clear: () => void;
}

export const YUYEON_ACTIVE_STACK_KEY: InjectionKey<ActiveStackProvide> =
  Symbol.for('yuyeon.active-stack');

export function useActiveStack(
  props: { modal?: boolean },
  active: Ref<boolean>,
  sequential?: Ref<boolean | undefined>,
) {
  const parent = inject(YUYEON_ACTIVE_STACK_KEY, null);
  const children = shallowRef<any[]>([]);
  const vm = getCurrentInstance();

  function push(instance: any) {
    children.value.push(instance);
  }

  function pop(instance?: any) {
    if (instance) {
      const index = children.value.findIndex((child) => child === instance);
      if (index > -1) {
        children.value.splice(index, 1);
        return;
      }
    }
    children.value.pop();
  }

  function clear() {
    if (props?.modal) return;
    active.value = false;
    const bubble = () => {
      if (children.value.length === 0) {
        parent?.clear();
      }
    };
    if (!sequential?.value) {
      watchPostEffect(bubble);
    }
  }

  watch(active, (neo) => {
    if (neo) {
      parent?.push(vm);
    } else {
      parent?.pop(vm);
    }
  });

  provide(YUYEON_ACTIVE_STACK_KEY, {
    push,
    pop,
    clear,
  });

  return {
    push,
    pop,
    parent,
    children,
  };
}
