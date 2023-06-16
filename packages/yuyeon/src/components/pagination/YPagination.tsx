import { computed, defineComponent, shallowRef } from "vue";

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { useResizeObserver } from '../../composables/resize-observer';
import { propsFactory } from '../../util/vue-component';

import './YPagination.scss';
import { YButton } from "../button";
import { YIconPageControl } from "../icons/YIconPageControl";
import { toStyleSizeValue } from "../../util/ui";

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
    gap: [String, Number],
  },
  'y-pagination',
);

export const YPagination = defineComponent({
  name: 'YPagination',
  components: {
    YButton,
  },
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

    const itemCount = shallowRef(-1);

    const { resizeObservedRef } = useResizeObserver((entries) => {
      if (1 > entries.length) return;
      const { target, contentRect } = entries[0];

      const firstItem = target.querySelector('.y-pagination__list > *');
      if (firstItem) {
        console.log(firstItem)
      }
    });

    const controls = computed(() => {
      return {
        first: {

        },
        prev: {

        },
        next: {

        },
        last: {

        }
      }
    });

    const items = computed(() => {
      return []
    })

    const styles = computed(() => {
      let gap = undefined;
      if (props.gap) {
        const value = +(props.gap);
        if (!isNaN(value)) {
          gap = toStyleSizeValue(value);
        } else if (typeof props.gap === 'string') {
          gap = props.gap;
        }
      }
      return {
        '--y-pagination__gap': gap,
      }
    })


    useRender(() => {
      return (
        <div
          class={['y-pagination']}
          role={'navigation'}
          style={styles.value}
          ref={resizeObservedRef}
        >
          <ul class={['y-pagination__list']}>
            { props.showEndButton && (
              <li key="first" class="y-pagination__first">
                {
                  slots.first ? slots.first(controls.value.first) : (
                    <YButton>
                      <YIconPageControl type={'first'}></YIconPageControl>
                    </YButton>
                  )
                }
              </li>
            )}
            <li key="prev" class="y-pagination__prev">
              {
                slots.prev ? slots.prev(controls.value.prev) : (
                  <YButton>
                    <YIconPageControl type={'prev'}></YIconPageControl>
                  </YButton>
                )
              }
            </li>
            {/**/}
            <li key="next" class="y-pagination__next">
              {
                slots.next ? slots.next(controls.value.next) : (
                  <YButton>
                    <YIconPageControl type={'next'}></YIconPageControl>
                  </YButton>
                )
              }
            </li>
            { props.showEndButton && (
              <li key="last" class="y-pagination__last">
                {
                  slots.last ? slots.last(controls.value.last) : (
                    <YButton>
                      <YIconPageControl type={'last'}></YIconPageControl>
                    </YButton>
                  )
                }
              </li>
            )}
          </ul>
        </div>
      );
    });
  },
});
