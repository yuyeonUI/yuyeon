import { Fragment, type PropType, computed, provide, ref, toRef } from 'vue';

import {
  pressDataTableExpandProps,
  provideExpand,
} from '@/components/table/composables/expand';
import {
  createHeader,
  pressDataTableHeader,
} from '@/components/table/composables/header';
import {
  pressDataTableItemsProps,
  useItems,
} from '@/components/table/composables/items';
import { useOptions } from '@/components/table/composables/options';
import {
  createPagination,
  pressDataTablePaginationProps,
  providePagination,
  usePaginatedItems,
} from '@/components/table/composables/pagination';
import { YDataTableInjectionKey } from '@/components/table/composables/provides';
import {
  pressDataTableSelectionProps,
  provideSelection,
} from '@/components/table/composables/selection';
import { useSortedItems } from '@/components/table/composables/sorted-items';
import {
  createSorting,
  pressDataTableSortProps,
  provideSorting,
} from '@/components/table/composables/sorting';
import { useRender } from '@/composables/component';
import { useResizeObserver } from '@/composables/resize-observer';
import { chooseProps, defineComponent, propsFactory } from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

import { YDataTableBody, pressYDataTableBodyProps } from './YDataTableBody';
import { YDataTableControl } from './YDataTableControl';
import { YDataTableHead, pressYDataTableHeadProps } from './YDataTableHead';
import { YDataTableLayer } from './YDataTableLayer';
import { YTable, pressYTableProps } from './YTable';
import { YDataTableSlotProps } from './types';

export const pressDataTableProps = propsFactory(
  {
    ...pressYDataTableBodyProps(),
    width: [String, Number] as PropType<string | number>,
    search: String as PropType<string>,
    hideDefaultTbody: Boolean,
    ...pressDataTableHeader(),
    ...pressDataTableItemsProps(),
    ...pressDataTableSortProps(),
    ...pressDataTableSelectionProps(),
    ...pressDataTableExpandProps(),
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
    'update:expanded': (expanded: any[]) => true,
    'click:row': (e: Event, value: { row: any }) => true,
    scroll: (e: Event) => true,
  },
  setup(props, { slots, emit }) {
    const TableBodyRef = ref();
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
    const { isExpanded, toggleExpand } = provideExpand(props);

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
        // expand
        isExpanded,
        toggleExpand,
        // selection
        someSelected: someSelected.value,
        allSelected: allSelected.value,
        isSelected,
        select,
        selectAll,
        toggleSelect,
        // matrix
        items: paginatedItems.value,
        columns: columns.value,
        headers: headers.value,
        //
        TableBodyRef,
      };
    });

    provide(YDataTableInjectionKey, {
      toggleSort,
      sortBy,
      headRect,
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
                <Fragment>
                  <thead ref={headObserveRef}>
                    <YDataTableHead
                      v-slots={slots}
                      {...yDataTableHeadProps}
                    ></YDataTableHead>
                  </thead>
                  {slots.thead?.(slotProps.value)}
                  {!props.hideDefaultTbody && (
                    <tbody>
                      <YDataTableBody
                        ref={TableBodyRef}
                        v-slots={slots}
                        {...yDataTableBodyProps}
                        items={slotProps.value.items}
                      ></YDataTableBody>
                    </tbody>
                  )}
                  {slots.tbody?.(slotProps.value)}
                  {slots.tfoot?.(slotProps.value)}
                </Fragment>
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
