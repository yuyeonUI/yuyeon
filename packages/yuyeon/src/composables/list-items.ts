import type { ExtractPropTypes, Ref } from 'vue';
import { computed } from 'vue';

import { pressItemsPropsOptions } from '../abstract/items';
import { deepEqual, getPropertyFromItem } from '../util/common';
import { propsFactory } from '../util/vue-component';

export interface ListItem<T = any> {
  value: any;
  text: string;
  props: {
    [key: string]: any;
    value: any;
    text: string;
  };
  children?: ListItem<T>[];
  raw: T;
}

const listItemsPropsOptions = {
  ...pressItemsPropsOptions({
    itemKey: 'value',
    itemChildren: false,
  }),
  returnItem: Boolean,
};

type ListItemProps = ExtractPropTypes<typeof listItemsPropsOptions>;

export const pressListItemsPropsOptions = propsFactory(
  listItemsPropsOptions,
  'list-items',
);

export function refineListItems(
  props: Omit<ListItemProps, 'items'>,
  items: any[],
) {
  return items.map((item) => {
    return refineListItem(props, item);
  });
}

export function refineListItem(
  props: Omit<ListItemProps, 'items'>,
  item: any,
): ListItem {
  const text = getPropertyFromItem(item, props.itemText, item);
  const value = props.returnItem
    ? item
    : getPropertyFromItem(item, props.itemKey, text);
  const children = getPropertyFromItem(item, props.itemChildren);

  return {
    value,
    text,
    props: {
      value,
      text,
    },
    children: Array.isArray(children)
      ? refineListItems(props, children)
      : undefined,
    raw: item,
  };
}

export function useItems(props: ListItemProps) {
  const items = computed(() => refineListItems(props, props.items));
  return useRefineListItems(items, (v) => refineListItem(props, v));
}

export function useRefineListItems<T extends { value: unknown }>(
  items: Ref<T[]>,
  refine: (value: unknown) => T,
) {
  function toRefineItems(values: any[]): T[] {
    return values
      .filter(
        (v) => v !== null || items.value.some((item) => item.value === null),
      )
      .map((v) => {
        const found = items.value.find((item) => deepEqual(v, item.value));
        return found ?? refine(v);
      });
  }

  function toEmitItems(items: T[]) {
    return items.map(({ value }) => value);
  }

  return {
    items,
    toEmitItems,
    toRefineItems,
  };
}
