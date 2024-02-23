import { defineComponent, h } from 'vue';

export const YCardFooter = defineComponent({
  name: 'YCardFooter',
  render() {
    return h('div', { class: 'y-card__footer' }, this.$slots.default?.());
  },
});

export type YCardFooter = InstanceType<typeof YCardFooter>;
