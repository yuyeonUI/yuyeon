<script setup lang="ts">
import {
  type PropType,
  computed,
  onBeforeUnmount,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';

import { toStyleSizeValue } from '@/util/ui';

const props = defineProps({
  layerProps: Object as PropType<any>,
  rowRef: Object as PropType<any>,
});

const activeRowRef = useTemplateRef<HTMLElement>('activeRowRef');
const observer = shallowRef<ResizeObserver | null>(null);
const rect = shallowRef<DOMRectList | null>(null);
const show = shallowRef(false);
const wrapperOffsetTop = shallowRef(0);
const scrollTop = shallowRef(0);

const rowEl = computed<HTMLElement | undefined>(() => {
  return props.rowRef?.$el;
});

const tableProvides = computed(() => props.layerProps?.YTable);

const wrapperEl = computed(() => tableProvides.value?.wrapperRef.value);

const wrapperRect = computed(() => tableProvides.value?.wrapperRect.value);

const headRect = computed(() => props.layerProps?.YDataTable?.headRect.value);

const styles = computed(() => {
  return {
    transform: `translateY(${scrollTop.value * -1 + (rowEl.value?.offsetTop ?? 0) - (headRect.value?.height ?? 40)}px)`,
    width: toStyleSizeValue(Number(wrapperRect.value?.clientWidth)),
    height: toStyleSizeValue(rect.value?.[0]?.height),
  };
});

watch(
  wrapperEl,
  (neo) => {
    if (neo) {
      onScrollWrapper();
      neo.addEventListener('scroll', onScrollWrapper);
    }
  },
  { immediate: true },
);

watch(
  rowEl,
  (neo) => {
    if (neo) {
      disconnectObserver();
      observer.value = new ResizeObserver(() => {
        rect.value = neo.getClientRects();
        wrapperOffsetTop.value = neo.offsetTop ?? 0;
      });
      observer.value.observe(neo);
      if (activeRowRef.value) {
        activeRowRef.value.classList.add('y-data-table-layer-row--change');
      }
      // for wrapper transition end
      setTimeout(() => {
        show.value = true;
      }, 300);
    } else {
      show.value = false;
      if (observer.value) {
        observer.value.disconnect();
      }
    }
  },
  { immediate: true },
);

watch(activeRowRef, (neo) => {
  if (neo) {
    neo.addEventListener('transitionend', () => {
      neo?.classList.remove('y-data-table-layer-row--change');
    });
  }
});

function onScrollWrapper() {
  requestAnimationFrame(() => {
    scrollTop.value = wrapperEl.value?.scrollTop ?? 0;
  });
}

function disconnectObserver() {
  if (observer.value) {
    observer.value.disconnect();
  }
  rect.value = null;
}

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }
});
</script>

<template>
  <div class="y-data-table-layer-row-layer">
    <div
      v-if="rowRef && show"
      ref="activeRowRef"
      class="y-data-table-layer-row"
      :style="styles"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.y-data-table-layer-row-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  clip-path: inset(0 -20px 0 -20px);
}

.y-data-table-layer-row {
  pointer-events: none;
  position: absolute;
  left: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--y-theme-primary);
  box-shadow: 0 0 2px 1px var(--y-theme-primary);

  &--change {
    transition: all 0.2s ease-in-out;
  }
}
</style>
