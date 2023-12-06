import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { useDate } from '../../composables/date';
import { useI18n } from '../../composables/i18n';
import { wrapInArray } from '../../util';
import { propsFactory } from '../../util/vue-component';
import { YButton } from '../button';

import './YDateCalendar.scss';

export const pressYDateCalendarPropsOptions = propsFactory(
  {
    year: [Number, String],
    month: [Number, String],
    modelValue: Array as PropType<unknown[]>,
    multiple: Boolean,
    range: Boolean,
    allowedDates: [Array, Function],
    max: null as any as PropType<unknown>,
    min: null as any as PropType<unknown>,
    disabled: Boolean,
    color: String,
    hideWeekdays: Boolean,
    showAdjacentMonthDates: {
      type: Boolean,
      default: true,
    },
    hideHeader: Boolean,
  },
  'YDateCalendar',
);

export const YDateCalendar = defineComponent({
  name: 'YDateCalendar',
  props: pressYDateCalendarPropsOptions(),
  emits: {
    'update:modelValue': (date: any) => true,
    'update:year': (date: any) => true,
    'update:month': (date: any) => true,
  },
  setup(props, { slots }) {
    const dateUtil = useDate();
    const i18n = useI18n();
    const container$ = ref();
    const day$ = ref([]);

    const model = useModelDuplex(props, 'modelValue', [], (v) =>
      wrapInArray(v),
    );

    const displayValue = computed(() => {
      if (model.value.length > 0) return dateUtil.date(model.value[0]);
      if (props.min) return dateUtil.date(props.min);
      if (Array.isArray(props.allowedDates)) {
        return dateUtil.date(props.allowedDates[0]);
      }

      return dateUtil.date();
    });

    const year = useModelDuplex(
      props,
      'year',
      undefined,
      (v) => {
        const value =
          v != null ? Number(v) : dateUtil.getYear(displayValue.value);

        return dateUtil.startOfYear(dateUtil.setYear(dateUtil.date(), value));
      },
      (v) => dateUtil.getYear(v),
    );

    const month = useModelDuplex(
      props,
      'month',
      undefined,
      (v) => {
        const value =
          v != null ? Number(v) : dateUtil.getMonth(displayValue.value);
        const date = dateUtil.setYear(
          dateUtil.date(),
          dateUtil.getYear(year.value),
        );

        return dateUtil.setMonth(date, value);
      },
      (v) => dateUtil.getMonth(v),
    );

    const weeksInMonth = computed(() => {
      const weeks = dateUtil.getWeekArray(month.value);
      const days = weeks.flat();

      const daysInMonth = 6 * 7;
      if (days.length < daysInMonth) {
        const lastDay = days[days.length - 1];

        let week = [];
        for (let day = 1; day <= daysInMonth - days.length; day++) {
          week.push(dateUtil.addDays(lastDay, day));

          if (day % 7 === 0) {
            weeks.push(week);
            week = [];
          }
        }
      }

      return weeks;
    });

    const daysInMonth = computed(() => {
      const weeks = weeksInMonth.value;
      const today = dateUtil.date();

      return weeks.map((days, weekIndex) =>
        days.map((date, index) => {
          const isoDate = dateUtil.toISO(date);
          const adjacent = !dateUtil.isSameMonth(date, month.value);
          const selected = model.value.some((value: unknown) =>
            dateUtil.isSameDay(date, value),
          );
          return {
            date,
            isoDate,
            formatted: dateUtil.format(date, 'keyboardDate'),
            year: dateUtil.getYear(date),
            month: dateUtil.getMonth(date),
            day: dateUtil.getDay(date),
            disabled: isDisabled(date),
            weekStart: index % 7 === 0,
            weekEnd: index % 7 === 6,
            rangeStart:
              selected &&
              model.value.length > 1 &&
              dateUtil.isSameDay(rangeStart.value, date),
            rangeEnd:
              selected &&
              model.value.length === 2 &&
              dateUtil.isSameDay(rangeEnd.value, date),
            weekIndex,
            selected,
            interval: isInterval(date),
            today: dateUtil.isSameDay(date, today),
            adjacent,
            hidden: adjacent && !props.showAdjacentMonthDates,
            hovered: false,
            localized: dateUtil.format(date, 'dayOfMonth'),
          };
        }),
      );
    });

    const weekDays = computed(() => {
      return i18n.locale && dateUtil.getWeekdays();
    });

    const displayYearMonth = computed(() => {
      return dateUtil.format(month.value, 'monthAndYear');
    });

    const rangeStart = computed(() => {
      if (props.range && model.value?.[0]) {
        return model.value[0];
      }
    });

    const rangeEnd = computed(() => {
      if (props.range && model.value?.[1]) {
        return model.value[1];
      }
    });

    function isDisabled(value: unknown) {
      if (props.disabled) return true;

      const date = dateUtil.date(value);

      if (props.min && dateUtil.isAfter(dateUtil.date(props.min), date))
        return true;
      if (props.max && dateUtil.isAfter(date, dateUtil.date(props.max)))
        return true;

      if (Array.isArray(props.allowedDates) && props.allowedDates.length > 0) {
        return !props.allowedDates.some((d) =>
          dateUtil.isSameDay(dateUtil.date(d), date),
        );
      }

      if (typeof props.allowedDates === 'function') {
        return !props.allowedDates(date);
      }

      return false;
    }

    function isInterval(value: unknown) {
      if (!props.range) return false;
      if (model.value.length === 2) {
        const date = dateUtil.date(value);
        const startDate = dateUtil.date(model.value[0]);
        const endDate = dateUtil.date(model.value[1]);
        if (
          dateUtil.isAfter(date, startDate) &&
          dateUtil.isBefore(date, endDate)
        ) {
          return true;
        }
      }
      return false;
    }

    function onClickDay(item: any) {
      const value = item.date;
      if (props.multiple) {
        const index = model.value.findIndex((selection: unknown) =>
          dateUtil.isSameDay(selection, value),
        );

        if (props.range) {
          if (model.value.length === 1) {
            const firstDate = dateUtil.date(model.value[0]);
            const date = dateUtil.date(value);
            if (dateUtil.isAfter(firstDate, date)) {
              model.value = [date, dateUtil.endOfDay(model.value[0])];
            } else {
              model.value = [
                dateUtil.startOfDay(model.value[0]),
                dateUtil.endOfDay(value),
              ];
            }
          } else {
            model.value = [value];
          }
        } else {
          if (index === -1) {
            model.value = [...model.value, value];
          } else {
            const change = [...model.value];
            change.splice(index, 1);
            model.value = change;
          }
        }
      } else {
        model.value = [value];
      }
    }

    useRender(() => (
      <div
        class={[
          'y-date-calendar',
          { 'y-date-calendar--range': props.range && model.value.length === 2 },
        ]}
      >
        {!props.hideHeader && (
          <header class="y-date-calendar__header">
            {slots.header ? slots.header() : displayYearMonth.value}
          </header>
        )}
        <div ref={container$} class={['y-date-calendar__container']}>
          {!props.hideWeekdays && (
            <div class={['y-date-calendar__week']}>
              {weekDays.value.map((weekDay) => (
                <div
                  class={['y-date-calendar__cell', 'y-date-calendar__weekday']}
                >
                  {weekDay}
                </div>
              ))}
            </div>
          )}
          {daysInMonth.value.map((week, i) => {
            return (
              <div
                class={['y-date-calendar__week']}
                role="row"
                aria-rowindex={i}
              >
                {week.map((item, index) => {
                  const slotProps = {
                    props: {
                      onClick: () => {
                        onClickDay(item);
                      },
                    },
                    item,
                    index,
                  } as const;

                  return (
                    <div
                      class={[
                        'y-date-calendar__cell',
                        'y-date-calendar__day',
                        {
                          'y-date-calendar__day--adjacent': item.adjacent,
                          'y-date-calendar__day--hovered': item.hovered,
                          'y-date-calendar__day--selected': item.selected,
                          'y-date-calendar__day--week-start': item.weekStart,
                          'y-date-calendar__day--week-end': item.weekEnd,
                          'y-date-calendar__day--range-interval': item.interval,
                          'y-date-calendar__day--range-start': item.rangeStart,
                          'y-date-calendar__day--range-end': item.rangeEnd,
                        },
                      ]}
                      data-date={!item.disabled ? item.isoDate : undefined}
                    >
                      {(props.showAdjacentMonthDates || !item.adjacent) && (
                        <>
                          {slots.day?.(slotProps) ?? (
                            <YButton
                              color={
                                (item.selected || item.today) && !item.disabled
                                  ? props.color
                                  : undefined
                              }
                              disabled={item.disabled}
                              variation={[
                                'icon',
                                item.selected
                                  ? 'filled'
                                  : item.today
                                  ? 'outlined'
                                  : 'text',
                              ].join(',')}
                              {...slotProps.props}
                            >
                              {item.day}
                            </YButton>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    ));

    return {
      day$,
      container$,
      dateUtil,
      displayValue,
      month,
      year,
      rangeStart,
      rangeEnd,
      model,
    };
  },
});

export type YDateCalendar = InstanceType<typeof YDateCalendar>;
