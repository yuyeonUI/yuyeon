import { computed } from 'vue';
import type { Ref } from 'vue';

export const Y_LAYER_GROUP_CLASS_NAME = 'y-layer-group';

export function useLayerGroup(target?: Ref<string | Element>) {
  const layerGroup = computed<string | HTMLElement>(() => {
    const refTarget = target?.value;
    let targetEl: Element = document.body;
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

  return { layerGroup };
}
