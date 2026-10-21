import {
  computed,
  getCurrentInstance,
  mergeProps,
  ref,
  type SlotsType,
  shallowRef,
  watch,
  watchPostEffect,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { type ListItem, refineListItem } from '@/composables/list-items';
import { useSelectItems } from '@/composables/select-items';
import { useSelectMenu } from '@/composables/select-menu';
import { chooseProps, defineComponent } from '@/util/component';

import { YFieldInput } from '../field-input';
import { YIcon } from '../icon';
import { type ComboboxFilter, pressYComboboxPropsOptions } from './props';

import './YCombobox.scss';

const defaultFilter: ComboboxFilter = (item, search) => {
  return String(item.text ?? '')
    .toLocaleLowerCase()
    .includes(search.toLocaleLowerCase());
};

export const YCombobox = defineComponent<
  ReturnType<typeof pressYComboboxPropsOptions>
>({
  name: 'YCombobox',
  inheritAttrs: false,
  props: {
    ...pressYComboboxPropsOptions(),
  },
  emits: {
    'update:modelValue': () => true,
    'update:opened': (opened: boolean) => true,
    'update:search': (search: string) => true,
    'click:item': (item: any, event: MouseEvent) => true,
    change: (value: any) => true,
  },
  slots: Object as SlotsType<{
    base: any;
    leading: any;
    label: any;
    'helper-text': any;
    menu: any;
    'menu-prepend': any;
    'menu-append': any;
    'dropdown-icon': any;
    item: { item: any; selected: boolean; select: () => void };
    'item-leading': { item: any; selected: boolean; select: () => void };
    'item-trailing': { item: any; selected: boolean; select: () => void };
  }>,
  setup(props, { slots, attrs, expose, emit }) {
    const search = useModelDuplex(props, 'search', '');

    const fieldInputRef = ref<InstanceType<typeof YFieldInput>>();
    const focused = shallowRef(false);
    const activeIndex = ref(-1);

    const selectItems = useSelectItems(props, fieldInputRef, emit, {
      allowUnmatchedSelection: true,
    });

    const {
      items,
      model,
      selections,
      selected,
      setOut,
      isSelected,
      isNonSelectableItem,
      select,
    } = selectItems;

    const itemCache = shallowRef<ListItem[]>([]);
    const searchDirty = shallowRef(false);
    const lastSyncedSearch = shallowRef<string | null>(null);

    function cacheItem(item: ListItem) {
      if (props.returnItem || isNonSelectableItem(item)) return;

      const index = itemCache.value.findIndex((cached) =>
        props.itemComparator(cached.value, item.value),
      );
      const nextCache = [...itemCache.value];
      if (index === -1) {
        nextCache.push(item);
      } else {
        nextCache[index] = item;
      }
      itemCache.value = nextCache;
    }

    watch(
      [items, model, () => props.returnItem],
      () => {
        if (props.returnItem) {
          itemCache.value = [];
          return;
        }

        const selectedItems: ListItem[] = model.value.filter(
          (item: ListItem) => !isNonSelectableItem(item),
        );
        const nextCache = itemCache.value.filter((cached) =>
          selectedItems.some((item) =>
            props.itemComparator(cached.value, item.value),
          ),
        );

        for (const selectedItem of selectedItems) {
          const currentItem = items.value.find(
            (item) =>
              !isNonSelectableItem(item) &&
              props.itemComparator(item.value, selectedItem.value),
          );
          if (!currentItem) continue;

          const index = nextCache.findIndex((cached) =>
            props.itemComparator(cached.value, currentItem.value),
          );
          if (index === -1) {
            nextCache.push(currentItem);
          } else {
            nextCache[index] = currentItem;
          }
        }

        itemCache.value = nextCache;
      },
      { immediate: true },
    );

    const displayText = computed(() => {
      const displayItems = selections.value.map((selection) => {
        const currentItem = items.value.find(
          (item) =>
            !isNonSelectableItem(item) &&
            props.itemComparator(item.value, selection.value),
        );
        if (currentItem) return currentItem;

        return (
          itemCache.value.find((cached) =>
            props.itemComparator(cached.value, selection.value),
          ) ?? selection
        );
      });

      return props.multiple
        ? displayItems.map((item) => item.text).join(', ')
        : displayItems[0]?.text ?? '';
    });

    const searchText = computed(() => String(search.value ?? ''));

    watch(
      [displayText, selections],
      () => {
        if (searchDirty.value) return;

        if (selections.value.length === 0) {
          if (searchText.value === lastSyncedSearch.value) {
            search.value = '';
          }
          lastSyncedSearch.value = null;
          return;
        }

        if (!searchText.value || searchText.value === lastSyncedSearch.value) {
          search.value = displayText.value;
          lastSyncedSearch.value = displayText.value;
        }
      },
      { immediate: true },
    );

    const formValues = computed(() => {
      const value = setOut(model.value);
      const values = Array.isArray(value) ? value : [value];
      return values.filter((item) => item != null);
    });

    const visibleItems = computed(() => {
      if (!searchText.value || props.disableFilter) {
        return items.value;
      }
      const filter = props.filter ?? defaultFilter;
      return items.value.filter(
        (item) => !isNonSelectableItem(item) && filter(item, searchText.value),
      );
    });

    const navigableItems = computed(() =>
      visibleItems.value.filter(
        (item) => !item.disabled && !item.hide && !isNonSelectableItem(item),
      ),
    );

    const activeItem = computed(
      () => navigableItems.value[activeIndex.value] ?? null,
    );

    const listId = slots.menu
      ? undefined
      : `y-combobox-${getCurrentInstance()?.uid ?? 0}-options`;

    const activeOptionId = computed(() => {
      if (!listId || !activeItem.value) return undefined;
      const itemIndex = visibleItems.value.indexOf(activeItem.value);
      return itemIndex < 0 ? undefined : `${listId}-${itemIndex}`;
    });

    const selectMenu = useSelectMenu(props, slots, {
      items,
      selections,
      visibleItems,
      searchLoading: computed(() => !!props.searchLoading),
      activeOffset: computed(() => props.activeOffset),
      focusedItem: activeItem,
      isSelected,
      isNonSelectableItem,
      select: selectItem,
      contentClass: 'y-combobox__content',
      listId,
      getItemId: listId ? (_item, index) => `${listId}-${index}` : undefined,
      openOnClickBase: false,
      preserveFocusOnItemMousedown: true,
    });

    watch(navigableItems, () => {
      activeIndex.value = -1;
    });

    const { menuRef, opened, baseEl, onBlur, renderMenu } = selectMenu;

    watch(opened, (isOpened) => {
      if (!isOpened) {
        activeIndex.value = -1;
      }
    });

    watchPostEffect(() => {
      const input = (fieldInputRef.value as any)?.input$ as
        | HTMLInputElement
        | undefined;
      if (!input) return;

      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', props.readonly ? 'none' : 'list');
      input.setAttribute('aria-expanded', String(opened.value));
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

    function selectItem(item: ListItem, event?: Event) {
      activeIndex.value = -1;
      cacheItem(item);
      select(item, event);
      if (props.multiple) {
        search.value = '';
        searchDirty.value = true;
        lastSyncedSearch.value = null;
      } else {
        search.value = item.text;
        searchDirty.value = false;
        lastSyncedSearch.value = item.text;
      }
    }

    function onFocus() {
      if (props.disabled) return;
      focused.value = true;
      if (!props.readonly) {
        search.value = displayText.value;
        searchDirty.value = false;
        lastSyncedSearch.value = displayText.value;
      }
      opened.value = true;
    }

    function onClick() {
      if (!props.disabled) {
        opened.value = true;
      }
    }

    function onMousedownDisplay(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.y-field-input__clear')) {
        event.preventDefault();
      }
    }

    function onClear(event?: Event) {
      (fieldInputRef.value as any)?.focus?.();
      focused.value = true;
      searchDirty.value = true;
      lastSyncedSearch.value = null;
      search.value = '';
      opened.value = true;
      model.value = [];
      emit('change', setOut([]), event, fieldInputRef.value);
    }

    function onInput(event: Event) {
      search.value = String(
        (event.target as HTMLInputElement | null)?.value ?? '',
      );
      searchDirty.value = true;
      opened.value = true;
    }

    function onInputBlur(event: FocusEvent) {
      focused.value = false;
      onBlur(event);
      requestAnimationFrame(() => {
        if (!focused.value) {
          search.value = displayText.value;
          searchDirty.value = false;
          lastSyncedSearch.value = displayText.value;
        }
      });
    }

    function onKeydown(event: KeyboardEvent) {
      if (props.disabled) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('.y-field-input__clear')) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClear(event);
        }
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        opened.value = true;
        moveActiveItem(1);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        opened.value = true;
        moveActiveItem(-1);
        return;
      }
      if (event.key === 'Escape' && opened.value) {
        event.preventDefault();
        opened.value = false;
        activeIndex.value = -1;
        search.value = displayText.value;
        searchDirty.value = false;
        lastSyncedSearch.value = displayText.value;
        return;
      }
      if (event.key !== 'Enter') return;

      if (!opened.value) {
        opened.value = true;
        return;
      }

      const itemToSelect = activeItem.value ?? navigableItems.value[0];
      if (itemToSelect) {
        event.preventDefault();
        selectItem(itemToSelect, event);
        if (!props.multiple) {
          opened.value = false;
        }
        return;
      }

      if (!props.readonly && searchText.value.trim()) {
        event.preventDefault();
        const customItem = refineListItem(props, searchText.value.trim());
        selectItem(customItem, event);
        if (!props.multiple) {
          opened.value = false;
        }
      }
    }

    useRender(() => {
      const fieldInputProps = chooseProps(props, YFieldInput.props);
      const dropdownIconProps = chooseProps(
        typeof props.dropdownIcon === 'object' ? props.dropdownIcon : {},
        YIcon.props,
      );

      return (
        <>
          <YFieldInput
            ref={fieldInputRef}
            {...fieldInputProps}
            name={undefined}
            modelValue={searchText.value}
            validationValue={model.rxValue}
            onInput={onInput}
            onClick={onClick}
            onClick:clear={onClear}
            onMousedown:display={onMousedownDisplay}
            onFocus={onFocus}
            onBlur={onInputBlur}
            onKeydown={onKeydown}
            class={[
              'y-combobox',
              {
                'y-combobox--opened': opened.value,
                'y-combobox--selected': selected.value.length > 0,
              },
            ]}
            {...attrs}
            focused={focused.value}
          >
            {{
              default: () => renderMenu(),
              leading: slots.leading
                ? (...args: any[]) => slots.leading?.(...args)
                : undefined,
              trailing: () =>
                slots['dropdown-icon'] ? (
                  slots['dropdown-icon']()
                ) : (
                  <YIcon
                    {...mergeProps(dropdownIconProps)}
                    icon={props.dropdownIcon}
                    class={['y-combobox__icon']}
                  />
                ),
              label: slots.label
                ? (...args: any[]) => slots.label?.(...args)
                : undefined,
              'helper-text': slots['helper-text']
                ? (...args: any[]) => slots['helper-text']?.(...args)
                : undefined,
            }}
          </YFieldInput>
          {props.name &&
            formValues.value.map((value, index) => (
              <input
                key={`y-combobox-${index}`}
                type="hidden"
                name={props.name}
                value={value}
                disabled={props.disabled}
              />
            ))}
        </>
      );
    });

    expose({
      fieldInputRef,
      baseEl,
      opened,
      search,
      activeIndex,
      activeItem,
    });

    return {
      fieldInputRef,
      model,
      selections,
      selected,
      menuRef,
      baseEl,
      opened,
      search,
      activeIndex,
      activeItem,
    };
  },
});

export type YCombobox = InstanceType<typeof YCombobox>;

export { type ComboboxFilter, pressYComboboxPropsOptions } from './props';
