import {
  computed,
  getCurrentInstance,
  ref,
  type Ref,
  watch,
  watchPostEffect,
} from 'vue';

import type { ListItem } from '@/composables/list-items';

type VirtualFocusOptions = {
  items: Readonly<Ref<ListItem[]>>;
  opened: Ref<boolean>;
  inputRef: Ref<any>;
  isNonSelectableItem: (item: ListItem) => boolean;
  idPrefix: string;
  hasCustomMenu: boolean;
  autocomplete: () => 'none' | 'list';
};

export function useVirtualFocus(options: VirtualFocusOptions) {
  const activeIndex = ref(-1);
  const navigableItems = computed(() =>
    options.items.value.filter(
      (item) =>
        !item.disabled && !item.hide && !options.isNonSelectableItem(item),
    ),
  );
  const activeItem = computed(
    () => navigableItems.value[activeIndex.value] ?? null,
  );
  const listId = options.hasCustomMenu
    ? undefined
    : `${options.idPrefix}-${getCurrentInstance()?.uid ?? 0}-options`;
  const activeOptionId = computed(() => {
    if (!listId || !activeItem.value) return undefined;
    const itemIndex = options.items.value.indexOf(activeItem.value);
    return itemIndex < 0 ? undefined : `${listId}-${itemIndex}`;
  });

  watch(navigableItems, () => {
    activeIndex.value =
      options.opened.value && navigableItems.value.length > 0 ? 0 : -1;
  });

  watch(
    options.opened,
    (isOpened) => {
      activeIndex.value =
        isOpened && navigableItems.value.length > 0 ? 0 : -1;
    },
    { flush: 'sync' },
  );

  watchPostEffect(() => {
    const input = options.inputRef.value?.input$ as
      | HTMLInputElement
      | undefined;
    if (!input) return;

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', options.autocomplete());
    input.setAttribute('aria-expanded', String(options.opened.value));
    input.setAttribute('aria-haspopup', 'listbox');
    if (listId) {
      input.setAttribute('aria-controls', listId);
    } else {
      input.removeAttribute('aria-controls');
    }
    if (activeOptionId.value) {
      input.setAttribute('aria-activedescendant', activeOptionId.value);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  });

  function moveActiveItem(direction: 1 | -1) {
    const count = navigableItems.value.length;
    if (count === 0) {
      activeIndex.value = -1;
    } else if (activeIndex.value === -1) {
      activeIndex.value = direction === 1 ? 0 : count - 1;
    } else {
      activeIndex.value = (activeIndex.value + direction + count) % count;
    }
  }

  function openOrMoveActiveItem(direction: 1 | -1) {
    if (!options.opened.value) {
      options.opened.value = true;
      const count = navigableItems.value.length;
      activeIndex.value =
        count === 0 ? -1 : direction === 1 ? 0 : count - 1;
      return;
    }

    moveActiveItem(direction);
  }

  function setActiveItem(item: ListItem | null) {
    activeIndex.value = item ? navigableItems.value.indexOf(item) : -1;
  }

  function resetActiveItem() {
    activeIndex.value = -1;
  }

  return {
    activeIndex,
    navigableItems,
    activeItem,
    activeOptionId,
    listId,
    moveActiveItem,
    openOrMoveActiveItem,
    setActiveItem,
    resetActiveItem,
  };
}
