import {
  type DeepReadonly,
  type InjectionKey,
  type PropType,
  type Ref,
  inject,
  provide,
  toRef,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { propsFactory } from '@/util/component';

import type {
  DataTableProvideSortingData,
  InternalDataTableHeader,
  SortOption,
} from '../types';

const Y_DATA_TABLE_SORTING_KEY: InjectionKey<{
  sortBy: Ref<readonly SortOption[]>;
  toggleSort: (col: InternalDataTableHeader) => void;
  isSorted: (col: InternalDataTableHeader) => boolean;
}> = Symbol.for('yuyeon.data-table.sorting');

export const pressDataTableSortProps = propsFactory(
  {
    sortBy: {
      type: Array as PropType<DeepReadonly<SortOption[]>>,
      default: () => [],
    },
    multiSort: Boolean,
  },
  'YDataTable--sorting',
);

type SortProps = {
  sortBy: readonly SortOption[];
  'onUpdate:sortBy': ((value: any) => void) | undefined;
  multiSort: boolean;
};

export function createSorting(props: SortProps) {
  const sortBy = useModelDuplex(props, 'sortBy');
  const multiSort = toRef(props, 'multiSort');

  return { sortBy, multiSort };
}

export function provideSorting(options: {
  sortBy: Ref<readonly SortOption[]>;
  page?: Ref<number>;
  multiSort?: Ref<boolean>;
}) {
  const { sortBy, multiSort, page } = options;

  const toggleSort = (column: InternalDataTableHeader) => {
    let neo = sortBy.value?.map((v) => ({ ...v })) ?? [];
    const target = neo.find((v) => v.key === column.key);
    const sortOption: SortOption = { key: column.key, order: 'asc' };

    if (!target) {
      if (multiSort?.value) {
        neo = [...neo, sortOption];
      } else {
        neo = [sortOption];
      }
    } else if (target.order === 'desc') {
      if (column.mustSort) {
        target.order = 'asc';
      } else {
        neo = neo.filter((v) => v.key !== column.key);
      }
    } else {
      target.order = 'desc';
    }
    sortBy.value = neo;
    if (page) {
      page.value = 1;
    }
  };

  function isSorted(column: InternalDataTableHeader) {
    return !!sortBy.value.find((option) => option.key === column.key);
  }

  const data: DataTableProvideSortingData = { sortBy, toggleSort, isSorted };

  provide(Y_DATA_TABLE_SORTING_KEY, data);

  return data;
}

export function useSorting() {
  const data = inject(Y_DATA_TABLE_SORTING_KEY);
  if (!data) {
    throw new Error(`Not provided: ${Y_DATA_TABLE_SORTING_KEY.description}`);
  }
  return data;
}
