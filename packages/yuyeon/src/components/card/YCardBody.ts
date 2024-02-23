import { defineComponent, h } from 'vue';

export const YCardBody =  defineComponent({
  name: 'YCardBody',
  render() {
    return h('div', { class: 'y-card__body' }, this.$slots.default?.());
  },
});

export type YCardBody = InstanceType<typeof YCardBody>;
