import { type PropType, computed, provide, ref, toRef } from 'vue';

import { useRender } from '@/composables/component';
import { useResizeObserver } from '@/composables/resize-observer';
import { chooseProps, defineComponent, propsFactory } from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

import { pressDataTableProps } from './YDataTable';
import { YDataTableBody } from './YDataTableBody';
import { YDataTableControl } from './YDataTableControl';
import { YDataTableHead } from './YDataTableHead';
import { YDataTableLayer } from './YDataTableLayer';
import { YTable } from './YTable';
import { createHeader } from './composibles/header';
import { useItems } from './composibles/items';
import { useOptions } from './composibles/options';
import {
  createPagination,
  pressDataTablePaginationProps,
  providePagination,
} from './composibles/pagination';
import { provideSelection } from './composibles/selection';
import { createSorting, provideSorting } from './composibles/sorting';
import { YDataTableSlotProps } from './types';

export const pressDataTableServerProps = propsFactory(
  {
    total: {
      type: [Number, String] as PropType<number | string>,
      required: true,
    },
    ...pressDataTablePaginationProps(),
    ...pressDataTableProps(),
  },
  'YDataTableServer',
);

export const YDataTableServer = defineComponent({
  name: 'YDataTableServer',
  components: {
    YTable,
    YDataTableLayer,
    YDataTableHead,
    YDataTableBody,
    YDataTableControl,
  },
  props: {
    ...pressDataTableServerProps(),
  },
  emits: {
    'update:modelValue': (value: any[]) => true,
    'update:page': (page: number) => true,
    'update:pageSize': (pageSize: number) => true,
    'update:sortBy': (sortBy: any) => true,
    'update:options': (options: any) => true,
    'click:row': (e: Event, value: { row: any }) => true,
  },
  setup(props, { slots, emit }) {
    const { page, pageSize } = createPagination(props);
    const { sortBy, multiSort } = createSorting(props);
    const total = computed(() => parseInt(props.total as string));
    const { columns, headers } = createHeader(props, {
      enableSelect: toRef(props, 'enableSelect'),
    });
    const { items } = useItems(props, columns);

    const { toggleSort } = provideSorting({ sortBy, multiSort, page });
    const { pageLength, setPageSize, setPage } = providePagination({
      page,
      pageSize,
      total,
    });
    const {
      isSelected,
      select,
      selectAll,
      toggleSelect,
      someSelected,
      allSelected,
    } = provideSelection(props, { allItems: items, pageItems: items });

    const headRect = ref<DOMRectReadOnly>();
    const { resizeObservedRef: headObserveRef } = useResizeObserver(
      (entries) => {
        requestAnimationFrame(
          () => (headRect.value = entries?.[0].contentRect),
        );
      },
    );

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
                    slotProps={slotProps.value}
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
                      items={items.value}
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
                  }}
                ></YDataTableControl>
              ),
          }}
        </YTable>
      );
    });
  },
});

export type YDataTableServer = InstanceType<typeof YDataTableServer>;
