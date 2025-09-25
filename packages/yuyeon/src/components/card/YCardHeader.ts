import { h } from 'vue';

import { defineComponent } from '@/util/component';

export const YCardHeader = defineComponent({
  name: 'YCardHeader',
  render() {
    return h('div', { class: 'y-card__header' }, this.$slots.default?.());
  },
});

export type YCardHeader = InstanceType<typeof YCardHeader>;
