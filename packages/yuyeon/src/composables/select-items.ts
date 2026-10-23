import { computed, onMounted, type Ref } from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { type ListItem, useItems } from '@/composables/list-items';
import { wrapInArray } from '@/util/array';

export function useSelectItems(
  props: any,
  fieldInputRef: Ref<any>,
  emit: (event: 'change', ...args: any[]) => void,
  options: { allowUnmatchedSelection?: boolean } = {},
) {
  const { items, toRefineItems, toEmitItems } = useItems(props);

  function isNonSelectableItem(item: ListItem) {
    return item.raw?.type === 'header' || item.raw?.type === 'divider';
  }

  const setOut = (value: any) => {
    const emitValue = toEmitItems(wrapInArray(value));
    return props.multiple ? emitValue : (emitValue[0] ?? null);
  };

  const model = useModelDuplex(
    props,
    'modelValue',
    [],
    (value) => toRefineItems(value === null ? [null] : wrapInArray(value)),
    setOut,
  );

  const selections = computed<ListItem[]>(() => {
    const ret: ListItem[] = [];
    for (const value of model.value) {
      const found = items.value.find((item) => {
        return (
          !isNonSelectableItem(item) &&
          props.itemComparator(item.value, value.value)
        );
      });
      if (found) {
        ret.push(found);
      } else if (options.allowUnmatchedSelection && !isNonSelectableItem(value)) {
        ret.push(value);
      }
    }
    return ret;
  });

  const selected = computed(() => {
    return selections.value.map((selection) => selection?.props?.value);
  });

  function isSelected(item: ListItem) {
    return !!selections.value.find((selectedItem) => {
      return selectedItem?.value === item.value;
    });
  }

  function select(item: ListItem, event?: Event) {
    if (isNonSelectableItem(item)) return;

    let value: ListItem[];
    if (props.multiple) {
      const index = selections.value.findIndex((selectedItem) => {
        return selectedItem.value === item.value;
      });
      if (index === -1) {
        value = [...model.value, item];
      } else {
        value = model.value.slice();
        value.splice(index, 1);
      }
    } else {
      value = [item];
    }
    model.value = value;
    emit('change', setOut(value), event, fieldInputRef.value);
  }

  const displayText = computed(() => {
    if (props.multiple) {
      return selections.value.map((item) => item.text).join(', ');
    }
    return selections.value?.[0]?.text ?? '';
  });

  onMounted(() => {
    if (
      props.defaultSelect &&
      (props.modelValue === undefined ||
        (Array.isArray(props.modelValue) && props.modelValue.length === 0))
    ) {
      const firstSelectableItem = items.value.find(
        (item) => !isNonSelectableItem(item),
      );
      if (firstSelectableItem) {
        select(firstSelectableItem);
      }
    }
  });

  return {
    items,
    model,
    selections,
    selected,
    displayText,
    isSelected,
    isNonSelectableItem,
    setOut,
    select,
  };
}
