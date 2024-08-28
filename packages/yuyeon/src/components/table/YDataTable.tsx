import { PropType, computed, defineComponent, provide, toRef } from 'vue';

import { useRender } from '../../composables/component';
import { useResizeObserver } from '../../composables/resize-observer';
import { toStyleSizeValue } from '../../util';
import { chooseProps, propsFactory } from '../../util/vue-component';
import { YDataTableBody, pressYDataTableBodyProps } from './YDataTableBody';
import { YDataTableControl } from './YDataTableControl';
import { YDataTableHead, pressYDataTableHeadProps } from './YDataTableHead';
import { YDataTableLayer } from './YDataTableLayer';
import { YTable, pressYTableProps } from './YTable';
import { createHeader, pressDataTableHeader } from './composibles/header';
import { pressDataTableItemsProps, useItems } from './composibles/items';
import { useOptions } from './composibles/options';
import {
  createPagination,
  pressDataTablePaginationProps,
  providePagination,
  usePaginatedItems,
} from './composibles/pagination';
import {
  pressDataTableSelectionProps,
  provideSelection,
} from './composibles/selection';
import {
  createSorting,
  pressDataTableSortProps,
  provideSorting,
} from './composibles/sorting';
import { YDataTableSlotProps } from './types';
import { useSortedItems } from './composibles/sorted-items';

export const pressDataTableProps = propsFactory(
  {
    ...pressYDataTableBodyProps(),
    width: [String, Number] as PropType<string | number>,
    search: String as PropType<string>,
    ...pressDataTableHeader(),
    ...pressDataTableItemsProps(),
    ...pressDataTableSortProps(),
    ...pressDataTableSelectionProps(),
    ...pressYDataTableHeadProps(),
    ...pressYTableProps(),
  },
  'DataTable',
);

export const YDataTable = defineComponent({
  name: 'YDataTable',
  props: {
    ...pressDataTablePaginationProps(),
    ...pressDataTableProps(),
  },
  emits: {
    'update:modelValue': (value: any[]) => true,
    'update:page': (page: number) => true,
    'update:pageSize': (pageSize: number) => true,
    'update:sortBy': (sortBy: any) => true,
    'update:options': (options: any) => true,
    'click:row': (e: Event, value: { row: any }) => true,
    'scroll': (e: Event) => true,
  },
  setup(props, { slots, emit }) {
    const { page, pageSize } = createPagination(props);
    const { sortBy, multiSort } = createSorting(props);
    const { columns, headers } = createHeader(props, {
      enableSelect: toRef(props, 'enableSelect'),
    });
    const { items } = useItems(props, columns);
    const { toggleSort } = provideSorting({ sortBy, multiSort, page });
    const total = computed(() => items.value.length);
    const { startIndex, endIndex, pageLength, setPageSize, setPage } =
      providePagination({
        page,
        pageSize,
        total,
      });
    const { sortedItems } = useSortedItems(props, items, sortBy);
    const { paginatedItems } = usePaginatedItems({
      items: sortedItems,
      startIndex,
      endIndex,
      pageSize,
    });
    const {
      isSelected,
      select,
      selectAll,
      toggleSelect,
      someSelected,
      allSelected,
    } = provideSelection(props, { allItems: items, pageItems: items });

    const { resizeObservedRef: headObserveRef, contentRect: headRect } =
      useResizeObserver();

    useOptions(
      {
        page,
        pageSize,
        search: toRef(props, 'search'),
        sortBy,
      },
      emit,
    );

    provide('y-data-table', {
      toggleSort,
      sortBy,
      headRect,
    });

    const slotProps = computed<YDataTableSlotProps>(() => {
      return {
        // pagination
        page: page.value,
        pageSize: pageSize.value,
        pageLength: pageLength.value,
        setPageSize,
        setPage,
        // sorting
        sortBy: sortBy.value,
        toggleSort,
        // selection
        someSelected: someSelected.value,
        allSelected: allSelected.value,
        isSelected,
        select,
        selectAll,
        toggleSelect,
        //
        items: items.value,
        columns: columns.value,
        headers: headers.value,
      };
    });

    useRender(() => {
      const yDataTableHeadProps = chooseProps(props, YDataTableHead.props);
      const yDataTableBodyProps = chooseProps(props, YDataTableBody.props);
      const yTableProps = chooseProps(props, YTable.props);
      return (
        <YTable
          class={[
            'y-data-table',
            {
              'y-data-table--no-data':
                !props.loading && props.items.length < 1 && !props.hideNoData,
            },
          ]}
          {...yTableProps}
          style={{
            '--y-table-head-height': toStyleSizeValue(headRect.value?.height),
          }}
        >
          {{
            top: () => slots.top?.(slotProps.value),
            leading: () =>
              slots.leading ? (
                slots.leading(slotProps.value)
              ) : (
                <>
                  <YDataTableLayer
                    v-slots={slots}
                    slot-props={slotProps.value}
                  ></YDataTableLayer>
                </>
              ),
            default: () =>
              slots.default ? (
                slots.default(slotProps.value)
              ) : (
                <>
                  <thead ref={headObserveRef}>
                    <YDataTableHead
                      v-slots={slots}
                      {...yDataTableHeadProps}
                    ></YDataTableHead>
                  </thead>
                  {slots.thead?.(slotProps.value)}
                  <tbody>
                    <YDataTableBody
                      v-slots={slots}
                      {...yDataTableBodyProps}
                      items={paginatedItems.value}
                    ></YDataTableBody>
                  </tbody>
                  {slots.tbody?.(slotProps.value)}
                  {slots.tfoot?.(slotProps.value)}
                </>
              ),
            trailing: () => slots.trailing?.(slotProps.value),
            bottom: () =>
              slots.bottom ? (
                slots.bottom(slotProps.value)
              ) : (
                <YDataTableControl
                  v-slots={{
                    prepend: slots['control.prepend'],
                    append: slots['control.append'],
                  }}
                ></YDataTableControl>
              ),
          }}
        </YTable>
      );
    });
    return { paginatedItems };
  },
});

export type YDataTable = InstanceType<typeof YDataTable>;
