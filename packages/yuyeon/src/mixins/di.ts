/*
 * Created by yuyeon-ui 2022.
 */
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DiMixin',
  inject: {
    form$: {
      default: null,
    },
  },
  mounted() {
    ((this as any).form$ as any)?.register(this);
  },
  beforeUnmount() {
    ((this as any).form$ as any)?.unregister(this);
  },
});
