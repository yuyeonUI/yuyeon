import { h } from 'vue';

import { defineComponent } from '@/util/component';

export const YCardBody = defineComponent({
  name: 'YCardBody',
  render() {
    return h('div', { class: 'y-card__body' }, this.$slots.default?.());
  },
});

export type YCardBody = InstanceType<typeof YCardBody>;
