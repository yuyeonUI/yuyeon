import { PropType } from 'vue';

import { useRender } from '@/composables/component';
import { defineComponent } from '@/util/component/component';
import { propsFactory } from '@/util/component/props';

export const pressYSliderPropsOptions = propsFactory(
  {
    modelValue: Number as PropType<number>,
  },
  'YSlider',
);

export const YSlider = defineComponent({
  name: 'YSlider',
  props: {
    ...pressYSliderPropsOptions(),
  },
  emits: {
    'update:modelValue': () => true,
  },
  setup(props, { slots }) {
    useRender(() => <div class={['y-slider']}></div>);

    return {};
  },
});

export type YSlider = InstanceType<typeof YSlider>;
