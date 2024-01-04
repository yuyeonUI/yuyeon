import { shallowRef } from '@vue/runtime-core';
import { PropType, SlotsType, nextTick } from 'vue';
import { computed, defineComponent, mergeProps, onMounted, ref } from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { pressCoordinateProps } from '../../composables/coordinate';
import {
  ListItem,
  pressListItemsPropsOptions,
  useItems,
} from '../../composables/list-items';
import { wrapInArray } from '../../util/array';
import { deepEqual, getObjectValueByPath, omit } from '../../util/common';
import { chooseProps, propsFactory } from '../../util/vue-component';
import { YCard } from '../card';
import { YFieldInput, pressYFieldInputPropsOptions } from '../field-input';
import { YIcon, YIconIconProp } from '../icon';
import { YIconDropdown } from '../icons/YIconDropdown';
import { YList, YListItem } from '../list';
import { YMenu } from '../menu';

import './YSelect.scss';

export type SelectEquals = (
  optionsItem: any,
  valueItem: any,
  valueKey?: string,
) => boolean;

export function returnItemEquals(
  optionsItem: any,
  valueItem: any,
  valueKey = 'value',
) {
  const valueItemType = typeof valueItem;
  const itemValue =
    valueItemType === 'string' || valueItemType === 'number'
      ? getObjectValueByPath(optionsItem, valueKey)
      : optionsItem;
  return deepEqual(itemValue, valueItem);
}

export const pressSelectPropsOptions = propsFactory(
  {
    opened: Boolean as PropType<boolean>,
    multiple: Boolean,
    weakEquals: Boolean,
    valueEquals: {
      type: Function as PropType<SelectEquals>,
      default: deepEqual,
    },
    defaultSelect: Boolean,
    menuProps: {
      type: Object as PropType<YMenu['$props']>,
    },
    ...pressListItemsPropsOptions(),
  },
  'Select',
);

export const pressYSelectPropsOptions = propsFactory(
  {
    maxHeight: {
      type: [Number, String],
      default: 310,
    },
    dropdownIcon: {
      type: [String, Array, Object] as PropType<YIconIconProp>,
      default: '$dropdown',
    },
    openDelay: {
      type: Number as PropType<number>,
      default: 200,
    },
    closeDelay: {
      type: Number as PropType<number>,
      default: 200,
    },
    ...pressSelectPropsOptions(),
    ...pressYFieldInputPropsOptions(),
    ...omit(pressCoordinateProps({ position: 'bottom' as 'bottom' }), [
      'coordinateStrategy',
    ]),
  },
  'YSelect',
);

export const YSelect = defineComponent({
  name: 'YSelect',
  inheritAttrs: false,
  props: {
    ...pressYSelectPropsOptions(),
  },
  emits: {
    'update:modelValue': (value: any) => true,
    'update:opened': (opened: boolean) => true,
    'click:item': (item: any, e: MouseEvent) => true,
  },
  slots: Object as SlotsType<{
    base: any;
    selection: any;
    leading: any;
    'helper-text': any;
    menu: any;
    'menu-prepend': any;
    'menu-append': any;
    'dropdown-icon': any;
    item: { item: any; selected: boolean; select: () => void };
  }>,
  setup(props, { slots, attrs, expose }) {
    const fieldInputRef = ref();
    const menuRef = ref<InstanceType<typeof YMenu>>();
    const listRef = ref<InstanceType<typeof YList>>();

    const opened = useModelDuplex(props, 'opened');
    const focused = shallowRef(false);

    const { items, toRefineItems, toEmitItems } = useItems(props);
    const model = useModelDuplex(
      props,
      'modelValue',
      [],
      (v) => toRefineItems(v === null ? [null] : wrapInArray(v)),
      (v) => {
        const emitValue = toEmitItems(wrapInArray(v));
        return props.multiple ? emitValue : emitValue[0] ?? null;
      },
    );

    const selections = computed<ListItem[]>(() => {
      return model.value.map((v: any) => {
        return items.value.find((item) => {
          return props.valueEquals(item.value, v.value);
        });
      });
    });

    const selected = computed(() => {
      return selections.value.map((selection) => selection.props.value);
    });

    const extraMenuProps = computed(() => {
      return { ...props.menuProps };
    });

    function isSelected(item: ListItem) {
      return !!selections.value.find((selectedItem) => {
        return selectedItem?.value === item.value;
      });
    }

    // Field
    function onMousedownDisplay(event: MouseEvent) {
      if (props.disabled) {
        return;
      }
      opened.value = !opened.value;
    }

    function onBlur(event: FocusEvent) {
      // if (listRef.value?.$el.contains(event.relatedTarget)) {
      //   opened.value = false;
      // }
    }

    // Menu Contents
    function onClickItem(item: ListItem, e: MouseEvent) {
      select(item);
      if (!props.multiple) {
        nextTick(() => {
          opened.value = false;
        });
      }
    }

    function onAfterLeave() {
      if (!focused.value) {
        fieldInputRef.value?.focus();
      }
    }

    function closeCondition(event: MouseEvent) {
      if (event.target && (menuRef.value as any)?.layer$?.content$) {
        return (event.target as HTMLElement)?.contains(
          (menuRef.value as any)?.layer$?.content$,
        );
      }
    }

    function select(item: ListItem) {
      if (props.multiple) {
        const index = selections.value.findIndex((selectedItem) => {
          return selectedItem.value === item.value;
        });
        if (index === -1) {
          model.value = [...model.value, item];
        } else {
          const neo = model.value.slice();
          neo.splice(index, 1);
          model.value = neo;
        }
      } else {
        model.value = [item];
      }
    }

    const displayText = computed(() => {
      if (props.multiple) {
        return selections.value.map((item) => item.text).join(', ');
      }
      return selections.value?.[0]?.text ?? '';
    });

    const baseEl = computed(() => {
      return menuRef.value?.baseEl;
    });

    useRender(() => {
      const fieldInputProps = chooseProps(props, YFieldInput.props);
      const dropdownIconProps = chooseProps(
        typeof props.dropdownIcon === 'object' ? props.dropdownIcon : {},
        YIcon.props,
      );
      return (
        <YMenu
          v-model={opened.value}
          ref={menuRef}
          offset={props.offset}
          position={props.position}
          align={props.align}
          origin={props.origin}
          content-classes={['y-select__content']}
          maxHeight={props.maxHeight}
          open-on-click-base={false}
          onAfterLeave={onAfterLeave}
          open-delay={props.openDelay}
          close-delay={props.closeDelay}
          closeCondition={closeCondition}
          {...extraMenuProps.value}
        >
          {{
            base: (...args: any[]) =>
              slots.base ? (
                slots.base?.(...args)
              ) : (
                <YFieldInput
                  {...{
                    ...fieldInputProps,
                    ...mergeProps({ ...args[0].props }, { ref: fieldInputRef }),
                  }}
                  modelValue={model.value
                    .map((v: any) => v.props.value)
                    .join(', ')}
                  validationValue={model.rxValue}
                  onMousedown:display={onMousedownDisplay}
                  onBlur={onBlur}
                  readonly
                  class={['y-select', { 'y-select--opened': opened.value }]}
                  {...attrs}
                  focused={focused.value}
                >
                  {{
                    default: () => {
                      return (
                        <div class={['y-select__selection']}>
                          {slots.selection
                            ? slots.selection?.()
                            : displayText.value}
                        </div>
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
                    'helper-text': slots['helper-text']
                      ? slots['helper-text']?.()
                      : undefined,
                  }}
                </YFieldInput>
              ),
            default: slots.menu
              ? () => slots.menu()
              : () => (
                  <YCard>
                    {slots['menu-prepend']?.()}
                    {items.value.length > 0 ? (
                      <YList ref={listRef}>
                        {items.value.map((item) => {
                          return (
                            <YListItem
                              onClick={(e) => onClickItem(item, e)}
                              class={{
                                'y-list-item--active': isSelected(item),
                              }}
                            >
                              {slots.item
                                ? slots.item({
                                    item,
                                    selected: isSelected(item),
                                    select: () => {
                                      select(item);
                                    },
                                  })
                                : item.text}
                            </YListItem>
                          );
                        })}
                      </YList>
                    ) : (
                      <div class="y-select__no-options">항목이 없습니다.</div>
                    )}
                    {slots['menu-append']?.()}
                  </YCard>
                ),
          }}
        </YMenu>
      );
    });

    onMounted(() => {
      if (
        props.defaultSelect &&
        (props.modelValue === undefined ||
          (Array.isArray(props.modelValue) && props.modelValue.length === 0)) &&
        items.value?.length
      ) {
        select(items.value[0]);
      }
    });

    expose({
      fieldInputRef,
      baseEl,
    });

    return {
      fieldInputRef,
      model,
      selections,
      selected,
      menuRef,
      baseEl,
    };
  },
});
