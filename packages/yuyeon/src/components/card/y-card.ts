import { defineComponent, h, VNode } from 'vue';

import './y-card.scss';

export default defineComponent({
  name: 'y-card',
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
