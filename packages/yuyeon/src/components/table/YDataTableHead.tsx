import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';

export const YDataTableHead = defineComponent({
  name: 'YDataTableHead',
  props: {
    headers: {
      type: [Array],
    },
  },
  setup(props, { slots }) {
    useRender(() => {
      return <>{slots.head ? slots.head?.(props) : <tr></tr>}</>;
    });
  },
});

export type YDataTableHead = InstanceType<typeof YDataTableHead>;
