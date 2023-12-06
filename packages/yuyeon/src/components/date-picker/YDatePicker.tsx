import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';

export const YDatePicker = defineComponent({
  name: 'YDatePicker',
  setup() {
    useRender(() => <div class={['y-date-picker']}></div>);
  },
});

export type YDatePicker = InstanceType<typeof YDatePicker>;
