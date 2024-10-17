import { getCurrentInstance } from 'vue';

import { defineComponent } from '@/util/component';

import { YBench } from '../bench/YBench';

export const YNavigation = defineComponent({
  name: 'YNavigation',
  components: {
    YBench,
  },
  setup(props, { slots }) {
    const vm = getCurrentInstance();
    return <YBench></YBench>;
  },
});
