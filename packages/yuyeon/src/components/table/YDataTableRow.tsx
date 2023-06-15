import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';

export const YDataTableRow = defineComponent({
  name: 'YDataTableRow',
  setup() {
    useRender(() => {
      return <tr></tr>;
    });
  },
});

export type YDataTableRow = InstanceType<typeof YDataTableRow>;
