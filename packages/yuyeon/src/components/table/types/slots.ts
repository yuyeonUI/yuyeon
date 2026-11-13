import type { ExtractPropTypes, InjectionKey } from 'vue';

import type { useExpand } from '../composables/expand';
import type {
  YDataTableInjectionKey,
  YTableInjectionKey,
} from '../composables/provides';
import type { pressYDataTableBodyProps } from '../YDataTableBody';
import type { pressYDataTableControlPropsOptions } from '../YDataTableControl';
import type { pressYDataTableHeadProps } from '../YDataTableHead';
import type { InternalDataTableHeader } from './header';
import type {
  DataTableProvideSelectionData,
  DataTableProvideSortingData,
  SortOption,
  YDataTableSlotProps,
} from './index';
import type { DataTableItem } from './item';

type ExpandSlotProps = Pick<
  ReturnType<typeof useExpand>,
  'isExpanded' | 'toggleExpand'
>;

export type YDataTableHeaderSlotProps = {
  column: InternalDataTableHeader;
  selectAll: DataTableProvideSelectionData['selectAll'];
  isSorted: DataTableProvideSortingData['isSorted'];
  toggleSort: DataTableProvideSortingData['toggleSort'];
  sortBy: readonly SortOption[];
  someSelected: boolean;
  allSelected: boolean;
  selectables: DataTableProvideSelectionData['selectables']['value'];
  getSortDirection: (
    column: InternalDataTableHeader,
  ) => 'asc' | 'desc' | undefined;
};

export type YDataTableHeadSlots = {
  head: Readonly<ExtractPropTypes<ReturnType<typeof pressYDataTableHeadProps>>>;
  'header.data-table-select': YDataTableHeaderSlotProps;
  [name: `header.${string}`]: YDataTableHeaderSlotProps;
  [name: `header-text.${string}`]: YDataTableHeaderSlotProps;
};

export type YDataTableCellSlotProps = ExpandSlotProps & {
  index: number;
  item: any;
  internalItem: DataTableItem;
  columns: InternalDataTableHeader[];
  value: any;
  selected: boolean | undefined;
  toggleSelect: DataTableProvideSelectionData['toggleSelect'];
  column: InternalDataTableHeader;
  el: any;
};

export type YDataTableRowSlots = {
  'item.data-table-select': YDataTableCellSlotProps;
  [name: `item.${string}`]: YDataTableCellSlotProps;
};

type RowEventHandler = (event: Event, el: Element | null) => void;

export type YDataTableItemSlotProps = Omit<
  YDataTableCellSlotProps,
  'value' | 'selected' | 'column' | 'el'
> & {
  isSelected: DataTableProvideSelectionData['isSelected'];
  props: Record<string, any>;
  onClick: RowEventHandler;
  onContextmenu: RowEventHandler;
  onDblclick: RowEventHandler;
  onMousedown: RowEventHandler;
  onKeydown: RowEventHandler;
};

export type YDataTableBodySlots = YDataTableRowSlots & {
  loading: any;
  'no-data': any;
  body: Readonly<ExtractPropTypes<ReturnType<typeof pressYDataTableBodyProps>>>;
  item: YDataTableItemSlotProps;
  'expanded-row': YDataTableItemSlotProps;
};

export type YDataTableControlSlots = {
  prepend: Readonly<
    ExtractPropTypes<ReturnType<typeof pressYDataTableControlPropsOptions>>
  >;
  default: any;
  append: Readonly<
    ExtractPropTypes<ReturnType<typeof pressYDataTableControlPropsOptions>>
  >;
};

type InjectionValue<Key> =
  Key extends InjectionKey<infer Value> ? Value | undefined : never;

export type YDataTableLayerSlotProps = YDataTableSlotProps & {
  YTable: InjectionValue<typeof YTableInjectionKey>;
  YDataTable: InjectionValue<typeof YDataTableInjectionKey>;
};

export type YDataTableLayerSlots = {
  layer: YDataTableLayerSlotProps;
  'layer-head': YDataTableLayerSlotProps;
  'layer-body': YDataTableLayerSlotProps;
};

export type YDataTableSlots = YDataTableHeadSlots &
  YDataTableBodySlots &
  YDataTableLayerSlots & {
    top: YDataTableSlotProps;
    leading: YDataTableSlotProps;
    default: YDataTableSlotProps;
    thead: YDataTableSlotProps;
    tbody: YDataTableSlotProps;
    tfoot: YDataTableSlotProps;
    trailing: YDataTableSlotProps;
    bottom: YDataTableSlotProps;
    'control.prepend': YDataTableControlSlots['prepend'];
    'control.append': YDataTableControlSlots['append'];
  };
