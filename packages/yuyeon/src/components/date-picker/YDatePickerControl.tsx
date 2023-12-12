import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util/vue-component';

import './YDatePickerControl.scss';

export const pressYDatePickerControlPropsOptions = propsFactory(
  {
    disabled: {
      type: [Boolean, String, Array] as PropType<boolean | string | string[]>,
      default: false,
    },
    nextIcon: {
      type: [String, Object],
    },
    prevIcon: {
      type: [String, Object],
    },
    dropdownIcon: {
      type: [String, Object],
    },
  },
  'YDataPickerControl',
);

export const YDatePickerControl = defineComponent({
  name: 'YDatePickerControl',
  setup() {
    useRender(() => <div class={['y-date-picker-control']}></div>);
  },
});

export type YDatePickerControl = InstanceType<typeof YDatePickerControl>;
