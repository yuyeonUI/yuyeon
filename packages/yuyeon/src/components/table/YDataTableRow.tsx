import { type PropType, computed } from 'vue';

import { useRender } from '@/composables/component';
import { getPropertyFromItem } from '@/util/common';
import { defineComponent } from '@/util/component';
import { propsFactory } from '@/util/component';

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

    const selected = computed(() => props.item && isSelected(props.item));

    function arrayClasses(classes: string | string[]) {
      const ret: string[] = [];
      if (typeof classes === 'string') {
        ret.push(classes);
      }
      if (Array.isArray(classes)) {
        classes.forEach((c) => {
          if (typeof c === 'string') ret.push(c);
        });
      }
      return ret;
    }

    useRender(() => {
      return (
        <tr
          class={[
            'y-data-table__row',
            { 'y-data-table__row--selected': selected.value },
          ]}
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
                selected: selected.value,
                toggleSelect,
              };

              const classes = computed(() => {
                const ret: string[] = [];
                if (typeof column.classes === 'function') {
                  const result = column.classes.call(
                    null,
                    slotProps.item,
                    slotProps.index,
                    column,
                  );
                  if (result) {
                    ret.push(...arrayClasses(result));
                  }
                } else if (column.classes) {
                  ret.push(...arrayClasses(column.classes));
                }

                return ret;
              });

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
                    ...classes.value,
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
