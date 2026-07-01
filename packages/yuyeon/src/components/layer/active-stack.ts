import type { ComponentInternalInstance, InjectionKey, Ref } from 'vue';
import {
  getCurrentInstance,
  inject,
  provide,
  shallowRef,
  unref,
  watch,
} from 'vue';

import { registerRelay } from './relay-stack';

export interface ActiveStackProvide {
  push: (instance: any) => void;
  pop: (instance?: any) => void;
  clear: () => void;
  vm: ComponentInternalInstance;
}

export const YUYEON_ACTIVE_STACK_KEY: InjectionKey<ActiveStackProvide> =
  Symbol.for('yuyeon.active-stack');

interface YLayerExposed {
  base$?: any;
  content$?: any;
  baseEl?: any;
  active?: Ref<boolean>;
  modal?: boolean;
  preventCloseBubble?: boolean;
}

export function useActiveStack(active: Ref<boolean>) {
  const parent = inject(YUYEON_ACTIVE_STACK_KEY, null);
  const children = shallowRef<any[]>([]);
  const vm = getCurrentInstance()!;

  let relayHandle: ReturnType<typeof registerRelay> | null = null;

  function exposed(): YLayerExposed | undefined {
    return vm.exposed as YLayerExposed | undefined;
  }

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
    if (unref(exposed()?.modal)) return;
    active.value = false;
  }

  function handleOutsideClick(e: Event) {
    // if (!relayHandle || !isTopRelay(relayHandle.id)) return;
    // relayOutsideClick(e);
  }

  watch(active, (neo) => {
    if (neo) {
      parent?.push(vm);
      relayHandle = registerRelay({
        els: () => {
          const ex = exposed();
          return [unref(ex?.baseEl), unref(ex?.content$)];
        },
        modal: () => !!unref(exposed()?.modal),
        preventCloseBubble: () => !!unref(exposed()?.preventCloseBubble),
        close: clear,
      });
    } else {
      parent?.pop(vm);
      relayHandle?.unregister();
      relayHandle = null;
    }
  });

  provide(YUYEON_ACTIVE_STACK_KEY, {
    push,
    pop,
    clear,
    vm,
  });

  return {
    push,
    pop,
    parent,
    children,
    handleOutsideClick,
  };
}
