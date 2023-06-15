import { PropType, defineComponent, computed, CSSProperties } from "vue";

import { useRender } from '../../composables/component';
import { toStyleSizeValue } from "../../util/ui";

export const YDataTableCell = defineComponent({
  name: 'YDataTableCell',
  props: {
    type: {
      type: String as PropType<'head' | 'data'>,
      default: 'data',
    },
    fixed: {
      type: String as PropType<'lead' | 'trail'>,
    },
    fixedOffset: {
      type: Number as PropType<number>,
    },
    width: {
      type: [Number, String] as PropType<string | number>
    }
  },
  setup(props, { slots, attrs }) {
    const offsetStyle = computed(() => {
      const ret: CSSProperties = {};
      if (props.fixed && props.fixedOffset !== undefined) {
        if (props.fixed === 'lead') {
          ret['left'] = toStyleSizeValue(props.fixedOffset);
        } else if (props.fixed === 'trail') {
          ret['right'] = toStyleSizeValue(props.fixedOffset);
        }
      }
      return ret
    })

    useRender(() => {
      const ElTag = props.type === 'head' ? 'th' : 'td';
      return (
        <ElTag
          class={[
            'y-data-table__cell',
            'y-data-table-cell',
            {
              'y-data-table-cell--fixed': props.fixed,
              [`y-data-table-cell--fixed-${props.fixed}`]: props.fixed,
            },
          ]}
          style={{
            width: toStyleSizeValue(props.width),
            ...offsetStyle.value
          }}
          {...attrs}
        >
          {slots.default?.()}
        </ElTag>
      );
    });
  },
});

export type YDataTableCell = InstanceType<typeof YDataTableCell>;
