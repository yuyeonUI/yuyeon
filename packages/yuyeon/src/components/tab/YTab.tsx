import { defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { YButton } from '../button';

export const YTab = defineComponent({
  name: 'YTab',
  props: {},
  setup() {
    useRender(() => {
      return (
        <>
          <YButton>
              <slot></slot>
          </YButton>
        </>
      );
    });

    return {};
  },
});
