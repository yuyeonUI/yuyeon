import { ItemKeySlot } from './item';

export type RowProps<T> =
| Record<string, any>
| ((data: Pick<ItemKeySlot<T>, 'index' | 'item' | 'internalItem'>) => Record<string, any>)

export type CellProps<T = any> =
  | Record<string, any>
  | ((
  data: Pick<
    ItemKeySlot<T>,
    'index' | 'item' | 'internalItem' | 'value' | 'column' | 'selected'
  >,
) => Record<string, any>);
