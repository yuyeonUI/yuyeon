import { ComputedRef, Ref, UnwrapRef } from 'vue';

import { SelectableItem } from '../composibles/selection';
import type { DataTableCompareFn } from './common';
import type { DataTableHeader, InternalDataTableHeader } from './header';
import type { DataTableItem, ItemKeySlot } from './item';
import type { CellProps, RowProps } from './row';

export type {
  ItemKeySlot,
  RowProps,
  CellProps,
  DataTableHeader,
  InternalDataTableHeader,
  DataTableItem,
  DataTableCompareFn,
};

export type SortOption = { key: string; order?: boolean | 'asc' | 'desc' };

export type DataTableProvideSortingData = {
  sortBy: Ref<readonly SortOption[]>;
  toggleSort: (column: InternalDataTableHeader) => void;
  isSorted: (column: InternalDataTableHeader) => boolean;
};

export interface DataTableProvidePaginationData {
  page: Ref<number>;
  pageSize: Ref<number>;
  startIndex: ComputedRef<number>;
  endIndex: ComputedRef<number>;
  pageLength: ComputedRef<number>;
  total: Ref<number>;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
}

export interface DataTableProvideSelectionData {
  toggleSelect: (item: SelectableItem) => void;
  select: (items: SelectableItem[], value: boolean) => void;
  selectAll: (value: boolean) => void;
  isSelected: (items: SelectableItem | SelectableItem[]) => any;
  isSomeSelected: (items: SelectableItem | SelectableItem[]) => any;
  someSelected: ComputedRef<boolean>;
  allSelected: ComputedRef<any>;
  showSelectAll: boolean;
  selectables: ComputedRef<SelectableItem[]>;
}

export type YDataTableSlotProps = {
  // pagination
  page: number;
  pageSize: number;
  pageLength: number;
  setPageSize: DataTableProvidePaginationData['setPageSize'];
  // sorting
  sortBy: UnwrapRef<DataTableProvideSortingData['sortBy']>;
  toggleSort: DataTableProvideSortingData['toggleSort'];
  // selection
  someSelected: boolean;
  allSelected: boolean;
  isSelected: DataTableProvideSelectionData['isSelected'];
  select: DataTableProvideSelectionData['select'];
  selectAll: DataTableProvideSelectionData['selectAll'];
  toggleSelect: DataTableProvideSelectionData['toggleSelect'];
  //
  items: readonly DataTableItem[];
  columns: InternalDataTableHeader[];
  headers: InternalDataTableHeader[][];
};
