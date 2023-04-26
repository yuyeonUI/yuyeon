import type { PropType, VNode } from 'vue';
import { defineComponent, h } from 'vue';

import './y-card.scss';

export default defineComponent({
  name: 'y-card',
  props: {
    outline: {
      type: Boolean as PropType<boolean>,
    },
  },
  render(): VNode {
    return h(
      'div',
      {
        class: ['y-card'],
      },
      this.$slots.default?.call(this),
    );
  },
});
