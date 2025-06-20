import { Transition, computed, ref, watch } from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { useDate } from '@/composables/date';
import { omit } from '@/util';
import { chooseProps, defineComponent, propsFactory } from '@/util/component';

import { YDateCalendar, pressYDateCalendarPropsOptions } from './YDateCalendar';
import { YDatePickerControl } from './YDatePickerControl';
import { YMonthPicker } from './YMonthPicker';
import { YYearPicker } from './YYearPicker';

import './YDatePicker.scss';

export const pressYDatePickerPropsOptions = propsFactory(
  {
    ...omit(pressYDateCalendarPropsOptions(), ['modelValue']),
    modelValue: null,
  },
  'YDatePicker',
);

export const YDatePicker = defineComponent({
  name: 'YDatePicker',
  props: pressYDatePickerPropsOptions(),
  emits: ['update:month', 'update:year', 'update:modelValue', 'update:mode'],
  setup(props, { emit }) {
    const yearPicker$ = ref<typeof YYearPicker>();
    const dateUtil = useDate();
    const model = useModelDuplex(props, 'modelValue');
    const mode = useModelDuplex(props, 'mode');

    const month = ref<number>(dateUtil.getMonth(dateUtil.date()));
    const year = ref<number>(dateUtil.getYear(dateUtil.date()));

    const propMonth = Number(props.month);
    if (!isNaN(propMonth)) month.value = propMonth;
    const propYear = Number(props.year);
    if (!isNaN(propYear)) year.value = propYear;

    const displayDate = computed(() => {
      let date = dateUtil.startOfMonth(dateUtil.date());
      date = dateUtil.setYear(date, +year.value);
      return dateUtil.setMonth(date, +month.value);
    });

    const monthText = computed(() => {
      return dateUtil.format(displayDate.value, 'month');
    });

    const yearText = computed(() => {
      return dateUtil.format(displayDate.value, 'year');
    });

    function toggleMonthMode() {
      mode.value = mode.value === 'month' ? 'date' : 'month';
    }

    function toggleYearMode() {
      mode.value = mode.value === 'year' ? 'date' : 'year';
    }

    function onClickYear() {
      toggleYearMode();
    }

    function onClickMonth() {
      toggleMonthMode();
    }

    function onClickPage(dir: number) {
      if (mode.value === 'month') {
        year.value = year.value + dir;
        return;
      }
      if (mode.value === 'year') {
        yearPicker$.value?.changePage(dir);
        return;
      }
      const change = month.value + dir;
      if (change > 11) {
        year.value += 1;
        month.value = 0;
      } else if (change < 0) {
        year.value -= 1;
        month.value = 11;
      } else {
        month.value = change;
      }
    }

    function onClickPrev() {
      onClickPage(-1);
    }

    function onClickNext() {
      onClickPage(1);
    }

    watch(month, () => {
      if (mode.value === 'month') toggleMonthMode();
      emit('update:month', month.value);
    });

    watch(year, () => {
      if (mode.value === 'year') {
        mode.value = 'month';
      }
      emit('update:year', year.value);
    });

    useRender(() => (
      <div class={['y-date-picker']}>
        <YDatePickerControl
          {...chooseProps(props, YDatePickerControl.props)}
          yearText={yearText.value}
          monthText={monthText.value}
          onClick:year={onClickYear}
          onClick:month={onClickMonth}
          onClick:prev={onClickPrev}
          onClick:next={onClickNext}
        ></YDatePickerControl>
        <Transition name="fade" mode="out-in">
          {mode.value === 'month' ? (
            <YMonthPicker
              v-model={month.value}
              onMode={() => {
                mode.value = 'date';
              }}
            />
          ) : mode.value === 'year' ? (
            <YYearPicker
              v-model={year.value}
              ref={yearPicker$}
              onMode={() => {
                mode.value = 'month';
              }}
            />
          ) : (
            <YDateCalendar
              {...chooseProps(props, YDateCalendar.props)}
              hideHeader={true}
              v-model={model.value}
              v-model:month={month.value}
              v-model:year={year.value}
            />
          )}
        </Transition>
      </div>
    ));
  },
});

export type YDatePicker = InstanceType<typeof YDatePicker>;
