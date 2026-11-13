import { type PropType, type Ref, type SlotsType, inject } from 'vue';

import {
  YDataTableInjectionKey,
  YTableInjectionKey,
} from '@/components/table/composables/provides';
import { useRender } from '@/composables/component';
import { defineComponent } from '@/util/component';

import type { YDataTableLayerSlots } from './types/slots';

export const YDataTableLayer = defineComponent({
  name: 'YDataTableLayer',
  slots: Object as SlotsType<YDataTableLayerSlots>,
  props: {
    slotProps: Object as PropType<any>,
  },
  setup(props, { slots }) {
    const YTableWire = inject(YTableInjectionKey);
    const YDataTableWire = inject(YDataTableInjectionKey);

    useRender(() => {
      const scopedSlotProps = {
        ...props.slotProps,
        YTable: YTableWire,
        YDataTable: YDataTableWire,
      };

      return (
        <div class={['y-data-table-layer']}>
          {slots.layer ? (
            slots.layer?.(scopedSlotProps)
          ) : (
            <>
              <div class={['y-data-table-layer__head']}>
                {slots['layer-head']?.(scopedSlotProps)}
              </div>
              <div class={['y-data-table-layer__body']}>
                {slots['layer-body']?.(scopedSlotProps)}
              </div>
            </>
          )}
        </div>
      );
    });

    return {
      YTableWire,
    };
  },
});

export type YDataTableLayer = InstanceType<typeof YDataTableLayer>;
