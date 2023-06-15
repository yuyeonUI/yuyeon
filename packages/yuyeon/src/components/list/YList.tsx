import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';

import './YList.scss';

export const YList = defineComponent({
  name: 'YList',
  setup(props, { slots }) {
    useRender(() => (
      <>
        <div class={'y-list'}>{slots.default?.()}</div>
      </>
    ));
  },
});

export type YList = InstanceType<typeof YList>;
