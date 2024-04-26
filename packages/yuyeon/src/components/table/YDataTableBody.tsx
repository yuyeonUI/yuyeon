import { PropType, defineComponent, mergeProps } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util/vue-component';
import { YDataTableRow } from './YDataTableRow';
import { useHeader } from './composibles/header';
import { useSelection } from './composibles/selection';
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
  },
  'YDataTableBody',
);

export const YDataTableBody = defineComponent({
  name: 'YDataTableBody',
  props: {
    ...pressYDataTableBodyProps(),
  },
  emits: ['click:row'],
  setup(props, { slots, emit }) {
    const { columns } = useHeader();
    const { isSelected, toggleSelect } = useSelection();

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
                };
                const slotProps = {
                  ...stateProps,
                  props: mergeProps(
                    {
                      key: `item__${item.value ?? item.index}`,
                      item,
                      onClick: props['onClick:row']
                        ? (event: Event) => {
                            props['onClick:row']?.(event, { ...stateProps });
                          }
                        : undefined,
                      onDblclick: props['onDblclick:row']
                        ? (event: Event) => {
                            props['onDblclick:row']?.(event, { ...stateProps });
                          }
                        : undefined,
                      onContextmenu: props['onContextmenu:row']
                        ? (event: Event) => {
                            props['onContextmenu:row']?.(event, {
                              ...stateProps,
                            });
                          }
                        : undefined,
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
                };
                return (
                  <>
                    {slots.item ? (
                      slots.item(slotProps)
                    ) : (
                      <YDataTableRow
                        v-slots={slots}
                        {...slotProps.props}
                      ></YDataTableRow>
                    )}
                  </>
                );
              })}
        </>
      );
    });

    // end
    return {};
  },
});

export type YDataTableBody = InstanceType<typeof YDataTableBody>;
