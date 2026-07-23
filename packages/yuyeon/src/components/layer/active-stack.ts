import {
  type ComponentInternalInstance,
  getCurrentInstance,
  type InjectionKey,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  type Ref,
  ref,
  unref,
  watch,
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
  openOnHover: boolean;
}

const activeLayers: ComponentInternalInstance[] = [];

function pushActiveLayer(
  vm: ComponentInternalInstance,
  layerEl: () => Element | null | undefined,
) {
  activeLayers.push(vm);
  nextTick(() => {
    const el = layerEl();
    if (el?.parentElement) {
      el.parentElement.appendChild(el);
    }
  });
}

function popActiveLayer(vm: ComponentInternalInstance) {
  const idx = activeLayers.indexOf(vm);
  if (idx > -1) activeLayers.splice(idx, 1);
}

/*
 * YLayer -> ActiveStack -> RelayStack
 * */

export function useActiveStack(
  props: ActiveStackProps,
  {
    active,
    pinned,
    rootEl,
    shouldClose,
  }: {
    active: Ref<boolean>;
    pinned: Ref<boolean>;
    rootEl: Ref<HTMLElement | null | undefined>;
    shouldClose: (e?: Event) => boolean;
  },
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
        pushActiveLayer(vm, () => unref(rootEl));
        if (props.relayStack !== false) {
          relayHandle = registerRelay({
            els: () => {
              const ex = exposed();
              return [unref(ex?.baseEl), unref(ex?.content$)];
            },
            layerEl: () => unref(rootEl),
            modal: () => !!unref(exposed()?.modal),
            preventCloseBubble: () => !!unref(exposed()?.preventCloseBubble),
            close: clear,
            shouldClose
          });
          relayId.value = relayHandle.id;
        }
      } else {
        if (!props.relayStack) {
          clear();
        }
        popActiveLayer(vm);
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
    if (!relayHandle && props.openOnHover) {
      active.value = false;
      pinned.value = false;
      return;
    }
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
