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
  cancelOpenDelay?: () => void;
  suppressNextFocusOpen?: () => void;
}

interface ActiveStackProps {
  relayStack?: boolean;
  openOnHover: boolean;
  closeOnEscape: boolean;
}

interface ActiveLayer {
  vm: ComponentInternalInstance;
  close: () => void;
  closeOnEscape: () => boolean;
  shouldClose: (e?: Event) => boolean;
}

const activeLayers: ActiveLayer[] = [];
let listening = false;

function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || e.defaultPrevented) return;

  const topLayer = activeLayers[activeLayers.length - 1];
  if (!topLayer) return;

  const canClose = topLayer.closeOnEscape() && topLayer.shouldClose(e);

  // Consume Escape for the top layer even when it is persistent, so an
  // underlying layer cannot react to the same key press.
  e.preventDefault();
  e.stopPropagation();

  if (canClose) {
    focusBaseIfContentFocused(topLayer.vm);
    topLayer.close();
  }
}

function focusBaseIfContentFocused(vm: ComponentInternalInstance) {
  if (typeof document === 'undefined') return;

  const exposed = vm.exposed as YLayerExposed | undefined;
  const content = unref(exposed?.content$) as Element | undefined;
  const activeElement = document.activeElement;

  if (!content || !activeElement || !content.contains(activeElement)) {
    return;
  }

  const base = unref(exposed?.baseEl) as HTMLElement | undefined;
  if (base) {
    exposed?.suppressNextFocusOpen?.();
    base.focus();
  }
}

function ensureKeydownListener() {
  if (listening || typeof document === 'undefined') return;

  document.addEventListener('keydown', handleGlobalKeydown);
  listening = true;
}

function teardownKeydownListener() {
  if (!listening || typeof document === 'undefined') return;

  document.removeEventListener('keydown', handleGlobalKeydown);
  listening = false;
}

function pushActiveLayer(
  vm: ComponentInternalInstance,
  layerEl: () => Element | null | undefined,
  layer: Omit<ActiveLayer, 'vm'>,
) {
  activeLayers.push({ vm, ...layer });
  ensureKeydownListener();
  nextTick(() => {
    const el = layerEl();
    if (el?.parentElement) {
      el.parentElement.appendChild(el);
    }
  });
}

function popActiveLayer(vm: ComponentInternalInstance) {
  const idx = activeLayers.findIndex((layer) => layer.vm === vm);
  if (idx > -1) {
    activeLayers.splice(idx, 1);
  }
  if (activeLayers.length === 0) {
    teardownKeydownListener();
  }
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
        pushActiveLayer(vm, () => unref(rootEl), {
          close: () => {
            exposed()?.cancelOpenDelay?.();
            active.value = false;
            pinned.value = false;
          },
          closeOnEscape: () => props.closeOnEscape,
          shouldClose,
        });
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
    popActiveLayer(vm);
    parent?.pop(vm);
  });

  function exposed(): YLayerExposed | undefined {
    return vm.exposed as YLayerExposed | undefined;
  }

  function push(instance: any) {
    children.value.push(instance);
  }

  function pop(instance?: any) {
    if (instance !== undefined) {
      const index = children.value.findIndex((child) => child === instance);
      if (index > -1) children.value.splice(index, 1);
      return;
    }
    children.value.pop();
  }

  function clear() {
    if (unref(exposed()?.modal)) return;
    exposed()?.cancelOpenDelay?.();
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
