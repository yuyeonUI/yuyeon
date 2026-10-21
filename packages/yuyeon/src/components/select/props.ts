import type { PropType } from 'vue';

import { pressCoordinateProps } from '@/composables/coordinate';
import { pressListItemsPropsOptions } from '@/composables/list-items';
import { deepEqual, omit } from '@/util/common';
import { propsFactory } from '@/util/component';

import { pressYFieldInputPropsOptions } from '../field-input';
import type { YIconIconProp } from '../icon';
import type { YMenu } from '../menu';

export type ItemComparator = (
  optionsItem: any,
  valueItem: any,
  valueKey?: string,
) => boolean;

export const pressSelectPropsOptions = propsFactory(
  {
    opened: Boolean as PropType<boolean>,
    closeOnBlur: Boolean as PropType<boolean>,
    multiple: Boolean,
    itemComparator: {
      type: Function as PropType<ItemComparator>,
      default: deepEqual,
    },
    defaultSelect: Boolean,
    menuProps: {
      type: Object as PropType<YMenu['$props']>,
    },
    listItemProps: {
      type: Object as PropType<any>,
    },
    ...pressListItemsPropsOptions(),
  },
  'Select',
);

export const selectFieldPropsOptions = {
  maxHeight: {
    type: [Number, String],
    default: 310,
  },
  dropdownIcon: {
    type: [String, Array, Object] as PropType<YIconIconProp>,
    default: '$dropdown',
  },
  openDelay: {
    type: Number as PropType<number>,
    default: 200,
  },
  closeDelay: {
    type: Number as PropType<number>,
    default: 200,
  },
  ...pressSelectPropsOptions(),
  ...pressYFieldInputPropsOptions(),
  ...omit(pressCoordinateProps({ position: 'bottom' as 'bottom' }), [
    'coordinateStrategy',
  ]),
};

export const pressYSelectPropsOptions = propsFactory(
  selectFieldPropsOptions,
  'YSelect',
);
