import { computed } from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { useDate } from '@/composables/date';
import { getRangeArr } from '@/util/common';
import { defineComponent, propsFactory } from '@/util/component';

import { YButton } from '../button';

import './YMonthPicker.scss';

export const pressYMonthPickerPropsOptions = propsFactory(
  {
    modelValue: Number,
    color: String,
    height: [String, Number],
  },
  'YMonthPicker',
);

export const YMonthPicker = defineComponent({
  name: 'YMonthPicker',
  props: pressYMonthPickerPropsOptions(),
  setup(props) {
    const dateUtil = useDate();
    const model = useModelDuplex(props, 'modelValue');

    const months = computed(() => {
      let date = dateUtil.startOfYear(dateUtil.date());

      return getRangeArr(12).map((i) => {
        const text = dateUtil.format(date, 'monthShort');
        date = dateUtil.getNextMonth(date);

        return {
          text,
          value: i,
        };
      });
    });

    function onClick(index: number) {
      model.value = index;
    }

    useRender(() => {
      return (
        <div class={['y-month-picker']}>
          {months.value.map((month, index) => {
            const item = {
              active: index === model.value,
            };
            return (
              <div class={['y-month-picker__cell', 'y-month-picker__month']}>
                <YButton
                  variation={['rounded', 'text'].join(',')}
                  active={item.active}
                  color={props.color}
                  onClick={() => onClick(index)}
                >
                  {month.text}
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

export type YMonthPicker = InstanceType<typeof YMonthPicker>;
