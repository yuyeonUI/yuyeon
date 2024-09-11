import { type ExtractPropTypes, computed } from 'vue';

import { pressItemsPropsOptions } from '@/abstract/items';
import { deepEqual, getPropertyFromItem } from '@/util/common';
import { propsFactory } from '@/util/component';

export interface ListItem<T = any> {
  value: any;
  text: string;
  hide: boolean;
  disabled: boolean;
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
  const ret: ListItem[] = [];
  for (const item of items) {
    ret.push(refineListItem(props, item));
  }
  return ret;
}

export function refineListItem(
  props: Omit<ListItemProps, 'items'>,
  item: any,
): ListItem {
  const hide = !!item?.hide;
  const disabled = !!item?.disabled;
  const text = getPropertyFromItem(item, props.itemText, item);
  const value = props.returnItem
    ? item
    : getPropertyFromItem(item, props.itemKey, text);
  const children = getPropertyFromItem(item, props.itemChildren);

  return {
    value,
    text,
    hide,
    disabled,
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

  function toRefineItems(values: any[]) {
    return values
      .filter(
        (v) => v !== null || items.value.some((item) => item.value === null),
      )
      .map((v) => {
        const found = items.value.find((item) => deepEqual(v, item.value));
        return found ?? refineListItem(props, v);
      });
  }

  function toEmitItems(items: any[]) {
    return props.returnItem
      ? items.map(({ raw }) => raw)
      : items.map(({ value }) => value);
  }

  return {
    items,
    toEmitItems,
    toRefineItems,
  };
}
