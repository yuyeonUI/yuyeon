import { computed, ref, Transition, watch } from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { useDate } from '@/composables/date';
import { omit } from '@/util';
import { chooseProps, defineComponent, propsFactory } from '@/util/component';

import { pressYDateCalendarPropsOptions, YDateCalendar } from './YDateCalendar';
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
  emits: [
    'update:month',
    'update:year',
    'update:modelValue',
    'update:mode',
    'click:day',
  ],
  setup(props, { emit }) {
    const yearPicker$ = ref<typeof YYearPicker>();
    const dateUtil = useDate();
    const model = useModelDuplex(props, 'modelValue');
    const mode = useModelDuplex(props, 'mode');

    const month = useModelDuplex(props, 'month');
    const year = useModelDuplex(props, 'year');

    const controlMonth = computed({
      get: () => {
        return month.value != null || !Number.isNaN(Number(month.value))
          ? Number(month.value)
          : dateUtil.getMonth(dateUtil.date());
      },
      set: (value: number) => {
        month.value = value;
      },
    });

    const controlYear = computed({
      get: () => {
        return year.value != null || !Number.isNaN(Number(year.value))
          ? Number(year.value)
          : dateUtil.getYear(dateUtil.date());
      },
      set: (value: number) => {
        year.value = value;
      },
    });

    const displayDate = computed(() => {
      let date = dateUtil.startOfMonth(dateUtil.date());
      date = dateUtil.setYear(date, +controlYear.value);
      return dateUtil.setMonth(date, +controlMonth.value);
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
        controlYear.value = controlYear.value + dir;
        return;
      }
      if (mode.value === 'year') {
        yearPicker$.value?.changePage(dir);
        return;
      }
      const change = controlMonth.value + dir;
      if (change > 11) {
        controlYear.value += 1;
        controlMonth.value = 0;
      } else if (change < 0) {
        controlYear.value -= 1;
        controlMonth.value = 11;
      } else {
        controlMonth.value = change;
      }
    }

    function onClickPrev() {
      onClickPage(-1);
    }

    function onClickNext() {
      onClickPage(1);
    }

    function onClickDay(item: any) {
      emit('click:day', item.date);
    }

    watch(controlMonth, () => {
      if (mode.value === 'month') toggleMonthMode();
      emit('update:month', controlMonth.value);
    });

    watch(controlYear, () => {
      if (mode.value === 'year') {
        mode.value = 'month';
      }
      emit('update:year', controlYear.value);
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
              v-model={controlMonth.value}
              onMode={() => {
                mode.value = 'date';
              }}
            />
          ) : mode.value === 'year' ? (
            <YYearPicker
              v-model={controlYear.value}
              ref={yearPicker$}
              onMode={() => {
                mode.value = 'month';
              }}
            />
          ) : (
            <YDateCalendar
              {...omit(chooseProps(props, YDateCalendar.props), [
                'onClick:day',
              ])}
              hideHeader={true}
              v-model={model.value}
              v-model:month={controlMonth.value}
              v-model:year={controlYear.value}
              onClick:day={onClickDay}
            />
          )}
        </Transition>
      </div>
    ));
  },
});

export type YDatePicker = InstanceType<typeof YDatePicker>;
