import { mergeProps, ref, type SlotsType, shallowRef } from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import type { ListItem } from '@/composables/list-items';
import { useSelectItems } from '@/composables/select-items';
import { useSelectMenu } from '@/composables/select-menu';
import { useVirtualFocus } from '@/composables/virtual-focus';
import { chooseProps, defineComponent } from '@/util/component';

import { YFieldInput } from '../field-input';
import { YIcon } from '../icon';
import { pressYSelectPropsOptions } from './props';

import './YSelect.scss';

export {
  type ItemComparator,
  pressSelectPropsOptions,
  pressYSelectPropsOptions,
} from './props';

export const YSelect = defineComponent({
  name: 'YSelect',
  inheritAttrs: false,
  props: {
    ...pressYSelectPropsOptions(),
  },
  emits: {
    'update:modelValue': () => true,
    'update:opened': (opened: boolean) => true,
    'click:clear': (event: MouseEvent) => true,
    'click:item': (item: any, e: MouseEvent) => true,
    change: (value: any, event?: Event, fieldInput?: typeof YFieldInput) =>
      true,
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
    const fieldInputRef = ref<typeof YFieldInput>();
    const focused = shallowRef(false);
    const opened = useModelDuplex(props, 'opened');
    const selectItems = useSelectItems(props, fieldInputRef, emit);
    const {
      items,
      model,
      selections,
      selected,
      displayText,
      isSelected,
      isNonSelectableItem,
      setOut,
      select,
    } = selectItems;

    const virtualFocus = useVirtualFocus({
      items,
      opened,
      inputRef: fieldInputRef,
      isNonSelectableItem,
      idPrefix: 'y-select',
      hasCustomMenu: !!slots.menu,
      autocomplete: () => 'none',
    });
    const {
      activeIndex,
      activeItem,
      listId,
      openOrMoveActiveItem,
      resetActiveItem,
      setActiveItem,
    } = virtualFocus;

    function selectItem(item: ListItem, event?: Event) {
      setActiveItem(item);
      select(item, event);
    }

    const selectMenu = useSelectMenu(props, slots, {
      items,
      selections,
      opened,
      focusedItem: activeItem,
      isSelected,
      isNonSelectableItem,
      select: selectItem,
      listId,
      getItemId: listId ? (_item, index) => `${listId}-${index}` : undefined,
    });
    const { menuRef, baseEl, onBlur: onMenuBlur, renderMenu } = selectMenu;

    // Field

    function onFocus() {
      focused.value = true;
    }

    function onBlur(event: FocusEvent) {
      focused.value = false;
      onMenuBlur(event);
    }

    function onClear(event: MouseEvent) {
      event.stopPropagation();
      model.value = [];
      resetActiveItem();
      fieldInputRef.value?.focus();
      emit('change', setOut([]), event, fieldInputRef.value);
      emit('click:clear', event);
    }

    function onKeydownDisplay(event: KeyboardEvent) {
      if (props.disabled) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openOrMoveActiveItem(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }

      if (event.key === 'Escape' && opened.value) {
        event.preventDefault();
        opened.value = false;
        resetActiveItem();
        return;
      }

      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();

      if (!opened.value) {
        opened.value = true;
        return;
      }

      if (!activeItem.value) return;
      selectItem(activeItem.value, event);
      if (!props.multiple) {
        opened.value = false;
      }
    }

    useRender(() => {
      const fieldInputProps = chooseProps(props, YFieldInput.props);
      const dropdownIconProps = chooseProps(
        typeof props.dropdownIcon === 'object' ? props.dropdownIcon : {},
        YIcon.props,
      );
      return (
        <YFieldInput
          ref={fieldInputRef}
          {...fieldInputProps}
          modelValue={model.value.map((v: any) => v.props.value).join(', ')}
          validationValue={model.rxValue}
          onClick:clear={onClear}
          onKeydown:display={onKeydownDisplay}
          onFocus={onFocus}
          onBlur={onBlur}
          readonly
          class={[
            'y-select',
            {
              'y-select--opened': opened.value,
              'y-select--selected': selected.value.length > 0,
            },
          ]}
          {...attrs}
          focused={focused.value}
        >
          {{
            default: () => {
              const selectionProps = {
                items: selections.value.map((item) => item.raw),
                displayText: displayText.value,
                placeholder: props.placeholder,
                internalItems: selections.value,
              };
              return (
                <>
                  <div class={['y-select__selection']}>
                    {slots.selection
                      ? slots.selection?.(selectionProps)
                      : selected.value.length > 0
                        ? displayText.value
                        : props.placeholder}
                  </div>
                  {renderMenu()}
                </>
              );
            },
            leading: slots.leading
              ? (...args: any[]) => slots.leading?.(...args)
              : undefined,
            trailing: (...args: any[]) => {
              return slots['dropdown-icon'] ? (
                slots['dropdown-icon']()
              ) : (
                <YIcon
                  {...mergeProps(dropdownIconProps)}
                  icon={props.dropdownIcon}
                  class={['y-select__icon']}
                ></YIcon>
              );
            },
            label: slots.label
              ? (...args: any[]) => slots.label?.(...args)
              : undefined,
            'helper-text': slots['helper-text']
              ? (...args: any[]) => slots['helper-text']?.(...args)
              : undefined,
          }}
        </YFieldInput>
      );
    });

    expose({
      fieldInputRef,
      baseEl,
      opened,
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
      activeIndex,
      activeItem,
    };
  },
});

export type YSelect = InstanceType<typeof YSelect>;
