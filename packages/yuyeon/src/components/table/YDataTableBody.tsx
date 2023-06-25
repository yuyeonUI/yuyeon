import { PropType, defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util/vue-component';
import { YDataTableRow } from './YDataTableRow';
import { useHeader } from './composibles/header';
import { useSelection } from './composibles/selection';

import { DataTableItem } from './types';

const pressYDataTableBodyProps = propsFactory(
  {
    items: {
      type: Array as PropType<readonly DataTableItem[]>,
      default: () => [],
    },
    loading: [Boolean, String],
    loadingText: String,
    hideNoData: Boolean,
    noDataText: {
      type: String,
      default: '',
    },
    rowHeight: Number,
    'onClick:row': Function as PropType<(e: Event, value: any) => void>,
  },
  'YDataTableBody',
);

export const YDataTableBody = defineComponent({
  name: 'YDataTableBody',
  props: {
    ...pressYDataTableBodyProps(),
  },
  emits: ['click:row'],
  setup(props, { slots, emit }) {
    const { columns } = useHeader();
    const { isSelected, toggleSelect } = useSelection();

    useRender(() => {
      if (props.loading && slots.loading) {
        return (
          <tr>
            <td colspan={columns.value.length}>{slots.loading()}</td>
          </tr>
        );
      }
      if (!props.loading && props.items.length < 1 && !props.hideNoData) {
        return (
          <tr key="no-data">
            <td colspan={columns.value.length}>
              {slots['no-data']?.() ?? props.noDataText}
            </td>
          </tr>
        );
      }
      return (
        <>
          {slots.body
            ? slots.body?.(props)
            : props.items.map((item, index) => {
                const stateProps = {
                  index,
                  item,
                  columns: columns.value,
                  isSelected,
                  toggleSelect,
                };
                const slotProps = {
                  ...stateProps,
                  props: {
                    key: `item__${item.value}`,
                    onClick: props['onClick:row']
                      ? (event: Event) => {
                          props['onClick:row']?.(event, { item });
                        }
                      : undefined,
                    index,
                    item,
                  },
                };

                return (
                  <>
                    {slots.item ? (
                      slots.item(slotProps)
                    ) : (
                      <YDataTableRow
                        v-slots={slots}
                        {...slotProps.props }
                      ></YDataTableRow>
                    )}
                  </>
                );
              })}
        </>
      );
    });

    // end
    return {}
  },
});

export type YDataTableBody = InstanceType<typeof YDataTableBody>;
