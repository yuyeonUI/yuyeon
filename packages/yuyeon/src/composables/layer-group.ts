import {computed, getCurrentInstance, onBeforeUnmount, watch} from 'vue';
import type { Ref, ComponentInternalInstance } from 'vue';

export const Y_LAYER_GROUP_CLASS_NAME = 'y-layer-group';

const layerGroupState = new WeakMap<HTMLElement, Set<any>>();

export function useLayerGroup(target?: Ref<string | Element>) {
  const vm = getCurrentInstance()!;

  const layerGroup = computed<HTMLElement>(() => {
    const refTarget = target?.value;
    let targetEl: Element = document.body;

    const rootEl = vm.root.vnode.el?.parentElement as HTMLElement;
    if (rootEl) {
      targetEl = rootEl;
    }

    if (typeof refTarget === 'string') {
      const el = document.querySelector(refTarget);
      if (el) {
        targetEl = el;
      }
    }
    if (refTarget && (refTarget as Element).nodeType === 1) {
      targetEl = refTarget as Element;
    }
    //
    let layerEl = targetEl.querySelector(`.${Y_LAYER_GROUP_CLASS_NAME}`);
    if (!layerEl) {
      layerEl = document.createElement('div');
      layerEl.className = Y_LAYER_GROUP_CLASS_NAME;
      targetEl.appendChild(layerEl);
    }
    return layerEl as HTMLElement;
  });

  watch(
    layerGroup,
    (neo, old) => {
      if (old && layerGroupState.has(old)) {
        layerGroupState.get(old)?.delete(vm);
      }
      if (!(layerGroupState.has(neo) && layerGroupState.get(neo))) {
        layerGroupState.set(neo, new Set());
      }
      layerGroupState.get(neo)?.add(vm);
    },
    { immediate: true },
  );

  function getActiveLayers() {
    const activeLayers: ComponentInternalInstance[] = [];
    const currentGroup = layerGroupState.get(layerGroup.value);
    currentGroup?.forEach((value) => {
      if (value?.ctx?.active && !value?.isUnmounted) {
        activeLayers.push(value);
      }
    });
    return activeLayers;
  }

  function unregister() {
    layerGroupState.get(layerGroup.value)?.delete(vm);
  }

  onBeforeUnmount(() => {
    unregister();
  });

  return { layerGroup, layerGroupState, getActiveLayers };
}
