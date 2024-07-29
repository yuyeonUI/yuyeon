export type DataTableCompareFn<T = any> = (a: T, b: T) => number;
export type DataTableCellClassesFn = (
  item: any,
  index: number,
  header: any,
) => string | string[] | undefined;
