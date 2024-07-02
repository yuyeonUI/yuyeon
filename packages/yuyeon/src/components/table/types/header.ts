import { type DataTableCellClassesFn, type DataTableCompareFn } from './common';

export type DataTableHeader = {
  key: string;
  text: string;
  value?: any;

  colspan?: number;
  rowspan?: number;
  fixed?: boolean;

  classes?: string | string[] | DataTableCellClassesFn;
  align?: 'start' | 'end' | 'center';
  width?: number | string;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean;
  sort?: DataTableCompareFn;
  mustSort?: boolean;
};

export type InternalDataTableHeader = DataTableHeader & {
  sortable: boolean;
  fixedOffset?: number;
  lastFixed?: boolean;
};
