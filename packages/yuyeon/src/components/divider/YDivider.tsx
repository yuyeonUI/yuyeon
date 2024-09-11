import { type PropType } from 'vue';

import { useRender } from '@/composables/component';
import { defineComponent, propsFactory } from '@/util/component';

export const pressYDividerPropsOptions = propsFactory(
  {
    vertical: Boolean as PropType<boolean>,
  },
  'YDivider',
);

export const YDivider = defineComponent({
  name: 'YDivider',
  props: pressYDividerPropsOptions(),
  setup(props) {
    useRender(() => {
      return (
        <hr
          class={['y-divider', { 'y-divider--vertical': props.vertical }]}
          v-theme
        />
      );
    });
  },
});

export type YDivider = InstanceType<typeof YDivider>;
