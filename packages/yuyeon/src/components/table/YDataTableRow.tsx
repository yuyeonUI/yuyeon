import { PropType, defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { getPropertyFromItem } from '../../util/common';
import { propsFactory } from '../../util/vue-component';
import { YDataTableCell } from './YDataTableCell';
import { useHeader } from './composibles/header';
import { useSelection } from './composibles/selection';

import { YIconCheckbox } from '../icons';
import { DataTableItem } from './types';

export const pressYDataTableRowProps = propsFactory(
  {
    index: Number as PropType<number>,
    item: Object as PropType<DataTableItem>,
    onClick: Function as PropType<(e: MouseEvent) => void>,
  },
  'YDataTableRow',
);

export const YDataTableRow = defineComponent({
  name: 'YDataTableRow',
  props: {
    ...pressYDataTableRowProps(),
  },
  setup(props, { emit, slots }) {
    const { isSelected, toggleSelect } = useSelection();
    const { columns } = useHeader();

    useRender(() => {
      return (
        <tr class={['y-data-table__row']} onClick={(e) => emit('click:row', e)}>
          {props.item &&
            columns.value.map((column, colIndex) => (
              <YDataTableCell
                align={column.align}
                fixed={
                  column.fixed
                    ? column.lastFixed
                      ? 'trail'
                      : 'lead'
                    : undefined
                }
                fixedOffset={column.fixedOffset}
                width={column.width}
              >
                {{
                  default: () => {
                    const item = props.item!;
                    const slotName = `item.${column.key}`;
                    const slotProps = {
                      index: props.index,
                      item: props.item,
                      columns: columns.value,
                      isSelected,
                      toggleSelect,
                    };

                    if (slots[slotName]) {
                      return slots[slotName]?.(slotProps);
                    }

                    if (column.key === 'data-table-select') {
                      return (
                        slots['item.data-table-select']?.(slotProps) ?? (
                          <YIconCheckbox
                            checked={isSelected([item])}
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

                    return getPropertyFromItem(item.columns, column.key);
                  },
                }}
              </YDataTableCell>
            ))}
        </tr>
      );
    });
  },
});

export type YDataTableRow = InstanceType<typeof YDataTableRow>;
