/*
 * Created by yuyeon-ui 2022.
 */

import { defineComponent } from 'vue';

export default defineComponent({
  data: () => ({
    attrs_$: {} as any,
    listeners_$: {} as any,
  }),
  watch: {
    // Work around unwanted re-renders: https://github.com/vuejs/vue/issues/10115
    // Make sure to use `v-bind="$data.$_attrs"` instead of `v-bind="$attrs"`
    $attrs: {
      handler(val) {
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const attr in val) {
          this.$data.attrs_$[attr] = val[attr];
          // this.$set(this.$data.$_attrs, attr, val[attr]);
        }
      },
      immediate: true,
    },
    $listeners: {
      handler(val) {
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const listener in val) {
          this.$data.listeners_$[listener] = val[listener];
          // this.$set(this.$data.$_listeners, listener, val[listener]);
        }
      },
      immediate: true,
    },
  },
});
