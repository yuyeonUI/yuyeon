import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'y-card-header',
  render() {
    return h('div', { class: 'y-card__header' }, this.$slots.default?.());
  },
});
