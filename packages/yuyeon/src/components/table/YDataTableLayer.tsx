import { type PropType, type Ref, inject } from 'vue';

import { useRender } from '@/composables/component';
import { defineComponent } from '@/util/component';

export const YDataTableLayer = defineComponent({
  name: 'YDataTableLayer',
  props: {
    slotProps: Object as PropType<any>,
  },
  setup(props, { slots }) {
    const YTableWire = inject<{ containerRect: Ref<DOMRect> }>('YTable');

    useRender(() => {
      return (
        <div class={['y-data-table-layer']}>
          {slots.layer ? (
            slots.layer?.(props.slotProps)
          ) : (
            <>
              <div class={['y-data-table-layer__head']}>
                {slots['layer-head']?.(props.slotProps)}
              </div>
              <div class={['y-data-table-layer__body']}>
                {slots['layer-body']?.(props.slotProps)}
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
