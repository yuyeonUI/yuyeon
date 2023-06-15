import { computed, defineComponent } from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { useResizeObserver } from '../../composables/resize-observer';
import { propsFactory } from '../../util/vue-component';

import './YPagination.scss';

export const pressYPaginationProps = propsFactory(
  {
    start: {
      type: [Number, String],
      default: 1,
    },
    modelValue: {
      type: Number,
      default: (props: any) => props.start as number,
    },
    disabled: Boolean,
    length: {
      type: [Number, String],
      default: 1,
      validator: (val: number) => val % 1 === 0,
    },
    totalVisible: [Number, String],
    showEndButton: Boolean,
  },
  'y-pagination',
);

export const YPagination = defineComponent({
  name: 'YPagination',
  props: {
    ...pressYPaginationProps(),
  },
  emits: {
    'update:modelValue': (value: number) => true,
    first: (value: number) => true,
    last: (value: number) => true,
    prev: (value: number) => true,
    next: (value: number) => true,
  },
  setup(props, { slots }) {
    const page = useModelDuplex(props);

    const length = computed(() => parseInt(props.length as string, 10));
    const start = computed(() => parseInt(props.start as string, 10));

    const { resizeObservedRef } = useResizeObserver((entries) => {
      if (1 > entries.length) return;
    });
    useRender(() => {
      return (
        <div
          class={['y-pagination']}
          role={'navigation'}
          ref={resizeObservedRef}
        >
          <ul class={['y-pagination__list']}>
            <li></li>
          </ul>
        </div>
      );
    });
  },
});
