import { PropType, defineComponent } from 'vue';

import { pressItemsPropsOptions } from '../../abstract/items';
import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { pressCoordinateProps } from '../../composables/coordinate';
import { getObjectValueByPath, omit } from '../../util/common';
import { propsFactory } from '../../util/vue-component';
import { YButton } from '../button';
import { YCard } from '../card';
import { YIconDropdown } from '../icons/YIconDropdown';
import { YList, YListItem } from '../list';
import { YMenu } from '../menu';

import './YDropdown.scss';

export const pressYDropdownPropsOptions = propsFactory(
  {
    modelValue: Boolean as PropType<boolean>,
    variation: String as PropType<string>,
    color: String as PropType<string>,
    ...omit(pressCoordinateProps({ position: 'bottom' as 'bottom' }), [
      'coordinateStrategy',
    ]),
    ...pressItemsPropsOptions(),
  },
  'YDropdown',
);

export const YDropdown = defineComponent({
  name: 'YDropdown',
  inheritAttrs: false,
  components: {
    YMenu,
  },
  props: {
    ...pressYDropdownPropsOptions(),
  },
  emits: ['update:modelValue', 'click'],
  setup(props, { slots, attrs, emit }) {
    const opened = useModelDuplex(props);

    function onClickItem(item: any) {
      opened.value = false;
      emit('click', item);
    }

    useRender(() => {
      return (
        <>
          <YMenu
            v-model={opened.value}
            position={props.position}
            content-classes={['y-dropdown__content']}
          >
            {{
              base: (...args: any[]) =>
                slots.base ? (
                  slots.base?.(...args)
                ) : (
                  <YButton
                    variation={props.variation}
                    color={props.color}
                    class={[
                      'y-dropdown',
                      { 'y-dropdown--opened': opened.value },
                    ]}
                    {...attrs}
                  >
                    {
                      <span class="y-dropdown__default">
                        {slots.default?.()}
                      </span>
                    }
                    {slots['expand-icon'] ? (
                      slots['expand-icon']()
                    ) : (
                      <i class="y-dropdown__icon">
                        <YIconDropdown></YIconDropdown>
                      </i>
                    )}
                  </YButton>
                ),
              default: () =>
                slots.menu ? (
                  slots.menu()
                ) : (
                  <YCard>
                    {Array.isArray(props.items) && props.items.length > 0 ? (
                      <YList>
                        {props.items.map((item) => {
                          const text = getObjectValueByPath(
                            item,
                            props.itemText,
                          );
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
        </>
      );
    });
  },
});
