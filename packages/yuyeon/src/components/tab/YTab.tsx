import { shallowRef } from '@vue/runtime-core';
import {
  PropType,
  SlotsType,
  computed,
  defineComponent,
  mergeProps,
  ref,
} from 'vue';

import { useRender } from '../../composables/component';
import { chooseProps, omit, propsFactory } from '../../util';
import { YButton, pressYButtonProps } from '../button';
import { Y_TABS_KEY } from './shared';

import './YTab.scss';

export const pressYTabPropsOptions = propsFactory(
  {
    text: String as PropType<string>,
    value: String as PropType<string>,
    hideIndicator: Boolean as PropType<boolean>,
    indicatorColor: String as PropType<string>,
    ...pressYButtonProps({
        selectedClass: 'y-tab--selected',
        noWave: true,
    }),
  },
  'YTab',
);

export const YTab = defineComponent({
  name: 'YTab',
  props: pressYTabPropsOptions(),
  slots: Object as SlotsType<{
    default?: any;
  }>,
  setup(props, { slots, attrs }) {
    const selected = shallowRef(false);

    const indicator$ = ref();
    const indicatorStyles = computed(() => {
      return {};
    });
    const attrsProps = computed(() => {
      return {
        role: 'tab',
        'aria-selected': `${String(selected.value)}`,
        tabindex: selected.value ? 0 : -1,
      };
    });

    function onChoice({ value }: { value: boolean }) {
      selected.value = value;
    }

    useRender(() => {
      const yButtonProps = chooseProps(props, YButton.props);
      console.log(props, yButtonProps);
      return (
        <>
          <YButton
            class={['y-tab']}
            active={false}
            {...attrsProps.value}
            {...attrs}
            {...yButtonProps}
            injectSymbol={Y_TABS_KEY}
            onChoice:selected={onChoice}
          >
            {{
              default: () => slots.default?.() ?? props.text,
              append: () =>
                !props.hideIndicator && (
                  <div
                    ref={indicator$}
                    class={['y-tab__indicator']}
                    style={indicatorStyles.value}
                  ></div>
                ),
            }}
          </YButton>
        </>
      );
    });

    return {};
  },
});
