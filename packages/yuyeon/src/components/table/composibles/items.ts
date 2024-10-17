import { type PropType, type Ref, computed } from 'vue';

import { getPropertyFromItem } from '@/util/common';
import { propsFactory } from '@/util/component';

import { DataTableItem, InternalDataTableHeader } from '../types';

export type DataTableItemsProps = {
  items: any[];
  itemKey: any;
  itemSelectable: any;
  returnItem: boolean;
};

export const pressDataTableItemsProps = propsFactory(
  {
    items: {
      type: Array as PropType<DataTableItemsProps['items']>,
      default: () => [],
    },
    itemKey: {
      type: [String, Array, Function] as PropType<any>,
      default: 'id',
    },
    itemSelectable: {
      type: [String, Array, Function] as PropType<any>,
      default: null,
    },
    returnItem: Boolean,
  },
  'YDataTable--items',
);

export function updateItem(
  props: Omit<DataTableItemsProps, 'items'>,
  item: any,
  index: number,
  columns: InternalDataTableHeader[],
): DataTableItem {
  const key = getPropertyFromItem(item, props.itemKey);
  const value = props.returnItem ? item : key;
  let selectable;
  if (typeof props.itemSelectable === 'function') {
    selectable = !!props.itemSelectable(item);
  } else {
    selectable = getPropertyFromItem(item, props.itemSelectable, true);
  }

  const itemColumns = columns.reduce(
    (acc, column) => {
      acc[column.key] = getPropertyFromItem(item, column.value ?? column.key);
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return {
    index,
    key,
    value,
    selectable,
    columns: itemColumns,
    raw: item,
  };
}

export function updateItems(
  props: Omit<DataTableItemsProps, 'items'>,
  items: DataTableItemsProps['items'],
  columns: InternalDataTableHeader[],
): DataTableItem[] {
  return items.map((item, index) => updateItem(props, item, index, columns));
}

export function useItems(
  props: DataTableItemsProps,
  columns: Ref<InternalDataTableHeader[]>,
) {
  const items = computed(() => {
    return updateItems(props, props.items, columns.value);
  });
  return { items };
}
