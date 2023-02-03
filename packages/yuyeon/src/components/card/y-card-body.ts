import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'y-card-body',
  render() {
    return h('div', { class: 'y-card__body' }, this.$slots.default?.());
  },
});
