import { PropType, defineComponent, ref } from 'vue';

import { pressChoicePropsOptions } from '../../composables/choice';
import { useRender } from '../../composables/component';
import { useResizeObserver } from '../../composables/resize-observer';
import { propsFactory } from '../../util/vue-component';

export const pressYTabsPropOptions = propsFactory(
  {
    ...pressChoicePropsOptions({
      selectedClass: 'y-tab--active',
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
  setup(props, { slots }) {
    const { resizeObservedRef: container$, contentRect: containerRect } =
      useResizeObserver();
    const { resizeObservedRef: content$, contentRect } = useResizeObserver();

    useRender(() => {
      return (
        <props.tag class={['y-tabs']} role="tablist">
          <div key="container" ref={container$} class={['y-tabs__container']}>
            <div key="content" ref={content$}>
              {slots.default?.()}
            </div>
          </div>
        </props.tag>
      );
    });

    return {};
  },
});
