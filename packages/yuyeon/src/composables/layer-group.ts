import {
  type MaybeRef,
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  unref,
  watch,
} from 'vue';
import type { ComponentInternalInstance, Ref } from 'vue';

import { useYuyeon } from '@/index';

export const Y_LAYER_GROUP_CLASS_NAME = 'y-layer-group';

const layerGroupState = new WeakMap<HTMLElement, Set<any>>();

export function useLayerGroup(props: {
  layerGroup?: MaybeRef<string | Element | undefined>;
}) {
  const vm = getCurrentInstance()!;
  const yuyeon = useYuyeon();

  const layerGroup = computed<HTMLElement>(() => {
    let targetEl: Element = document.body;
    const rootEl = vm.root.proxy?.$el;
    if (rootEl) {
      targetEl = rootEl;
    }
    const refTarget = unref(props.layerGroup);
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
    let layerEl = targetEl.querySelector(
      `:scope > .${Y_LAYER_GROUP_CLASS_NAME}`,
    );
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
