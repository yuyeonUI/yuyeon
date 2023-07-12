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
    itemText: {
      type: String as PropType<string>,
      default: 'text',
    },
    itemChildren: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: 'children',
    },
  },
  'abstract.items',
);
