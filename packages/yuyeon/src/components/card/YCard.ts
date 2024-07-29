import type { Directive, PropType, VNode } from 'vue';
import { defineComponent, h, withDirectives } from 'vue';

import { useRender } from '../../composables';
import { pressThemePropsOptions, useLocalTheme } from '../../composables/theme';

import './YCard.scss';

export const YCard = defineComponent({
  name: 'YCard',
  props: {
    outline: {
      type: Boolean as PropType<boolean>,
    },
    ...pressThemePropsOptions(),
  },
  setup(props, { slots }) {
    const { themeClasses } = useLocalTheme(props);

    useRender(() =>
      h(
        'div',
        {
          class: ['y-card', { 'y-card--outlined': props.outline }, themeClasses.value],
        },
        slots.default?.(),
      ),
    );
  },
});

export type YCard = InstanceType<typeof YCard>;
