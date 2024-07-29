import { InjectionKey, PropType, Ref, computed, inject, provide } from 'vue';

import { useModelDuplex } from '../../../composables/communication';
import { deepEqual } from '../../../util';
import { wrapInArray } from '../../../util/array';
import { propsFactory } from '../../../util/vue-component';
import { DataTableProvideSelectionData } from '../types';
import { DataTableItemsProps } from './items';

export interface SelectableItem {
  key: string;
  value: any;
  selectable: boolean;
}

export interface DataTableSelectStrategy {
  showSelectAll: boolean;
  allSelected: (data: {
    allItems: SelectableItem[];
    pageItems: SelectableItem[];
  }) => SelectableItem[];
  select: (data: {
    items: SelectableItem[];
    value: boolean;
    selected: Set<unknown>;
  }) => Set<unknown>;
  selectAll: (data: {
    value: boolean;
    allItems: SelectableItem[];
    pageItems: SelectableItem[];
    selected: Set<unknown>;
  }) => Set<unknown>;
}

export const pressDataTableSelectionProps = propsFactory(
  {
    enableSelect: Boolean,
    selectStrategy: {
      type: [String, Object] as PropType<'single' | 'page' | 'all'>,
      default: 'page',
    },
    modelValue: {
      type: Array as PropType<readonly any[]>,
      default: () => [],
    },
    valueEqual: {
      type: Function as PropType<typeof deepEqual>,
      default: deepEqual,
    },
  },
  'YDataTable--selection',
);

type DataTableSelectionProps = Pick<DataTableItemsProps, 'itemKey'> & {
  modelValue: readonly any[];
  selectStrategy: 'single' | 'page' | 'all';
  'onUpdate:modelValue': ((value: any[]) => void) | undefined;
  valueEqual: (a: any, b: any) => boolean;
};

const singleSelectStrategy: DataTableSelectStrategy = {
  showSelectAll: false,
  allSelected: () => [],
  select: ({ items, value }) => {
    return new Set(value ? [items[0]?.value] : []);
  },
  selectAll: ({ selected }) => selected,
};

const pageSelectStrategy: DataTableSelectStrategy = {
  showSelectAll: true,
  allSelected: ({ pageItems }) => pageItems,
  select: ({ items, value, selected }) => {
    for (const item of items) {
      if (value) selected.add(item.value);
      else selected.delete(item.value);
    }

    return selected;
  },
  selectAll: ({ value, pageItems, selected }) =>
    pageSelectStrategy.select({ items: pageItems, value, selected }),
};

const allSelectStrategy: DataTableSelectStrategy = {
  showSelectAll: true,
  allSelected: ({ allItems }) => allItems,
  select: ({ items, value, selected }) => {
    for (const item of items) {
      if (value) selected.add(item.value);
      else selected.delete(item.value);
    }

    return selected;
  },
  selectAll: ({ value, allItems, selected }) =>
    allSelectStrategy.select({ items: allItems, value, selected }),
};

export const Y_DATA_TABLE_SELECTION_KEY: InjectionKey<
  ReturnType<typeof provideSelection>
> = Symbol.for('yuyeon.data-table.selection');

export function provideSelection(
  props: DataTableSelectionProps,
  {
    allItems,
    pageItems,
  }: { allItems: Ref<SelectableItem[]>; pageItems: Ref<SelectableItem[]> },
) {
  const selected = useModelDuplex(
    props,
    'modelValue',
    props.modelValue,
    (v) => {
      return new Set(
        wrapInArray(v).map((v) => {
          return (
            allItems.value.find((item) => props.valueEqual(v, item.value))
              ?.value ?? v
          );
        }),
      );
    },
    (v) => {
      return [...v.values()];
    },
  );

  const allSelectables = computed(() =>
    allItems.value.filter((item) => item.selectable),
  );

  const pageSelectables = computed(() =>
    pageItems.value.filter((item) => item.selectable),
  );

  const selectStrategy = computed(() => {
    if (typeof props.selectStrategy === 'object') {
      return props.selectStrategy;
    }
    switch (props.selectStrategy) {
      case 'single':
        return singleSelectStrategy;
      case 'all':
        return allSelectStrategy;
      case 'page':
      default:
        return pageSelectStrategy;
    }
  });

  function isSelected(items: SelectableItem | SelectableItem[]) {
    return wrapInArray(items).every((item) => selected.value.has(item.value));
  }

  function isSomeSelected(items: SelectableItem | SelectableItem[]) {
    return wrapInArray(items).some((item) => selected.value.has(item.value));
  }

  function select(items: SelectableItem[], value: boolean) {
    selected.value = selectStrategy.value.select({
      items,
      value,
      selected: new Set(selected.value),
    });
  }

  function toggleSelect(item: SelectableItem) {
    select([item], !isSelected([item]));
  }

  function selectAll(value: boolean) {
    selected.value = selectStrategy.value.selectAll({
      value,
      allItems: allSelectables.value,
      pageItems: pageSelectables.value,
      selected: new Set(selected.value),
    });
  }

  const selectables = computed(() => {
    return selectStrategy.value.allSelected({
      allItems: allSelectables.value,
      pageItems: pageSelectables.value,
    });
  });

  const someSelected = computed(() => {
    return isSomeSelected(pageSelectables.value);
  });

  const allSelected = computed(() => {
    return isSelected(selectables.value);
  });

  const data: DataTableProvideSelectionData = {
    toggleSelect,
    select,
    selectAll,
    isSelected,
    isSomeSelected,
    someSelected,
    allSelected,
    showSelectAll: selectStrategy.value.showSelectAll,
    selectables,
  };

  provide(Y_DATA_TABLE_SELECTION_KEY, data);

  return data;
}

export function useSelection() {
  const data = inject(Y_DATA_TABLE_SELECTION_KEY);
  if (!data) {
    throw new Error(`Not provided: ${Y_DATA_TABLE_SELECTION_KEY.description}`);
  }

  return data;
}
