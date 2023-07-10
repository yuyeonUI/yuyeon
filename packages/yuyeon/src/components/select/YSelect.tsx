import type { PropType } from 'vue';
import { defineComponent, mergeProps, ref } from 'vue';

import { pressItemsPropsOptions } from '../../abstract/items';
import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { pressCoordinateProps } from '../../composables/coordinate';
import { getObjectValueByPath, omit } from '../../util/common';
import { propsFactory } from '../../util/vue-component';
import { YCard } from '../card';
import { YFieldInput, pressYFieldInputPropsOptions } from '../field-input';
import { YList, YListItem } from '../list';
import { YMenu } from '../menu';

export const pressYSelectPropsOptions = propsFactory(
  {
    opened: Boolean as PropType<boolean>,
    ...pressItemsPropsOptions(),
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
    'update:opened': (opened: boolean) => true,
  },
  setup(props, { slots }) {
    const opened = useModelDuplex(props, 'opened');

    const menuRef = ref();
    const fieldInputRef = ref();

    function onMousedownDisplay(event: MouseEvent) {
      if (props.disabled) {
        return;
      }
      opened.value = !opened.value;
    }

    function onClickItem(item: any) {
      //
    }

    useRender(() => {
      return (
        <YMenu
          v-model={opened.value}
          ref={menuRef}
          position={props.position}
          content-classes={['y-select__content']}
          maxHeight={ 310 }
          open-on-click-base={false}
        >
          {{
            base: (...args: any[]) =>
              slots.base ? (
                slots.base?.(...args)
              ) : (
                <YFieldInput
                  class={['y-select', { 'y-select--opened': opened.value }]}
                  onMousedown:display={onMousedownDisplay}
                  readonly
                  {...mergeProps({ ...args[0].props }, { ref: fieldInputRef })}
                ></YFieldInput>
              ),
            default: () =>
              slots.menu ? (
                slots.menu()
              ) : (
                <YCard>
                  {Array.isArray(props.items) && props.items.length > 0 ? (
                    <YList>
                      {props.items.map((item) => {
                        const text = getObjectValueByPath(item, props.textKey);
                        return (
                          <YListItem onClick={(e) => onClickItem(item)}>
                            {text}
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
    };
  },
});
