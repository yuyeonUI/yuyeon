import { PropType, computed, defineComponent } from 'vue';

import { pressChoicePropsOptions, useChoice } from '../../composables/choice';
import { useRender } from '../../composables/component';
import { useResizeObserver } from '../../composables/resize-observer';
import { propsFactory } from '../../util/vue-component';
import { YTab } from './YTab';
import { Y_TABS_KEY } from './shared';
import { YTabPropItem } from './types';

import './YTabs.scss';

export const pressYTabsPropOptions = propsFactory(
  {
    items: {
      type: Array as PropType<YTabPropItem[]>,
    },
    ...pressChoicePropsOptions({
      selectedClass: 'y-tab--active',
      mandatory: 'force' as const,
    }),
  },
  'YTabs',
);

export const YTabs = defineComponent({
  name: 'YTabs',
  props: {
    tag: {
      type: String as PropType<'div' | 'nav' | 'ol' | 'ul'>,
      default: 'div',
    },
    ...pressYTabsPropOptions(),
  },
  emits: {
    'update:modelValue': (value: any) => true,
  },
  setup(props, { slots }) {
    const { resizeObservedRef: container$, contentRect: containerRect } =
      useResizeObserver();
    const { resizeObservedRef: content$, contentRect } = useResizeObserver();

    const choiceState = useChoice(props, Y_TABS_KEY);

    const slotProps = computed(() => {
      return {
        next: choiceState.next,
        prev: choiceState.prev,
        select: choiceState.select,
        isSelected: choiceState.isSelected,
      };
    });

    const tabItems = computed(() => {
      return (
        props.items?.map((item) => {
          if (typeof item !== 'object') {
            return {
              text: item,
              value: item,
            };
          }
          return item;
        }) ?? []
      );
    });

    useRender(() => {
      return (
        <props.tag class={['y-tabs']} role="tablist">
          <div key="container" ref={container$} class={['y-tabs__container']}>
            <div key="content" ref={content$} class={['y-tabs__content']}>
              {slots.default
                ? slots.default(slotProps.value)
                : tabItems.value.map((tabItem) => (
                    <YTab {...tabItem} key={tabItem.text}></YTab>
                  ))}
            </div>
          </div>
        </props.tag>
      );
    });

    return {
      selected: choiceState.selected,
    };
  },
});

export type YTabs = InstanceType<typeof YTabs>;
