import { type PropType, computed, getCurrentInstance } from 'vue';

import { YButton } from '@/components/button/YButton';
import { useRender } from '@/composables/component';
import { getPropertyFromItem } from '@/util/common';
import { defineComponent } from '@/util/component';
import { propsFactory } from '@/util/component';

import { YIconCheckbox } from '../icons';
import { YDataTableCell } from './YDataTableCell';
import { useHeader } from '@/components/table/composables/header';
import { useSelection } from '@/components/table/composables/selection';
import { CellProps, DataTableItem, type FixedPropType } from './types';

export const pressYDataTableRowProps = propsFactory(
  {
    index: Number as PropType<number>,
    onHover: Function as PropType<(...args: any[]) => void>,
    onMousedown: Function as PropType<(...args: any[]) => void>,
    onClick: Function as PropType<(...args: any[]) => void>,
    onDblclick: Function as PropType<(...args: any[]) => void>,
    onContextmenu: Function as PropType<(...args: any[]) => void>,
    onKeydown: Function as PropType<(...args: any[]) => void>,
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
  emits: ['hover', 'mousedown', 'click', 'dblclick', 'contextmenu'],
  setup(props, { emit, slots }) {
    const vm = getCurrentInstance();
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

    function onMousedown(event: MouseEvent) {
      props.onMousedown?.(event, vm?.proxy?.$el);
    }

    function onClick(event: MouseEvent) {
      props.onClick?.(event, vm?.proxy?.$el);
    }

    function onContextmenu(event: MouseEvent) {
      props.onContextmenu?.(event, vm?.proxy?.$el);
    }

    function onDblclick(event: MouseEvent) {
      props.onDblclick?.(event, vm?.proxy?.$el);
    }

    function onKeydown(event: KeyboardEvent) {
      props.onKeydown?.(event, vm?.proxy?.$el);
    }

    useRender(() => {
      return (
        <tr
          class={[
            'y-data-table__row',
            { 'y-data-table__row--selected': selected.value },
          ]}
          onClick={props.onClick && onClick}
          onContextmenu={props.onContextmenu && onContextmenu}
          onDblclick={props.onDblclick && onDblclick}
          onMousedown={props.onMousedown && onMousedown}
          onKeydown={props.onKeydown && onKeydown}
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
                el: vm?.proxy?.$el,
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
                      ? (((column.fixed === 'right' ? 'trail' : 'lead') +
                          (column.lastFixed ? '-last' : '')) as FixedPropType)
                      : undefined
                  }
                  fixedOffset={column.fixedOffset}
                  rightOffset={column.rightOffset}
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
                            <YButton
                              variation={'text,small'}
                              disabled={!item.selectable}
                              onClick={(e: MouseEvent) => {
                                e.stopPropagation();
                                if (item.selectable) toggleSelect(item);
                              }}
                            >
                              <YIconCheckbox
                                checked={isSelected(item)}
                                disabled={!item.selectable}
                              ></YIconCheckbox>
                            </YButton>
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
