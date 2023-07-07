import { PropType } from 'vue';

import { propsFactory } from '../util/vue-component';

export const pressItemsPropsOptions = propsFactory(
  {
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    itemKey: {
      type: String as PropType<string>,
      default: 'key',
    },
    textKey: {
      type: String as PropType<string>,
      default: 'text',
    },
  },
  'abstract.items',
);
