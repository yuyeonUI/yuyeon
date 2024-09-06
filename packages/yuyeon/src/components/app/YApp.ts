import { defineComponent, h } from 'vue';

import './YApp.scss';

/**
 * # App Component
 */
export const YApp = defineComponent({
  name: 'YApp',
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { class: 'y-app' },
        h('div', { class: 'y-app__container' }, slots),
      );
  },
});

export type YApp = InstanceType<typeof YApp>;
