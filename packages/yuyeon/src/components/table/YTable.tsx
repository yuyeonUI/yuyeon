import { type PropType, provide } from 'vue';

import { useRectMeasure } from '@/components/table/composibles/measure';
import { useRender } from '@/composables/component';
import { defineComponent, propsFactory } from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

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
    const { containerRef, wrapperRef, tableRef, containerRect, wrapperRect } =
      useRectMeasure();

    provide('YTable', { containerRect });

    function onScroll(e: Event) {
      emit('scroll', e);
    }

    useRender(() => {
      const ElTag = (props.tag as keyof HTMLElementTagNameMap) ?? 'div';
      const containerHeight = props.flexHeight
        ? containerRect.value?.height ?? props.height
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
              containerRect.value?.width,
            ),
            '--y-table-wrapper-width': toStyleSizeValue(
              wrapperRect.value?.width,
            ),
          }}
        >
          {slots.top?.()}
          {slots.default ? (
            <div ref={containerRef} class={['y-table__container']}>
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
            slots.container?.(containerRef, containerRect)
          )}
          {slots.bottom?.()}
        </ElTag>
      );
    });
  },
});

export type YTable = InstanceType<typeof YTable>;
