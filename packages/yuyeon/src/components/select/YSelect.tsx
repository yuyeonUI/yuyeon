import {
  ExtractPropTypes,
  type PropType,
  type SlotsType,
  computed,
  mergeProps,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  vShow,
  watch,
  withDirectives,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { pressCoordinateProps } from '@/composables/coordinate';
import { useI18n } from '@/composables/i18n';
import {
  ListItem,
  pressListItemsPropsOptions,
  useItems,
} from '@/composables/list-items';
import { wrapInArray } from '@/util/array';
import { deepEqual, omit } from '@/util/common';
import {
  chooseProps,
  defineComponent,
  getHtmlElement,
  propsFactory,
} from '@/util/component';
import { getScrollParent } from '@/util/scroll';

import { YCard } from '../card';
import { YFieldInput, pressYFieldInputPropsOptions } from '../field-input';
import { YIcon, YIconIconProp } from '../icon';
import { YList, YListItem } from '../list';
import { YMenu } from '../menu';

import './YSelect.scss';

export type ItemComparator = (
  optionsItem: any,
  valueItem: any,
  valueKey?: string,
) => boolean;

export const pressSelectPropsOptions = propsFactory(
  {
    opened: Boolean as PropType<boolean>,
    closeOnBlur: Boolean as PropType<boolean>,
    multiple: Boolean,
    itemComparator: {
      type: Function as PropType<ItemComparator>,
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

export const YSelect = defineComponent<
  ReturnType<typeof pressYSelectPropsOptions>
>({
  name: 'YSelect',
  inheritAttrs: false,
  props: {
    ...pressYSelectPropsOptions(),
  },
  emits: {
    'update:modelValue': (value: any) => true,
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
    const fieldInputRef = ref();
    const menuRef = ref<InstanceType<typeof YMenu>>();
    const listRef = ref<InstanceType<typeof YList>>();
    const cardRef = ref<any>();

    const opened = useModelDuplex(props, 'opened');
    const focused = shallowRef(false);

    const { items, toRefineItems, toEmitItems } = useItems(props);
    const { t } = useI18n();
    const setOut = (v: any) => {
      const emitValue = toEmitItems(wrapInArray(v));
      return props.multiple ? emitValue : emitValue[0] ?? null;
    };
    const model = useModelDuplex(
      props,
      'modelValue',
      [],
      (v) => toRefineItems(v === null ? [null] : wrapInArray(v)),
      setOut,
    );

    const selections = computed<ListItem[]>(() => {
      const ret: ListItem<any>[] = [];
      for (const v of model.value) {
        const found = items.value.find((item) => {
          return props.itemComparator(item.value, v.value);
        });
        if (found !== undefined) {
          ret.push(found);
        }
      }
      return ret;
    });

    const selected = computed(() => {
      return selections.value.map((selection) => selection?.props?.value);
    });

    const extraMenuProps = computed(() => {
      return { ...props.menuProps, preventCloseBubble: true };
    });

    function isSelected(item: ListItem) {
      return !!selections.value.find((selectedItem) => {
        return selectedItem?.value === item.value;
      });
    }

    // Field
    function onMousedownDisplay(event: MouseEvent) {
      if (props.disabled) return;
      opened.value = !opened.value;
    }

    function onKeydownDisplay(event: KeyboardEvent) {
      console.log(event);
      if (props.disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        opened.value = !opened.value;
      }
    }

    function onBlur(event: FocusEvent) {
      requestAnimationFrame(() => {
        const contentEl = (menuRef.value as any)?.layer$?.content$;
        if (contentEl?.contains(document.activeElement)) {
          return;
        }
        if (opened.value && props.closeOnBlur) {
          opened.value = false;
        }
      });
    }

    // Menu Contents
    function onClickItem(item: ListItem, e: MouseEvent) {
      if (item.disabled) return;
      select(item);
      if (!props.multiple) {
        setTimeout(() => {
          opened.value = false;
        }, 40);
      }
    }

    function onAfterLeave() {
      if (!focused.value) {
        // fieldInputRef.value?.focus();
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
      let value;
      if (props.multiple) {
        const index = selections.value.findIndex((selectedItem) => {
          return selectedItem.value === item.value;
        });
        if (index === -1) {
          value = [...model.value, item];
        } else {
          const neo = model.value.slice();
          neo.splice(index, 1);
          value = neo;
        }
      } else {
        value = [item];
      }
      model.value = value;
      emit('change', setOut(value));
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

    watch(opened, (neo) => {
      if (neo) {
        nextTick(() => {
          scrollToActiveItem();
        });
      }
    });

    function scrollToActiveItem() {
      if (selections.value.length === 0) {
        return;
      }
      const listEl = getHtmlElement(listRef.value);
      if (listEl) {
        const activeEl = listEl?.querySelector('.y-list-item--active') as
          | HTMLElement
          | undefined;
        const contentEl = (menuRef.value as any)?.layer$
          ?.content$ as HTMLElement;
        if (activeEl && contentEl) {
          const scrollEl = getScrollParent(activeEl);
          if (
            scrollEl &&
            (contentEl.contains(scrollEl) || contentEl.isSameNode(scrollEl))
          ) {
            scrollEl.scrollTo({ top: activeEl.offsetTop, behavior: 'smooth' });
          }
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
        <YFieldInput
          ref={fieldInputRef}
          {...fieldInputProps}
          modelValue={model.value.map((v: any) => v.props.value).join(', ')}
          validationValue={model.rxValue}
          onMousedown:display={onMousedownDisplay}
          onKeydown:display={onKeydownDisplay}
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
                  <YMenu
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
                    base="parent"
                    {...extraMenuProps.value}
                    v-model={opened.value}
                  >
                    {{
                      default: slots.menu
                        ? () => slots.menu?.()
                        : () => (
                            <YCard ref={cardRef}>
                              {slots['menu-prepend']?.()}
                              {items.value.length > 0 ? (
                                <YList ref={listRef}>
                                  {items.value.map((item) => {
                                    const itemProps = {
                                      item,
                                      selected: isSelected(item),
                                      select: () => {
                                        select(item);
                                      },
                                    };
                                    return withDirectives(
                                      <YListItem
                                        onClick={(e) => onClickItem(item, e)}
                                        class={[
                                          {
                                            'y-list-item--active':
                                              isSelected(item),
                                          },
                                        ]}
                                        disabled={item.disabled}
                                      >
                                        {{
                                          default: () =>
                                            slots.item
                                              ? slots.item?.(itemProps)
                                              : item.text,
                                          leading:
                                            slots['item-leading'] &&
                                            (() =>
                                              slots['item-leading']?.(
                                                itemProps,
                                              )),
                                          trailing:
                                            slots['item-trailing'] &&
                                            (() =>
                                              slots['item-trailing']?.(
                                                itemProps,
                                              )),
                                        }}
                                      </YListItem>,
                                      [[vShow, !item.hide]],
                                    );
                                  })}
                                </YList>
                              ) : (
                                <div class="y-select__no-options">
                                  {t('$yuyeon.noItems')}
                                </div>
                              )}
                              {slots['menu-append']?.()}
                            </YCard>
                          ),
                    }}
                  </YMenu>
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
