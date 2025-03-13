import { type CSSProperties, type PropType, computed } from 'vue';

import type { FixedPropType } from '@/components/table/types';
import { useRender } from '@/composables/component';
import { defineComponent } from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

export const YDataTableCell = defineComponent({
  name: 'YDataTableCell',
  functional: true,
  props: {
    type: {
      type: String as PropType<'head' | 'data'>,
      default: 'data',
    },
    fixed: {
      type: String as PropType<FixedPropType>,
    },
    fixedOffset: {
      type: Number as PropType<number>,
    },
    rightOffset: {
      type: Number as PropType<number>,
    },
    width: {
      type: [Number, String] as PropType<string | number>,
    },
    maxWidth: {
      type: [Number, String] as PropType<string | number>,
    },
    height: {
      type: [Number, String] as PropType<string | number>,
    },
    align: {
      type: String as PropType<'start' | 'center' | 'end'>,
      default: 'start',
    },
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const offsetStyle = computed(() => {
      const ret: CSSProperties = {};
      if (props.fixed && props.fixedOffset !== undefined) {
        if (props.fixed.startsWith('lead')) {
          ret['left'] = toStyleSizeValue(props.fixedOffset);
        } else if (props.fixed.startsWith('trail')) {
          ret['right'] = toStyleSizeValue(props.rightOffset);
        }
      }
      return ret;
    });

    useRender(() => {
      const ElTag = props.type === 'head' ? 'th' : 'td';
      return (
        <ElTag
          class={[
            `y-data-table__${ElTag}`,
            'y-data-table-cell',
            {
              'y-data-table-cell--fixed': props.fixed,
              'y-data-table-cell--fixed-last': props.fixed?.endsWith('last'),
              [`y-data-table-cell--fixed-${props.fixed?.replace('-last', '')}`]:
                props.fixed,
              [`y-data-table-cell--align-${props.align}`]: props.align,
            },
          ]}
          style={{
            width: toStyleSizeValue(props.width),
            height: toStyleSizeValue(props.height),
            maxWidth: toStyleSizeValue(props.maxWidth),
            ...offsetStyle.value,
          }}
          {...attrs}
          onClick={(e) => emit('click', e)}
        >
          {slots.default?.()}
        </ElTag>
      );
    });
  },
});

export type YDataTableCell = InstanceType<typeof YDataTableCell>;
