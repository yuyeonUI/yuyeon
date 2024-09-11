import type { PropType } from 'vue';
import { computed } from 'vue';

import { useRender } from '@/composables/component';
import { defineComponent, propsFactory } from '@/util/component';

import { YButton } from '../button';
import { YIcon } from '../icon';

import './YDatePickerControl.scss';

export const pressYDatePickerControlPropsOptions = propsFactory(
  {
    disabled: {
      type: [Boolean, String, Array] as PropType<boolean | string | string[]>,
      default: false,
    },
    nextIcon: {
      type: [String, Object],
      default: '$next',
    },
    prevIcon: {
      type: [String, Object],
      default: '$prev',
    },
    dropdownIcon: {
      type: [String, Object],
    },
    mode: {
      type: String as PropType<'date' | 'month' | 'year'>,
      default: 'date',
    },
    yearText: String,
    monthText: String,
  },
  'YDataPickerControl',
);

export const YDatePickerControl = defineComponent({
  name: 'YDatePickerControl',
  props: pressYDatePickerControlPropsOptions(),
  emits: {
    'click:year': () => true,
    'click:month': () => true,
    'click:prev': () => true,
    'click:next': () => true,
  },
  setup(props, { emit }) {
    const disableYear = computed(() => {
      return Array.isArray(props.disabled)
        ? props.disabled.includes('year')
        : !!props.disabled;
    });
    const disableMonth = computed(() => {
      return Array.isArray(props.disabled)
        ? props.disabled.includes('month')
        : !!props.disabled;
    });

    const disablePrev = computed(() => {
      return Array.isArray(props.disabled)
        ? props.disabled.includes('prev')
        : !!props.disabled;
    });
    const disableNext = computed(() => {
      return Array.isArray(props.disabled)
        ? props.disabled.includes('next')
        : !!props.disabled;
    });

    function onClickPrev() {
      emit('click:prev');
    }

    function onClickNext() {
      emit('click:next');
    }

    function onClickYear() {
      emit('click:year');
    }

    function onClickMonth() {
      emit('click:month');
    }

    useRender(() => (
      <div class={['y-date-picker-control']}>
        <YButton
          variation="text"
          class="y-date-picker-control__display"
          disabled={disableYear.value}
          onClick={onClickYear}
        >
          {props.yearText}
        </YButton>
        <YButton
          variation="text"
          class="y-date-picker-control__display"
          disabled={disableMonth.value}
          onClick={onClickMonth}
        >
          {props.monthText}
        </YButton>
        <div class="flex-spacer"></div>
        <YButton
          class="y-date-picker-control__page-button"
          variation="text"
          disabled={disablePrev.value}
          onClick={onClickPrev}
        >
          <YIcon icon={props.prevIcon as string} />
        </YButton>
        <YButton
          class="y-date-picker-control__page-button"
          variation="text"
          disabled={disableNext.value}
          onClick={onClickNext}
        >
          <YIcon icon={props.nextIcon as string} />
        </YButton>
      </div>
    ));
  },
});

export type YDatePickerControl = InstanceType<typeof YDatePickerControl>;
