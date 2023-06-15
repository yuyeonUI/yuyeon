import { PropType, computed, defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util/vue-component';
import { pressDataTableProps } from './YDataTable';
import { YDataTableBody } from './YDataTableBody';
import { YDataTableControl } from './YDataTableControl';
import { YDataTableHead } from './YDataTableHead';
import { YDataTableLayer } from './YDataTableLayer';
import { YTable } from './YTable';
import { pressDataTablePaginationProps } from './pagination';

export const pressDataTableServerProps = propsFactory(
  {
    total: {
      type: [Number, String] as PropType<number | string>,
      required: true,
    },
    ...pressDataTablePaginationProps(),
    ...pressDataTableProps(),
  },
  'YDataTableServer',
);

export const YDataTableServer = defineComponent({
  name: 'YDataTableServer',
  components: {
    YTable,
    YDataTableLayer,
    YDataTableHead,
    YDataTableBody,
    YDataTableControl,
  },
  props: {
    ...pressDataTableServerProps(),
  },
  setup(props, { slots }) {
    const slotProps = computed(() => {
      return {};
    });
    useRender(() => {
      return (
        <YTable class={['y-data-table']}>
          {{
            top: () => slots.top?.(slotProps.value),
            leading: () =>
              slots.leading ? (
                slots.leading(slotProps.value)
              ) : (
                <>
                  <YDataTableLayer v-slots={slots}></YDataTableLayer>
                </>
              ),
            default: () =>
              slots.default ? (
                slots.default(slotProps.value)
              ) : (
                <>
                  <thead>
                    <YDataTableHead v-slots={slots}></YDataTableHead>
                  </thead>
                  {slots.thead?.(slotProps.value)}
                  <tbody>
                    <YDataTableBody v-slots={slots}></YDataTableBody>
                  </tbody>
                  {slots.tbody?.(slotProps.value)}
                  {slots.tfoot?.(slotProps.value)}
                </>
              ),
            trailing: () => slots.trailing?.(slotProps.value),
            bottom: () =>
              slots.bottom ? (
                slots.bottom(slotProps.value)
              ) : (
                <YDataTableControl
                  v-slots={{
                    prepend: slots['control.prepend'],
                  }}
                ></YDataTableControl>
              ),
          }}
        </YTable>
      );
    });
  },
});

export type YDataTableServer = InstanceType<typeof YDataTableServer>;
