import { CSSProperties, defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { toStyleSizeValue } from '../../util/ui';
import { propsFactory } from '../../util/vue-component';
import { YIconSort } from '../icons/YIconSort';
import { YDataTableCell } from './YDataTableCell';
import { useHeader } from './composibles/header';
import { useSelection } from './composibles/selection';
import { useSorting } from './composibles/sorting';

import { YIconCheckbox } from '../icons';
import { InternalDataTableHeader } from './types';

export const pressYDataTableHeadProps = propsFactory(
  {
    multiSort: Boolean,
    sortAscIcon: {
      type: String,
      default: '@sortAsc',
    },
    sortDescIcon: {
      type: String,
      default: '@sortDesc',
    },
    dualSortIcon: Boolean,
    sticky: Boolean,
  },
  'YDataTableHead',
);

export const YDataTableHead = defineComponent({
  name: 'YDataTableHead',
  components: {
    YDataTableCell,
  },
  props: {
    ...pressYDataTableHeadProps(),
  },
  setup(props, { slots }) {
    const { toggleSort, sortBy, isSorted } = useSorting();
    const { someSelected, allSelected, selectAll, showSelectAll, selectables } =
      useSelection();
    const { columns, headers } = useHeader();

    const getFixedStyles = (
      column: InternalDataTableHeader,
      y: number,
    ): CSSProperties | undefined => {
      if (!props.sticky && !column.fixed) return undefined;

      return {
        position: 'sticky',
        zIndex: column.fixed ? 4 : props.sticky ? 3 : undefined,
        left: column.fixed ? toStyleSizeValue(column.fixedOffset) : undefined,
        top: props.sticky
          ? `calc(var(--v-table-header-height) * ${y})`
          : undefined,
      };
    };

    function onClick(e: Event) {
      //
    }

    function getSortDirection(column: InternalDataTableHeader) {
      const found = sortBy.value.find((by) => by.key === column.key);
      if (!found) {
        return undefined;
      }
      if (found.order === 'asc') {
        return 'asc';
      }
      if (found.order === 'desc') {
        return 'desc';
      }
    }

    const YDataTableTh = ({
      column,
      x,
      y,
    }: {
      column: InternalDataTableHeader;
      x: number;
      y: number;
    }) => {
      return (
        <YDataTableCell
          type="head"
          align={column.align}
          fixed={
            column.fixed ? (column.lastFixed ? 'trail' : 'lead') : undefined
          }
          class={[
            'y-data-table-header',
            {
              'y-data-table-header--sortable': column.sortable,
              'y-data-table-header--sorted': isSorted(column),
              'y-data-table-header--select': column.key === 'data-table-select',
            },
          ]}
          style={{
            width: toStyleSizeValue(column.width),
            minWidth: toStyleSizeValue(column.width),
            ...getFixedStyles(column, y),
          }}
          {...{ rowspan: column.rowspan, colspan: column.colspan }}
          onClick={onClick}
        >
          {{
            default: () => {
              const headerSlotName = `header.${column.key}` as const;
              const headerSlotProps = {
                column,
                selectAll,
                isSorted,
                toggleSort,
                sortBy: sortBy.value,
                someSelected: someSelected.value,
                allSelected: allSelected.value,
                selectables: selectables.value,
                getSortDirection,
              };

              if (slots[headerSlotName]) {
                return slots[headerSlotName]?.(headerSlotProps);
              }

              if (column.key === 'data-table-select') {
                return (
                  slots['header.data-table-select']?.(headerSlotProps) ??
                  (showSelectAll && (
                    <YIconCheckbox
                      checked={allSelected.value}
                      indeterminate={!allSelected.value && someSelected.value}
                      disabled={selectables.value.length < 1}
                      {...{
                        onClick: (e: MouseEvent) => {
                          e.stopPropagation();
                          selectAll(!allSelected.value);
                        },
                      }}
                    ></YIconCheckbox>
                  ))
                );
              }

              return (
                <div class="y-data-table-header__content">
                  <span class="y-data-table-header__text">{column.text}</span>
                  <span
                    class={[
                      'y-data-table-header__sorting-icon',
                      {
                        'y-data-table-header__sorting-icon--disabled':
                          !column.sortable,
                      },
                    ]}
                    onClick={
                      column.sortable
                        ? (e) => {
                            e.stopPropagation();
                            toggleSort(column);
                          }
                        : undefined
                    }
                  >
                    <YIconSort
                      disabled={!column.sortable}
                      direction={getSortDirection(column)}
                    ></YIconSort>
                  </span>
                </div>
              );
            },
          }}
        </YDataTableCell>
      );
    };

    useRender(() => {
      return (
        <>
          {slots.head
            ? slots.head?.(props)
            : headers.value.map((row, y) => (
                <tr>
                  {row.map((column, x) => (
                    <YDataTableTh column={column} x={x} y={y} />
                  ))}
                </tr>
              ))}
        </>
      );
    });
  },
});

export type YDataTableHead = InstanceType<typeof YDataTableHead>;
