import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'y-card-footer',
  render() {
    return h('div', { class: 'y-card__footer' }, this.$slots.default?.());
  },
});
