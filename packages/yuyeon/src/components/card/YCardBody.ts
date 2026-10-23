import { h, type SlotsType } from 'vue';

import { defineComponent } from '@/util/component';

export const YCardBody = defineComponent({
  name: 'YCardBody',
  slots: Object as SlotsType<{
    default: any;
  }>,
  render() {
    return h('div', { class: 'y-card__body' }, this.$slots.default?.());
  },
});

export type YCardBody = InstanceType<typeof YCardBody>;
