import {
  type ComponentInternalInstance,
  getCurrentInstance,
  type InjectionKey,
  inject,
  provide,
  type Ref,
  ref,
  unref,
  watch,
  onBeforeUnmount,
} from 'vue';

import { isTopRelay, registerRelay, relayOutsideClick } from './relay-stack';

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

export function useActiveStack(
  props: ActiveStackProps,
  active: Ref<boolean>,
  pinned: Ref<boolean>,
) {
  const parent = inject(YUYEON_ACTIVE_STACK_KEY, null);
  const children = ref<any[]>([]);
  const vm = getCurrentInstance()!;
  const relayId = ref<number>();
  let relayHandle: ReturnType<typeof registerRelay> | null = null;

  watch(
    active,
    (neo) => {
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
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    relayHandle?.unregister();
    relayHandle = null;
  });

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
    pinned.value = false;
  }

  function handleOutsideClick(e: Event) {
    if (!relayHandle || !isTopRelay(relayHandle.id)) return;
    relayOutsideClick(e);
  }

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
    handleOutsideClick,
  };
}
