import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';

export const YDataTableHead = defineComponent({
  name: 'YDataTableHead',
  setup() {
    useRender(() => {
      return <tr></tr>;
    });
  },
});

export type YDataTableHead = InstanceType<typeof YDataTableHead>;
