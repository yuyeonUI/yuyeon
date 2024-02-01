import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util/vue-component';

import './YBadge.scss';

export const pressYBadgePropsOptions = propsFactory({

}, 'YBadge');

export const YBadge = defineComponent({
  name: 'YBadge',
  props: pressYBadgePropsOptions(),
  setup(props, ctx) {
    useRender(() => {
      return <></>;
    });
  },
});
