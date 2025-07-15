import { type PropType, SlotsType, computed, shallowRef, watch } from 'vue';

import { useRender } from '@/composables';
import { defineComponent } from '@/util/component';

import {
  YDataTableLayerRow,
  type YDataTableLayerRowDefaultSlotProps,
} from './YDataTableLayerRow';

import './YDataTableLayerRows.scss';

export const YDataTableLayerRows = defineComponent({
  name: 'YDataTableLayerRows',
  props: {
    layerProps: Object as PropType<any>,
    items: Array as PropType<any[]>,
    classes: Function as PropType<(item: any) => string[] | string>,
    styles: Object as PropType<(item: any, originStyle: any) => any>,
    single: Boolean as PropType<boolean>,
  },
  slots: Object as SlotsType<{
    default: (slotProps: YDataTableLayerRowDefaultSlotProps) => any;
  }>,
  setup(props, { slots }) {
    // wrapper
    const wrapperObserver = shallowRef<ResizeObserver | null>(null);
    const wrapperOffsetTop = shallowRef(0);
    const scrollTop = shallowRef(0);
    const rowWidth = shallowRef(0);

    const wrapperEl = computed(
      () => props.layerProps?.YTable?.wrapperRef.value,
    );

    const headRect = computed(
      () => props.layerProps?.YDataTable?.headRect.value,
    );

    watch(
      wrapperEl,
      (neo) => {
        if (neo) {
          onScrollWrapper();
          neo.addEventListener('scroll', onScrollWrapper);
          wrapperObserver.value = new ResizeObserver(() => {
            wrapperOffsetTop.value = neo.offsetTop ?? 0;
            rowWidth.value = neo?.clientWidth ?? 0;
          });
          wrapperObserver.value.observe(neo);
        }
      },
      { immediate: true },
    );

    function onScrollWrapper() {
      requestAnimationFrame(() => {
        scrollTop.value = wrapperEl.value?.scrollTop ?? 0;
      });
    }

    useRender(() => (
      <div class="y-data-table-layer-rows">
        {props.items?.map((item) => {
          return (
            <YDataTableLayerRow
              item={item}
              head-rect={headRect}
              scroll-top={scrollTop.value}
              width={rowWidth.value}
              classes={props.classes}
              styles={props.styles}
              v-slot={slots}
            ></YDataTableLayerRow>
          );
        })}
      </div>
    ));
  },
});
