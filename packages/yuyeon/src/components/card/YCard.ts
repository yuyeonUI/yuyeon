import type { Directive, PropType, VNode } from 'vue';
import { defineComponent, h, withDirectives } from 'vue';

import ThemeClass from '../../directives/theme-class';

import './YCard.scss';

export default defineComponent({
  name: 'y-card',
  props: {
    outline: {
      type: Boolean as PropType<boolean>,
    },
  },
  render(): VNode {
    const theme = ThemeClass as Directive;
    return withDirectives(
      h(
        'div',
        {
          class: ['y-card'],
        },
        this.$slots.default?.call(this),
      ),
      [[theme]],
    );
  },
});
