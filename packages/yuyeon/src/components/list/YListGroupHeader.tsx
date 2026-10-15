import type { SlotsType } from 'vue';

import { useRender } from '@/composables/component';
import { defineComponent } from '@/util/component';

import './YListGroupHeader.scss';

export const YListGroupHeader = defineComponent({
  name: 'YListGroupHeader',
  slots: Object as SlotsType<{
    default: any;
  }>,
  setup(_props, { slots }) {
    useRender(() => (
      <div class="y-list-group-header">{slots.default?.()}</div>
    ));
  },
});

export type YListGroupHeader = InstanceType<typeof YListGroupHeader>;
