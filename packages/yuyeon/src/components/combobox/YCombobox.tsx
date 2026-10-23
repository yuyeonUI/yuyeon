import {
  computed,
  mergeProps,
  ref,
  type SlotsType,
  shallowRef,
  watch,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { type ListItem } from '@/composables/list-items';
import { useSelectItems } from '@/composables/select-items';
import { useSelectMenu } from '@/composables/select-menu';
import { useVirtualFocus } from '@/composables/virtual-focus';
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

export const YCombobox = defineComponent({
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
    change: (value: any, event?: Event, fieldInput?: YFieldInput) => true,
  },
  slots: Object as SlotsType<{
    base: any;
    selection: {
      displayText: string;
      placeholder: undefined | string;
      items: any[];
      internalItems: ListItem[];
    };
    leading: any;
    label: any;
    'helper-text': any;
    menu: any;
    'menu-prepend': any;
    'menu-append': any;
    'dropdown-icon': any;
    item: {
      item: any;
      internalItem: ListItem;
      value: any;
      text: string;
      selected: boolean;
      focused: boolean;
      select: () => void;
    };
    'item-leading': {
      item: any;
      internalItem: ListItem;
      value: any;
      text: string;
      selected: boolean;
      focused: boolean;
      select: () => void;
    };
    'item-trailing': {
      item: any;
      internalItem: ListItem;
      value: any;
      text: string;
      selected: boolean;
      focused: boolean;
      select: () => void;
    };
  }>,
  setup(props, { slots, attrs, expose, emit }) {
    const search = useModelDuplex(props, 'search', '');
    const opened = useModelDuplex(props, 'opened');

    const fieldInputRef = ref<InstanceType<typeof YFieldInput>>();
    const focused = shallowRef(false);

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

    const displayItems = computed(() =>
      selections.value.map((selection) => {
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
      }),
    );

    const displayText = computed(() => {
      return props.multiple
        ? displayItems.value.map((item) => item.text).join(', ')
        : displayItems.value[0]?.text ?? '';
    });

    const searchText = computed(() => String(search.value ?? ''));
    const inputValue = computed(() => {
      if (props.separateSearch && !searchDirty.value && !searchText.value) {
        return displayText.value;
      }

      return searchText.value;
    });

    watch(
      [displayText, selections, () => props.separateSearch],
      () => {
        if (props.separateSearch) {
          if (
            lastSyncedSearch.value !== null &&
            searchText.value === lastSyncedSearch.value
          ) {
            search.value = '';
          }
          lastSyncedSearch.value = null;
          return;
        }

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

    const virtualFocus = useVirtualFocus({
      items: visibleItems,
      opened,
      inputRef: fieldInputRef,
      isNonSelectableItem,
      idPrefix: 'y-combobox',
      hasCustomMenu: !!slots.menu,
      autocomplete: () => (props.readonly ? 'none' : 'list'),
    });
    const {
      activeIndex,
      activeItem,
      listId,
      openOrMoveActiveItem,
      resetActiveItem,
    } = virtualFocus;

    const selectMenu = useSelectMenu(props, slots, {
      items,
      selections,
      opened,
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

    const { menuRef, baseEl, onBlur, renderMenu } = selectMenu;

    function selectItem(item: ListItem, event?: Event) {
      resetActiveItem();
      cacheItem(item);
      select(item, event);
      if (props.separateSearch) {
        search.value = '';
        searchDirty.value = props.multiple;
        lastSyncedSearch.value = null;
      } else if (props.multiple) {
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
        if (props.separateSearch) {
          if (!searchText.value && displayText.value) {
            (fieldInputRef.value as any)?.select?.();
          }
        } else {
          search.value = displayText.value;
          searchDirty.value = false;
          lastSyncedSearch.value = displayText.value;
        }
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
      lastSyncedSearch.value = null;
      opened.value = true;
    }

    function onInputBlur(event: FocusEvent) {
      focused.value = false;
      onBlur(event);
      requestAnimationFrame(() => {
        if (!focused.value) {
          if (props.separateSearch) {
            search.value = '';
            searchDirty.value = false;
            lastSyncedSearch.value = null;
          } else {
            search.value = displayText.value;
            searchDirty.value = false;
            lastSyncedSearch.value = displayText.value;
          }
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
        openOrMoveActiveItem(1);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        openOrMoveActiveItem(-1);
        return;
      }
      if (event.key === 'Escape' && opened.value) {
        event.preventDefault();
        opened.value = false;
        resetActiveItem();
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

      const itemToSelect = activeItem.value;
      if (!itemToSelect) return;

      event.preventDefault();
      selectItem(itemToSelect, event);
      if (!props.multiple) {
        opened.value = false;
      }
    }

    useRender(() => {
      const fieldInputProps = chooseProps(props, YFieldInput.props);
      const showSelection = !!slots.selection && !focused.value;
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
            modelValue={inputValue.value}
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
                'y-combobox--custom-selection': showSelection,
              },
            ]}
            {...attrs}
            focused={focused.value}
          >
            {{
              default: () => (
                <>
                  {showSelection && (
                    <div class="y-combobox__selection">
                      {slots.selection?.({
                        displayText: displayText.value,
                        placeholder: props.placeholder,
                        items: displayItems.value.map((item) => item.raw),
                        internalItems: displayItems.value,
                      })}
                    </div>
                  )}
                  {renderMenu()}
                </>
              ),
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
      focused,
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
