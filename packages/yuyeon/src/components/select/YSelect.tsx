import {
  mergeProps,
  ref,
  type SlotsType,
  shallowRef,
} from 'vue';

import { useRender } from '@/composables/component';
import type { ListItem } from '@/composables/list-items';
import { useSelectItems } from '@/composables/select-items';
import { useSelectMenu } from '@/composables/select-menu';
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

export const YSelect = defineComponent<
  ReturnType<typeof pressYSelectPropsOptions>
>({
  name: 'YSelect',
  inheritAttrs: false,
  props: {
    ...pressYSelectPropsOptions(),
  },
  emits: {
    'update:modelValue': () => true,
    'update:opened': (opened: boolean) => true,
    'click:item': (item: any, e: MouseEvent) => true,
    change: (value: any) => true,
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
    item: { item: any; selected: boolean; select: () => void };
    'item-leading': { item: any; selected: boolean; select: () => void };
    'item-trailing': { item: any; selected: boolean; select: () => void };
  }>,
  setup(props, { slots, attrs, expose, emit }) {
    const fieldInputRef = ref<InstanceType<typeof YFieldInput>>();
    const focused = shallowRef(false);
    const selectItems = useSelectItems(props, fieldInputRef, emit);
    const {
      items,
      model,
      selections,
      selected,
      displayText,
      isSelected,
      isNonSelectableItem,
      select,
    } = selectItems;
    const selectMenu = useSelectMenu(props, slots, {
      items,
      selections,
      isSelected,
      isNonSelectableItem,
      select,
    });
    const { menuRef, opened, baseEl, onBlur: onMenuBlur, renderMenu } =
      selectMenu;

    // Field

    function onFocus() {
      focused.value = true;
    }

    function onBlur(event: FocusEvent) {
      focused.value = false;
      onMenuBlur(event);
    }

    function onKeydownDisplay(event: KeyboardEvent) {
      if (props.disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        opened.value = !opened.value;
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
    });

    return {
      fieldInputRef,
      model,
      selections,
      selected,
      menuRef,
      baseEl,
      opened,
    };
  },
});

export type YSelect = InstanceType<typeof YSelect>;
