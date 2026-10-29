import { h, type SlotsType } from 'vue';

import { defineComponent } from '@/util/component';

export const YCardHeader = defineComponent({
  name: 'YCardHeader',
  slots: Object as SlotsType<{
    default: any;
  }>,
  render() {
    return h('div', { class: 'y-card__header' }, this.$slots.default?.());
  },
});

export type YCardHeader = InstanceType<typeof YCardHeader>;
