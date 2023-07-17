import { shallowRef } from '@vue/runtime-core';
import type { PropType } from 'vue';
import { computed, defineComponent, mergeProps, ref } from 'vue';

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
  props: {
    ...pressYSelectPropsOptions(),
  },
  emits: {
    'update:modelValue': (value: any) => true,
    'update:opened': (opened: boolean) => true,
  },
  setup(props, { slots }) {
    const fieldInputRef = ref();
    const menuRef = ref();
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

    // Field
    function onMousedownDisplay(event: MouseEvent) {
      if (props.disabled) {
        return;
      }
      opened.value = !opened.value;
    }

    function onBlur(event: FocusEvent) {
      if (listRef.value?.$el.contains(event.relatedTarget)) {
        opened.value = false;
      }
    }

    // Menu Contents
    function onClickItem(item: ListItem) {
      select(item);
      if (!props.multiple) {
        opened.value = false;
      }
    }

    function onAfterLeave() {
      if (focused.value) {
        fieldInputRef.value?.focus();
      }
    }

    function select(item: ListItem) {
      if (props.multiple) {
        //
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

    useRender(() => {
      const fieldInputProps = chooseProps(props, YFieldInput.props);
      return (
        <YMenu
          v-model={opened.value}
          ref={menuRef}
          position={props.position}
          content-classes={['y-select__content']}
          maxHeight={props.maxHeight}
          open-on-click-base={false}
          onAfterLeave={onAfterLeave}
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
                  onMousedown:display={onMousedownDisplay}
                  onBlur={onBlur}
                  readonly
                  class={['y-select', { 'y-select--opened': opened.value }]}
                  v-model:focused={focused.value}
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
                      return slots['expand-icon'] ? (
                        slots['expand-icon']()
                      ) : (
                        <i class="y-select__icon">
                          <YIconDropdown></YIconDropdown>
                        </i>
                      );
                    },
                    'helper-text': slots['helper-text']
                      ? slots['helper-text']?.()
                      : undefined,
                  }}
                </YFieldInput>
              ),
            default: () =>
              slots.menu ? (
                slots.menu()
              ) : (
                <YCard>
                  {items.value.length > 0 ? (
                    <YList ref={listRef}>
                      {items.value.map((item) => {
                        return (
                          <YListItem onClick={(e) => onClickItem(item)}>
                            {item.text}
                          </YListItem>
                        );
                      })}
                    </YList>
                  ) : (
                    <div class="pa-4">항목이 없습니다.</div>
                  )}
                </YCard>
              ),
          }}
        </YMenu>
      );
    });

    return {
      fieldInputRef,
      model,
      selections,
    };
  },
});
