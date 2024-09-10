import { PropType, SlotsType, defineComponent, mergeProps } from 'vue';

import { pressItemsPropsOptions } from '../../abstract/items';
import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { pressCoordinateProps } from '../../composables/coordinate';
import { pressPolyTransitionPropsOptions } from '../../composables/transition';
import { getObjectValueByPath, omit } from '../../util/common';
import {
  bindClasses,
  chooseProps,
  propsFactory,
} from '../../util/vue-component';
import { YButton } from '../button';
import { YCard } from '../card';
import { YIcon, YIconIconProp } from '../icon';
import { YList, YListItem } from '../list';
import { YMenu, YMenuPropOptions } from '../menu';

import './YDropdown.scss';

export const pressYDropdownPropsOptions = propsFactory(
  {
    ...omit(YMenuPropOptions, ['modelValue', 'coordinateStrategy']),
    modelValue: Boolean as PropType<boolean>,
    variation: String as PropType<string>,
    color: String as PropType<string>,
    ...omit(pressCoordinateProps({ position: 'bottom' as 'bottom' }), [
      'coordinateStrategy',
    ]),
    dropdownIcon: {
      type: [String, Array, Object] as PropType<YIconIconProp>,
      default: '$dropdown',
    },
    ...pressItemsPropsOptions(),
    ...pressPolyTransitionPropsOptions({
      transition: 'fade'
    }),
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
  slots: Object as SlotsType<{
    base: any;
    default: any;
    'dropdown-icon': any;
    menu: any;
    item: { text: string; item: any };
  }>,
  emits: ['update:modelValue', 'click'],
  setup(props, { slots, attrs, emit }) {
    const opened = useModelDuplex(props);

    function onClickItem(item: any) {
      opened.value = false;
      emit('click', item);
    }

    useRender(() => {
      const menuProps = chooseProps(props, YMenu.props);
      const dropdownIconProps = chooseProps(
        typeof props.dropdownIcon === 'object' ? props.dropdownIcon : {},
        YIcon.props,
      );
      return (
        <>
          <YMenu
            {...menuProps}
            v-model={opened.value}
            content-classes={bindClasses([
              'y-dropdown__content',
              props.contentClasses,
            ])}
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
                    {slots['dropdown-icon'] ? (
                      slots['dropdown-icon']()
                    ) : (
                      <YIcon
                        {...mergeProps(dropdownIconProps)}
                        icon={props.dropdownIcon}
                        class={['y-dropdown__icon']}
                      ></YIcon>
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
                              {slots.item ? slots.item({ text, item }) : text}
                            </YListItem>
                          );
                        })}
                      </YList>
                    ) : (
                      <div class="y-dropdown__no-options">항목이 없습니다.</div>
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
