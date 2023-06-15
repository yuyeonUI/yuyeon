import { PropType, computed, defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { useResizeObserver } from '../../composables/resize-observer';
import { toStyleSizeValue } from '../../util/ui';
import './YTable.scss';

export const YTable = defineComponent({
  name: 'YTable',
  props: {
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
  setup(props, { slots }) {
    const { resizeObservedRef, contentRect } = useResizeObserver();
    useRender(() => {
      const ElTag = (props.tag as keyof HTMLElementTagNameMap) ?? 'div';
      const containerHeight = props.flexHeight
        ? (contentRect.value?.height ?? props.height)
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
        >
          {slots.top?.()}
          {slots.default ? (
            <div
              class={['y-table__container']}
              ref={resizeObservedRef}
              style={{
                height: toStyleSizeValue(containerHeight),
              }}
            >
              {slots.leading?.()}
              <table>{slots.default()}</table>
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
