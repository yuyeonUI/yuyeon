import { computed, defineComponent, PropType } from "vue";

import { useRender } from '../../composables/component';
import { YDataTableBody } from './YDataTableBody';
import { YDataTableControl } from './YDataTableControl';
import { YDataTableHead } from './YDataTableHead';
import { YDataTableLayer } from './YDataTableLayer';
import { YTable } from './YTable';
import { propsFactory } from "../../util/vue-component";
import {createPagination, pressDataTablePaginationProps} from "./pagination";

export const pressDataTableProps = propsFactory({
  width: [String, Number] as PropType<string | number>,
  search: String as PropType<string>,
  ...pressDataTablePaginationProps(),
}, 'YDataTable')

export const YDataTable = defineComponent({
  name: 'YDataTable',
  props: {
    ...pressDataTableProps(),
  },
  emits: {
    'update:modelValue': (value: any[]) => true,
    'update:page': (value: number) => true,
    'update:pageSize': (value: number) => true,
    'update:sortBy': (value: any) => true,
    'update:options': (value: any) => true,
  },
  setup(props, { slots }) {

    const { page, pageSize } = createPagination(props as any);

    const slotProps = computed(() => {
      return {
        page: page.value,
        pageSize: pageSize.value,

      };
    });
    useRender(() => {
      return (
        <YTable class={['y-data-table']} v-slots={slots}>
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

export type YDataTable = InstanceType<typeof YDataTable>;
