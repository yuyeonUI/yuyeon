import { PropType, defineComponent } from 'vue';

import { useRender } from '../../composables/component';
import { propsFactory } from '../../util';
import { YButton } from '../button';
import { YFieldInput } from '../field-input';
import { YIconExpand, YIconPageControl } from '../icons';
import { YPagination } from '../pagination';
import { pressDataTablePaginationProps } from './composibles/pagination';

import './YDataTableControl.scss';

export const pressYDataTableControlPropsOptions = propsFactory(
  {
    pageLength: Number as PropType<number>,
    setPageSize: Function as PropType<(pageSize: number) => void>,
    setPage: Function as PropType<(page: number) => void>,
    ...pressDataTablePaginationProps(),
  },
  'YDataTableControl',
);

export const YDataTableControl = defineComponent({
  name: 'YDataTableControl',
  components: {
    YButton,
    YIconExpand,
    YFieldInput,
    YIconPageControl,
  },
  props: pressYDataTableControlPropsOptions(),
  setup(props, { slots }) {
    useRender(() => {
      return (
        <footer class={['y-data-table-control']}>
          {slots.prepend?.(props)}
          {slots.default ? (
            slots.default()
          ) : (
            <>
              <div class="y-data-table-control__start"></div>
              <div class="y-data-table-control__end">
                <YPagination
                  model-value={props.page}
                  onUpdate:modelValue={props.setPage}
                  length={props.pageLength}
                  totalVisible={0}
                ></YPagination>
              </div>
            </>
          )}
          {slots.append?.(props)}
        </footer>
      );
    });
  },
});

export type YDataTableControl = InstanceType<typeof YDataTableControl>;
