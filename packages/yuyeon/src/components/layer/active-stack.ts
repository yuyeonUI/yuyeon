import {
  type ComponentInternalInstance,
  getCurrentInstance,
  type InjectionKey,
  inject,
  provide,
  type Ref,
  ref,
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
  content$?: any;
  baseEl?: any;
  modal?: boolean;
  preventCloseBubble?: boolean;
}

interface ActiveStackProps {
  relayStack?: boolean;
}

export function useActiveStack(props: ActiveStackProps, active: Ref<boolean>) {
  const parent = inject(YUYEON_ACTIVE_STACK_KEY, null);
  const children = shallowRef<any[]>([]);
  const vm = getCurrentInstance()!;
  const relayId = ref<number>();
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

  watch(active, (neo) => {
    if (neo) {
      parent?.push(vm);
      if (props.relayStack !== false) {
        relayHandle = registerRelay({
          els: () => {
            const ex = exposed();
            return [unref(ex?.baseEl), unref(ex?.content$)];
          },
          modal: () => !!unref(exposed()?.modal),
          preventCloseBubble: () => !!unref(exposed()?.preventCloseBubble),
          close: clear,
        });
        relayId.value = relayHandle.id;
      }
    } else {
      if (!props.relayStack) {
        clear();
      }
      parent?.pop(vm);
      relayHandle?.unregister();
      relayHandle = null;
      relayId.value = undefined;
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
    relayId,
  };
}
