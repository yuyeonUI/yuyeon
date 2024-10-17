import { type PropType, computed } from 'vue';

import { useRender } from '@/composables/component';
import { defineComponent } from '@/util/component';

import './YPlate.scss';

/**
 * # Base Component
 */
export const YPlate = defineComponent({
  name: 'YPlate',
  props: {
    variation: Object as PropType<Record<string, any>>,
  },
  setup() {
    const classes = computed<Record<string, boolean>>(() => {
      return {
        'y-plate': true,
      };
    });

    useRender(() => {
      return <div class={classes.value}></div>;
    });
  },
});

export type YPlate = InstanceType<typeof YPlate>;
