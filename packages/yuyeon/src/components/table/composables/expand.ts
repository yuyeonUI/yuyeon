import {
  type InjectionKey,
  type PropType,
  type Ref,
  inject,
  provide,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { propsFactory } from '@/util/component/props';

import type { DataTableItem } from '../types/item';

export const pressDataTableExpandProps = propsFactory(
  {
    enableExpand: Boolean,
    expanded: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
  },
  'YDataTable--expand',
);

type DataTableExpandProps = {
  enableExpand: boolean;
  expanded: readonly string[];
  'onUpdate:expanded': ((value: any[]) => void) | undefined;
};

const Y_DATA_TABLE_EXPAND_KEY: InjectionKey<{
  expands: Ref<Set<string>>;
  isExpanded: (item: DataTableItem) => boolean;
  expand: (item: DataTableItem, value: boolean) => void;
  toggleExpand: (item: DataTableItem) => void;
}> = Symbol.for('yuyeon.data-table.expand');

export function provideExpand(props: DataTableExpandProps) {
  const expands = useModelDuplex(
    props,
    'expanded',
    props.expanded ?? [],
    (v) => new Set(v),
    (v) => [...v],
  );

  function isExpanded(item: DataTableItem) {
    return expands.value.has(item.value);
  }

  function expand(item: DataTableItem, value: boolean) {
    const neo = new Set(expands.value);
    if (value) {
      neo.add(item.value);
    } else {
      neo.delete(item.value);
    }

    expands.value = neo;
  }

  function toggleExpand(item: DataTableItem) {
    expand(item, !isExpanded(item));
  }

  provide(Y_DATA_TABLE_EXPAND_KEY, {
    expands,
    isExpanded,
    expand,
    toggleExpand,
  });

  return {
    expands,
    isExpanded,
    expand,
    toggleExpand,
  };
}

export function useExpand() {
  const instance = inject(Y_DATA_TABLE_EXPAND_KEY);
  if (!instance) {
    throw new Error(`Not provided: ${Y_DATA_TABLE_EXPAND_KEY.description}`);
  }
  return instance;
}
