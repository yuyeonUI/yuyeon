import { Fragment, type PropType, mergeProps, ref } from 'vue';

import { useExpand } from '@/components/table/composables/expand';
import { useHeader } from '@/components/table/composables/header';
import { useSelection } from '@/components/table/composables/selection';
import { useRender } from '@/composables/component';
import { defineComponent, propsFactory } from '@/util/component';

import { YDataTableRow } from './YDataTableRow';
import { DataTableItem, RowProps } from './types';

export const pressYDataTableBodyProps = propsFactory(
  {
    items: {
      type: Array as PropType<readonly DataTableItem[]>,
      default: () => [],
    },
    loading: [Boolean, String],
    loadingText: String,
    hideNoData: Boolean,
    noDataText: {
      type: String,
      default: '',
    },
    rowProps: [Function, Object] as PropType<RowProps<any>>,
    rowHeight: Number,
    'onClick:row': Function as PropType<(e: Event, value: any) => void>,
    'onDblclick:row': Function as PropType<(e: Event, value: any) => void>,
    'onContextmenu:row': Function as PropType<(e: Event, value: any) => void>,
    'onMousedown:row': Function as PropType<(e: Event, value: any) => void>,
    'onKeydown:row': Function as PropType<(e: Event, value: any) => void>,
  },
  'YDataTableBody',
);

export const YDataTableBody = defineComponent({
  name: 'YDataTableBody',
  props: {
    ...pressYDataTableBodyProps(),
  },
  emits: ['click:row', 'dblclick:row', 'contextmenu:row', 'mousedown:row'],
  setup(props, { slots }) {
    const { columns } = useHeader();
    const { isSelected, toggleSelect } = useSelection();
    const { isExpanded, toggleExpand } = useExpand();

    useRender(() => {
      if (props.loading) {
        return (
          <tr>
            <td colspan={columns.value.length} class={'y-data-table__loading'}>
              {slots.loading ? slots.loading() : <div>{props.loadingText}</div>}
            </td>
          </tr>
        );
      }
      if (!props.loading && props.items.length < 1 && !props.hideNoData) {
        return (
          <tr key="no-data" class="y-data-table__no-data">
            <td colspan={columns.value.length}>
              {slots['no-data']?.() ?? props.noDataText}
            </td>
          </tr>
        );
      }
      return (
        <>
          {slots.body
            ? slots.body?.(props)
            : props.items.map((item, index) => {
                const stateProps = {
                  index,
                  item: item.raw,
                  internalItem: item,
                  columns: columns.value,
                  isSelected,
                  toggleSelect,
                  isExpanded,
                  toggleExpand,
                };

                function onClick(event: Event, el: null | Element) {
                  props['onClick:row']?.(event, { ...stateProps, el });
                }

                function onDblclick(event: Event, el: null | Element) {
                  props['onDblclick:row']?.(event, { ...stateProps, el });
                }

                function onContextmenu(event: Event, el: null | Element) {
                  props['onContextmenu:row']?.(event, {
                    ...stateProps,
                    el,
                  });
                }

                function onMousedown(event: Event, el: null | Element) {
                  props['onMousedown:row']?.(event, { ...stateProps, el });
                }

                function onKeydown(event: Event, el: null | Element) {
                  props['onKeydown:row']?.(event, { ...stateProps, el });
                }

                const slotProps = {
                  ...stateProps,
                  props: mergeProps(
                    {
                      key: `item__${item.key ?? item.index}`,
                      item,
                      index,
                    },
                    typeof props.rowProps === 'function'
                      ? props.rowProps({
                          item: stateProps.item,
                          index: stateProps.index,
                          internalItem: stateProps.internalItem,
                        })
                      : props.rowProps,
                  ),
                  onClick,
                  onContextmenu,
                  onDblclick,
                  onMousedown,
                  onKeydown,
                };

                return (
                  <Fragment>
                    {slots.item ? (
                      slots.item(slotProps)
                    ) : (
                      <YDataTableRow
                        ref={(el) => {
                          item._bindRowRef(el);
                        }}
                        v-slots={slots}
                        {...slotProps.props}
                        onClick={props['onClick:row'] && onClick}
                        onContextmenu={
                          props['onContextmenu:row'] && onContextmenu
                        }
                        onDblclick={props['onDblclick:row'] && onDblclick}
                        onMousedown={props['onMousedown:row'] && onMousedown}
                        onKeydown={props['onKeydown:row'] && onKeydown}
                      ></YDataTableRow>
                    )}
                    {isExpanded(item) && slots['expanded-row']?.(slotProps)}
                  </Fragment>
                );
              })}
        </>
      );
    });
  },
});

export type YDataTableBody = InstanceType<typeof YDataTableBody>;
