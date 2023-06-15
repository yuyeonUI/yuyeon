import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';

export const YDataTableBody = defineComponent({
  name: 'YDataTableBody',
  setup() {
    useRender(() => {
      return <div></div>;
    });
  },
});

export type YDataTableBody = InstanceType<typeof YDataTableBody>;
