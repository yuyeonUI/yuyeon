import { type CSSProperties, type PropType, computed } from 'vue';

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
      type: String as PropType<'lead' | 'last'>,
    },
    fixedOffset: {
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
        if (props.fixed === 'lead') {
          ret['left'] = toStyleSizeValue(props.fixedOffset);
        } else if (props.fixed === 'last') {
          ret['left'] = toStyleSizeValue(props.fixedOffset);
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
              [`y-data-table-cell--fixed-${props.fixed}`]: props.fixed,
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
