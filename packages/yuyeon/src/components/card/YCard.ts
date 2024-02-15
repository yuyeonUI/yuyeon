import type { Directive, PropType, VNode } from 'vue';
import { defineComponent, h, withDirectives } from 'vue';

import ThemeClass from '../../directives/theme-class';

import './YCard.scss';

export const YCard = defineComponent({
  name: 'YCard',
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
          class: ['y-card', { 'y-card--outlined': this.$props.outline }],
        },
        this.$slots.default?.call(this),
      ),
      [[theme]],
    );
  },
});

export type YCard = InstanceType<typeof YCard>;
