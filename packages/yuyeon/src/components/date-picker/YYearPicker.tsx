import { PropType, computed, defineComponent, ref } from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { useDate } from '../../composables/date';
import { getRangeArr } from '../../util';
import { propsFactory } from '../../util/vue-component';
import { YButton } from '../button';

import './YYearPicker.scss';

export const pressYYearPickerPropsOptions = propsFactory(
  {
    modelValue: Number,
    color: String,
    height: [String, Number],
    min: null as any as PropType<unknown>,
    max: null as any as PropType<unknown>,
  },
  'YYearPicker',
);

const interval = 20;

export const YYearPicker = defineComponent({
  name: 'YYearPicker',
  props: pressYYearPickerPropsOptions(),
  setup(props, { emit, expose }) {
    const dateUtil = useDate();
    const model = useModelDuplex(props, 'modelValue');
    const tempYear = model.value;
    const startYear = ref(
      tempYear - (tempYear % interval) - (tempYear < 0 ? interval : 0),
    );
    const years = computed(() => {
      let date = dateUtil.startOfYear(dateUtil.date());

      return getRangeArr(interval + 1, startYear.value).map((value) => {
        date = dateUtil.setYear(date, value);
        return {
          text: dateUtil.format(date, 'year'),
          value,
          active: model.value === value,
        };
      });
    });

    function onClick(value: number) {
      model.value =  value;
    }

    function changePage(dir = 1) {
      let change = startYear.value + interval * dir;
      if (change < 0) {
        change = 0;
      }
      startYear.value = change;
    }

    expose({
      changePage,
    });

    useRender(() => {
      return (
        <div class={['y-year-picker']}>
          {years.value.map((year) => {
            const scopedProps = {
              item: year,
              props: {
                onClick: () => {
                  onClick(year.value)
                }
              }
            }
            return (
              <div class={['y-year-picker__cell']}>
                <YButton
                  variation={['rounded', 'text'].join(',')}
                  active={year.active}
                  color={props.color}
                  onClick={() => onClick(year.value)}
                >
                  {year.text}
                </YButton>
              </div>
            );
          })}
        </div>
      );
    });

    return {};
  },
});

export type YYearPicker = InstanceType<typeof YYearPicker>;
