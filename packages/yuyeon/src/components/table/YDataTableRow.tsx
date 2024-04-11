import { PropType, computed, defineComponent, ref } from 'vue';

import { useRender } from '../../composables/component';
import { getPropertyFromItem } from '../../util/common';
import { propsFactory } from '../../util/vue-component';
import { YIconCheckbox } from '../icons';
import { YDataTableCell } from './YDataTableCell';
import { useHeader } from './composibles/header';
import { useSelection } from './composibles/selection';
import { CellProps, DataTableItem } from './types';

export const pressYDataTableRowProps = propsFactory(
  {
    index: Number as PropType<number>,
    onClick: Function as PropType<(...args: any[]) => void>,
    onContextmenu: Function as PropType<(...args: any[]) => void>,
    onDblclick: Function as PropType<(...args: any[]) => void>,
    onHover: Function as PropType<(...args: any[]) => void>,
  },
  'YDataTableRow',
);

export const YDataTableRow = defineComponent({
  name: 'YDataTableRow',
  props: {
    item: Object as PropType<DataTableItem>,
    cellProps: [Object, Function] as PropType<CellProps>,
    ...pressYDataTableRowProps(),
  },
  setup(props, { emit, slots }) {
    const { isSelected, toggleSelect } = useSelection();
    const { columns } = useHeader();

    useRender(() => {
      return (
        <tr
          class={['y-data-table__row']}
          onClick={props.onClick as any}
          onContextmenu={props.onContextmenu as any}
          onDblclick={props.onDblclick as any}
        >
          {props.item &&
            columns.value.map((column, colIndex) => {
              const item = props.item!;
              const slotProps = {
                index: props.index!,
                item: props.item!.raw,
                internalItem: props.item!,
                columns: columns.value,
                value: getPropertyFromItem(item.columns, column.key),
                selected: computed(() => isSelected(item)).value,
                toggleSelect,
              };

              const cellProps =
                typeof props.cellProps === 'function'
                  ? props.cellProps({
                      index: slotProps.index,
                      column,
                      internalItem: slotProps.internalItem,
                      item: slotProps.item,
                      value: slotProps.value,
                      selected: slotProps.selected,
                    })
                  : props.cellProps;

              return (
                <YDataTableCell
                  align={column.align}
                  fixed={
                    column.fixed
                      ? column.lastFixed
                        ? 'last'
                        : 'lead'
                      : undefined
                  }
                  fixedOffset={column.fixedOffset}
                  width={column.width}
                  maxWidth={column.maxWidth}
                  class={[
                    'y-data-table-data',
                    {
                      'y-data-table-data--select':
                        column.key === 'data-table-select',
                    },
                  ]}
                  {...cellProps}
                >
                  {{
                    default: () => {
                      const slotName = `item.${column.key}`;

                      if (slots[slotName]) {
                        return slots[slotName]?.(slotProps);
                      }

                      if (column.key === 'data-table-select') {
                        return (
                          slots['item.data-table-select']?.(slotProps) ?? (
                            <YIconCheckbox
                              checked={isSelected(item)}
                              disabled={!item.selectable}
                              {...{
                                onClick: (e: MouseEvent) => {
                                  e.stopPropagation();
                                  toggleSelect(item);
                                },
                              }}
                            ></YIconCheckbox>
                          )
                        );
                      }

                      return slotProps.value;
                    },
                  }}
                </YDataTableCell>
              );
            })}
        </tr>
      );
    });
  },
});

export type YDataTableRow = InstanceType<typeof YDataTableRow>;
