import { SelectableItem, provideSelection } from '../composibles/selection';
import { InternalDataTableHeader } from './header';

type ItemSlotBase<T> = {
  index: number;
  item: T;
  internalItem: DataTableItem<T>;
  selected: boolean;
  isSelected: ReturnType<typeof provideSelection>['isSelected'];
  toggleSelect: ReturnType<typeof provideSelection>['toggleSelect'];
};

export type ItemKeySlot<T> = ItemSlotBase<T> & {
  value: any;
  column: InternalDataTableHeader;
};

export interface DataTableItem<T = any> extends SelectableItem {
  index: number;
  columns: Record<string, any>;
  raw: T;
  rowRef?: any
}
