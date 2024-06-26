import { PropType, defineComponent, provide } from 'vue';

import { useRender } from '../../composables/component';
import { useResizeObserver } from '../../composables/resize-observer';
import { toStyleSizeValue } from '../../util/ui';
import { propsFactory } from '../../util/vue-component';

import './YTable.scss';

export const pressYTableProps = propsFactory(
  {
    tag: {
      type: String as PropType<string>,
      default: 'div',
    },
    fixedHead: {
      type: Boolean as PropType<boolean>,
    },
    height: {
      type: [Number, String] as PropType<number | string>,
    },
    flexHeight: {
      type: Boolean as PropType<boolean>,
    },
    onScroll: Function as PropType<(e: Event) => void>,
  },
  'YTable',
);

export const YTable = defineComponent({
  name: 'YTable',
  props: {
    ...pressYTableProps(),
  },
  emits: ['scroll'],
  setup(props, { slots, emit }) {
    const { resizeObservedRef, contentRect } = useResizeObserver();
    const { resizeObservedRef: wrapperRef, contentRect: wrapperRect } =
      useResizeObserver();
    const { resizeObservedRef: tableRef, contentRect: tableRect } =
      useResizeObserver();
    provide('YTable', { containerRect: contentRect });

    function onScroll(e: Event) {
      emit('scroll', e);
    }

    useRender(() => {
      const ElTag = (props.tag as keyof HTMLElementTagNameMap) ?? 'div';
      const containerHeight = props.flexHeight
        ? contentRect.value?.height ?? props.height
        : props.height;
      return (
        <ElTag
          class={[
            'y-table',
            {
              'y-table--fixed-head': props.fixedHead,
              'y-table--fixed-height': props.flexHeight || props.height,
              'y-table--flex-height': props.flexHeight,
            },
          ]}
          style={{
            '--y-table-container-width': toStyleSizeValue(
              contentRect.value?.width,
            ),
            '--y-table-wrapper-width': toStyleSizeValue(
              wrapperRect.value?.width,
            ),
          }}
        >
          {slots.top?.()}
          {slots.default ? (
            <div ref={resizeObservedRef} class={['y-table__container']} >
              {slots.leading?.()}
              <div
                ref={wrapperRef}
                class={['y-table__wrapper']}
                style={{
                  height: toStyleSizeValue(containerHeight),
                }}
                onScroll={onScroll}
              >
                <table ref={tableRef}>{slots.default()}</table>
              </div>
              {slots.trailing?.()}
            </div>
          ) : (
            slots.container?.(resizeObservedRef, contentRect)
          )}
          {slots.bottom?.()}
        </ElTag>
      );
    });
  },
});

export type YTable = InstanceType<typeof YTable>;
