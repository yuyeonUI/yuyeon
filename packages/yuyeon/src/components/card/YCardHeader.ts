import { defineComponent, h } from 'vue';

export const YCardHeader = defineComponent({
  name: 'YCardHeader',
  render() {
    return h('div', { class: 'y-card__header' }, this.$slots.default?.());
  },
});

export type YCardHeader = InstanceType<typeof YCardHeader>;
