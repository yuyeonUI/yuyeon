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
  },
  'YTable',
);

export const YTable = defineComponent({
  name: 'YTable',
  props: {
    ...pressYTableProps(),
  },
  setup(props, { slots }) {
    const { resizeObservedRef, contentRect } = useResizeObserver();
    const { resizeObservedRef: tableRef, contentRect: tableRect } =
      useResizeObserver();
    provide('YTable', { containerRect: contentRect });
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
            '--y-table-wrapper-width': toStyleSizeValue(tableRect.value?.width),
          }}
        >
          {slots.top?.()}
          {slots.default ? (
            <div class={['y-table__container']} ref={resizeObservedRef}>
              {slots.leading?.()}
              <div
                class={['y-table__wrapper']}
                style={{
                  height: toStyleSizeValue(containerHeight),
                }}
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
