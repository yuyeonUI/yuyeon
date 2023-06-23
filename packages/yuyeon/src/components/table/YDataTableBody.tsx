import { PropType, defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util/vue-component';
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
      return (
        <>
          {slots.body ? (
            slots.body?.(props)
          ) : (
            <tr onClick={(e) => emit('click:row', e)}></tr>
          )}
        </>
      );
    });
  },
});

export type YDataTableBody = InstanceType<typeof YDataTableBody>;
