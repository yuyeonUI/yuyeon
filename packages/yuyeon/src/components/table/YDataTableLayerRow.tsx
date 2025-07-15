import {
  type PropType,
  SlotsType,
  computed,
  onBeforeUnmount,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';

import { useRender } from '@/composables/component';
import { defineComponent } from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

export type YDataTableLayerRowDefaultSlotProps = {
  item: any;
  width: number | undefined;
  height: number | undefined;
  scrollTop: number;
};

export const YDataTableLayerRow = defineComponent({
  name: 'YDataTableLayerRow',
  props: {
    layerProps: Object as PropType<any>,
    item: Object as PropType<any>,
    width: {
      type: Number as PropType<number>,
    },
    scrollTop: {
      type: Number as PropType<number>,
      default: 0,
    },
    headRect: Object as PropType<DOMRect>,
    classes: Function as PropType<(item: any) => string[] | string>,
    styles: Object as PropType<(item: any, originStyle: any) => any>,
  },
  slots: Object as SlotsType<{
    default: (slotProps: YDataTableLayerRowDefaultSlotProps) => any;
  }>,
  setup(props, { slots }) {
    const observer = shallowRef<ResizeObserver | null>(null);

    const layerRowRef = useTemplateRef<HTMLElement>('layerRowRef');
    const rect = shallowRef<DOMRectList | null>(null);
    const show = shallowRef(false);

    const rowEl = ref();

    const computedStyles = computed(() => {
      const propStyles =
        props.styles?.(props.item, {
          width: props.width,
          height: rect.value?.[0]?.height,
        }) ?? {};

      return {
        transform: `translateY(${props.scrollTop * -1 + (rowEl.value?.offsetTop ?? 0) - (props.headRect?.height ?? 40)}px)`,
        width: toStyleSizeValue(propStyles?.width ?? props.width),
        height: toStyleSizeValue(propStyles?.height ?? rect.value?.[0]?.height),
      };
    });

    const computedClasses = computed(() => {
      const propClassResult = props.classes?.(props.item);
      return Array.isArray(propClassResult)
        ? propClassResult
        : [propClassResult];
    });

    watch(
      () => props.item?.rowRef.value,
      () => {
        rowEl.value = props.item?.rowRef.value?.$el;
      },
      {
        immediate: true,
      },
    );

    watch(
      rowEl,
      (neo, old) => {
        if (neo) {
          observer.value?.unobserve(neo);
          observer.value = new ResizeObserver(() => {
            rect.value = neo.getClientRects();
          });
          observer.value.observe(neo);
          show.value = true;
        } else {
          show.value = false;
          if (old && neo !== old) {
            observer.value?.unobserve(old);
          }
        }
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      if (observer.value) {
        observer.value.disconnect();
        observer.value = null;
      }
    });

    useRender(() => (
      <div
        ref={layerRowRef}
        v-show={show.value}
        class={['y-data-table-layer-row', ...computedClasses.value]}
        style={computedStyles.value}
      >
        {slots.default &&
          slots.default({
            item: props.item,
            width: props.width,
            height: rect.value?.[0]?.height,
            scrollTop: props.scrollTop,
          })}
      </div>
    ));
  },
});
