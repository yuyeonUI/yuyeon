import { PropType, defineComponent, ref } from 'vue';

import { useRender } from '../../composables/component';
import { toKebabCase } from '../../util/string';

const NAME = 'YBench';
const KEBAB_NAME = toKebabCase(NAME);

const YBenchPropOptions = {
  tag: {
    type: String as PropType<string>,
    default: 'div',
  },
  position: {
    type: String as PropType<'top' | 'left' | 'right' | 'bottom'>,
    default: 'top',
  },
  floating: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: 48,
  },
};

/**
 * # Base Component
 */
export const YBench = defineComponent({
  name: NAME,
  setup(looseProps, { slots }) {
    const props = defineProps(YBenchPropOptions);
    const el$ = ref<HTMLElement>();

    useRender(() => <props.tag ref={el$}>{slots.default?.()}</props.tag>);
  },
});
