import {
  ComponentPublicInstance,
  computed,
  defineComponent,
  shallowRef,
} from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { useRefs } from '../../composables/ref';
import { useResizeObserver } from '../../composables/resize-observer';
import { getRangeArr } from '../../util/common';
import { toStyleSizeValue } from '../../util/ui';
import { propsFactory } from '../../util/vue-component';
import { YButton } from '../button';
import { YIconPageControl } from '../icons/YIconPageControl';

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
    gap: {
      type: [String, Number],
      default: 4,
    },
    color: String,
    activeColor: String,
    // firstIcon: [String],
    // lastIcon: [String],
    // prevIcon: [String],
    // nextIcon: [String],
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
    change: (value: number, control?: string) => true,
  },
  setup(props, { slots, emit }) {
    const page = useModelDuplex(props);

    const length = computed(() => parseInt(props.length as string, 10));
    const start = computed(() => parseInt(props.start as string, 10));

    const itemCount = shallowRef(-1);

    const { resizeObservedRef } = useResizeObserver((entries) => {
      if (1 > entries.length) return;
      const { target, contentRect } = entries[0];

      const firstItem = target.querySelector(
        '.y-pagination__list > *',
      ) as HTMLElement;
      if (firstItem) {
        const listWidth = contentRect.width;
        const itemWidth =
          firstItem.offsetWidth +
          parseFloat(getComputedStyle(firstItem).marginRight) * 2;
        itemCount.value = calcItemCount(listWidth, itemWidth);
      }
    });

    function calcItemCount(listWidth: number, itemWidth: number) {
      const fixedCount = props.showEndButton ? 5 : 3;
      const fixedWidth = itemWidth * fixedCount;
      const gap = +(props.gap ?? 4);
      return Math.max(
        0,
        Math.floor(
          +((listWidth - fixedWidth - gap) / (itemWidth + gap)).toFixed(2),
        ),
      );
    }

    const totalVisible = computed(() => {
      if (props.totalVisible) return parseInt(props.totalVisible as string, 10);
      else if (itemCount.value >= 0) return itemCount.value;
      return calcItemCount(innerWidth, 58);
    });

    const controls = computed(() => {
      const prevDisabled = !!props.disabled || page.value <= start.value;
      const nextDisabled =
        !!props.disabled || page.value >= start.value + length.value - 1;
      return {
        first: {
          disabled: prevDisabled,
          onClick: (e: MouseEvent) => {
            e.preventDefault();
            page.value = 1;
            emit('change', 1, 'first');
          },
        },
        prev: {
          disabled: prevDisabled,
          onClick: (e: MouseEvent) => {
            e.preventDefault();
            const to = Math.max(1, page.value - 1);
            page.value = to;
            emit('change', to, 'prev');
          },
        },
        next: {
          disabled: nextDisabled,
          onClick: (e: MouseEvent) => {
            e.preventDefault();
            const to = Math.min(+length.value, page.value + 1);
            page.value = to;
            emit('change', to, 'next');
          },
        },
        last: {
          disabled: nextDisabled,
          onClick: (e: MouseEvent) => {
            e.preventDefault();
            const to = +length.value;
            page.value = +length.value;
            emit('change', to, 'last');
          },
        },
      };
    });

    const range = computed(() => {
      if (
        length.value <= 0 ||
        isNaN(length.value) ||
        length.value > Number.MAX_SAFE_INTEGER
      )
        return [];
      if (totalVisible.value <= 1) return [page.value];
      if (length.value <= totalVisible.value) {
        return getRangeArr(length.value, start.value);
      }
      const even = totalVisible.value % 2 === 0;
      const middle = even
        ? totalVisible.value / 2
        : Math.floor(totalVisible.value / 2);
      const left = even ? middle : middle + 1;
      const right = length.value - middle;

      if (left - page.value >= 0) {
        return [
          ...getRangeArr(Math.max(1, totalVisible.value - 1), start.value),
          'ellipsis',
          length.value,
        ];
      } else if (page.value - right >= (even ? 1 : 0)) {
        const rangeLength = totalVisible.value - 1;
        const rangeStart = length.value - rangeLength + start.value;
        return [
          start.value,
          'ellipsis',
          ...getRangeArr(rangeLength, rangeStart),
        ];
      } else {
        const rangeLength = Math.max(1, totalVisible.value - 3);
        const rangeStart =
          rangeLength === 1
            ? page.value
            : page.value - Math.ceil(rangeLength / 2) + start.value;
        return [
          start.value,
          'ellipsis',
          ...getRangeArr(rangeLength, rangeStart),
          'ellipsis',
          length.value,
        ];
      }
    });

    const { refs, updateRef } = useRefs<ComponentPublicInstance>();

    function changePage(event: Event, to = 1) {
      event.preventDefault();
      page.value = to;
      emit('change', to);
    }

    const items = computed(() => {
      return range.value.map((item, index) => {
        const ref = (e: any) => updateRef(e, index);

        if (item === 'ellipsis') {
          return {
            active: false,
            key: `ellipsis-${index}`,
            page: item,
            props: {
              ref,
              ellipsis: true,
              disabled: true, // TODO: skipper
            },
          };
        } else {
          const active = item === page.value;
          return {
            active,
            key: `item-${item}`,
            page: item,
            props: {
              ref,
              ellipsis: false,
              disabled: !!props.disabled || +props.length < 2,
              color: active ? props.activeColor : props.color,
              onClick: (e: MouseEvent) => changePage(e, item),
            },
          };
        }
      });
    });

    const styles = computed(() => {
      let gap = undefined;
      if (props.gap) {
        const value = +props.gap;
        if (!isNaN(value)) {
          gap = toStyleSizeValue(value);
        } else if (typeof props.gap === 'string') {
          gap = props.gap;
        }
      }
      return {
        '--y-pagination__gap': gap,
      };
    });

    useRender(() => {
      return (
        <div
          class={['y-pagination']}
          role={'navigation'}
          style={styles.value}
          ref={resizeObservedRef}
        >
          <ul class={['y-pagination__list']}>
            {props.showEndButton && (
              <li key="first" class="y-pagination__first">
                {slots.first ? (
                  slots.first(controls.value.first)
                ) : (
                  <YButton {...controls.value.first}>
                    {slots['first-icon'] ? (
                      slots['first-icon']()
                    ) : (
                      <YIconPageControl type={'first'}></YIconPageControl>
                    )}
                  </YButton>
                )}
              </li>
            )}
            <li key="prev" class="y-pagination__prev">
              {slots.prev ? (
                slots.prev(controls.value.prev)
              ) : (
                <YButton {...controls.value.prev}>
                  {slots['prev-icon'] ? (
                    slots['prev-icon']()
                  ) : (
                    <YIconPageControl type={'prev'}></YIconPageControl>
                  )}
                </YButton>
              )}
            </li>
            {items.value.map((item, index) => {
              return (
                <li
                  key={item.key}
                  class={[
                    'y-pagination__item',
                    { 'y-pagination__item--active': item.active },
                  ]}
                >
                  <YButton {...item.props}>
                    {item.props.ellipsis
                      ? slots.ellipsis
                        ? slots.ellipsis()
                        : '...'
                      : item.page}
                  </YButton>
                </li>
              );
            })}
            <li key="next" class="y-pagination__next">
              {slots.next ? (
                slots.next(controls.value.next)
              ) : (
                <YButton {...controls.value.next}>
                  {slots['next-icon'] ? (
                    slots['next-icon']()
                  ) : (
                    <YIconPageControl type={'next'}></YIconPageControl>
                  )}
                </YButton>
              )}
            </li>
            {props.showEndButton && (
              <li key="last" class="y-pagination__last">
                {slots.last ? (
                  slots.last(controls.value.last)
                ) : (
                  <YButton {...controls.value.last}>
                    {slots['last-icon'] ? (
                      slots['last-icon']()
                    ) : (
                      <YIconPageControl type={'last'}></YIconPageControl>
                    )}
                  </YButton>
                )}
              </li>
            )}
          </ul>
        </div>
      );
    });

    return {
      itemCount,
      page,
      refs,
    };
  },
});
