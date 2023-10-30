import { PropType, defineComponent, ref } from 'vue';

import { useRender } from '../../composables/component';
import { toKebabCase } from '../../util/string';

const NAME = 'YAlert';
const KEBAB_NAME = toKebabCase(NAME);

const YAlertPropOptions = {
    outlined: {
        type: Boolean as PropType<boolean>,
    },
};

/**
 * #  Component
 */
export const YAlert = defineComponent({
    name: NAME,
    props: {
        ...YAlertPropOptions,
    },
    setup(looseProps, { slots }) {
        const props = defineProps(YAlertPropOptions);
        const el$ = ref<HTMLElement>();

        useRender(() => <div ref={el$}>{slots.default?.()}</div>);
    },
});
