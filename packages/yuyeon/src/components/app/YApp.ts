import { h } from 'vue';

import { defineComponent } from '@/util/component';

import './YApp.scss';

/**
 * # App Component
 */
export const YApp = defineComponent({
  name: 'YApp',
  setup(_props, { slots }) {
    return () =>
      h(
        'div',
        { class: 'y-app' },
        h('div', { class: 'y-app__container' }, slots),
      );
  },
});

export type YApp = InstanceType<typeof YApp>;
