import type { PropType } from 'vue';

import type { ListItem } from '@/composables/list-items';
import { propsFactory } from '@/util/component';

import { selectFieldPropsOptions } from '../select/props';

export type ComboboxFilter = (item: ListItem, search: string) => boolean;

export const pressYComboboxPropsOptions = propsFactory(
  {
    ...selectFieldPropsOptions,
    closeOnBlur: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    /** Keep the selected label separate from the search query. */
    separateSearch: Boolean as PropType<boolean>,
    search: String as PropType<string>,
    searchLoading: Boolean as PropType<boolean>,
    disableFilter: Boolean as PropType<boolean>,
    /** Pixel spacing above the active item when it is scrolled into view. */
    activeOffset: {
      type: Number as PropType<number>,
      default: 8,
    },
    filter: Function as PropType<ComboboxFilter>,
  },
  'YCombobox',
);
