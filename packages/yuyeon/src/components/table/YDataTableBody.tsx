import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';

export const YDataTableBody = defineComponent({
  name: 'YDataTableBody',
  props: {
    headers: {
      type: [Array],
    },
  },
  setup(props, { slots }) {
    useRender(() => {
      return <>{slots.body ? slots.body?.(props) : <tr></tr>}</>;
    });
  },
});

export type YDataTableBody = InstanceType<typeof YDataTableBody>;
