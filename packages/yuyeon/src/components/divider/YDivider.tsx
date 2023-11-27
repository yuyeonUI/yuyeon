import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util';

export const pressYDividerPropsOptions = propsFactory({
  vertical: Boolean as PropType<boolean>,
}, 'YDivider');

export const YDivider = defineComponent({
  props: pressYDividerPropsOptions(),
  setup() {
    useRender(() => {
      return <hr class={['y-divider']} v-theme />;
    });
  },
});

export type YDivider = InstanceType<typeof YDivider>;
