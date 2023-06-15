import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';

export const YDataTableLayer = defineComponent({
  name: 'YDataTableLayer',
  setup() {
    useRender(() => {
      return <div class={['y-data-table-layer']}></div>;
    });
  },
});

export type YDataTableLayer = InstanceType<typeof YDataTableLayer>;
