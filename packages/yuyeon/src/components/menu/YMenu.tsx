import type { PropType } from 'vue';
import {
  computed,
  defineComponent,
  ref,
  watch,
} from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import {
  pressCoordinateProps,
} from '../../composables/coordinate';
import { polyTransitionPropOptions } from '../../composables/transition';
import { toKebabCase } from '../../util/string';
import { bindClasses, chooseProps } from "../../util/vue-component";
import { YLayer } from '../layer';

import './YMenu.scss';

const NAME = 'YMenu';
const CLASS_NAME = toKebabCase(NAME);

export const YMenuPropOptions = {
  modelValue: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  menuClasses: {
    type: [Array, String, Object] as PropType<
      string[] | string | Record<string, any>
    >,
  },
  disabled: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  openOnHover: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  closeOnClick: {
    type: Boolean,
  },
  preventClip: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  ...pressCoordinateProps({
    coordinateStrategy: 'levitation',
  }),
};

/**
 * #  Component
 */
export const YMenu = defineComponent({
  name: NAME,
  props: {
    ...YMenuPropOptions,
    transition: {
      ...polyTransitionPropOptions.transition,
      default: 'fade',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { slots, emit, expose }) {
    const el$ = ref<typeof YLayer>();

    const classes = computed(() => {
      const boundClasses = bindClasses(props.menuClasses);
      return {
        ...boundClasses,
        'y-menu': true,
      };
    });

    const model = useModelDuplex(props);

    const active = computed({
      get: (): boolean => {
        return !!model.value;
      },
      set: (v: boolean) => {
        if (!(v && props.disabled)) model.value = v;
      },
    });

    function onMouseenter(e: MouseEvent) {
      if (props.openOnHover) {
        active.value = true;
      }
    }

    function onMouseleave(e: MouseEvent) {
      if (props.openOnHover) {
        active.value = false;
      }
    }

    function onClick(e: MouseEvent) {
      const currentActive = active.value;
      if (!props.disabled) {
        active.value = !currentActive;
      }
    }

    function onComplementClick(e: MouseEvent) {
      if (active.value) {
        active.value = false;
      }
    }

    function bindHover(el: HTMLElement) {
      el.addEventListener('mouseenter', onMouseenter);
      el.addEventListener('mouseleave', onMouseleave);
    }

    function unbindHover(el: HTMLElement) {
      el.removeEventListener('mouseenter', onMouseenter);
      el.removeEventListener('mouseleave', onMouseleave);
    }

    watch(() => el$.value?.baseEl, (neo, old) => {
      if (neo) {
        bindHover(neo);
        neo.addEventListener('click', onClick);
      } else if (old) {
        unbindHover(old);
        old.removeEventListener('click', onClick);
      }
    });

    useRender(() => {
      return (
        <>
          <YLayer
            ref={el$}
            classes={classes.value}
            scrim={false}
            disabled={props.disabled}
            content-classes={['y-menu__content']}
            transition={props.transition}
            onClick:complement={onComplementClick}
            {...chooseProps(props, YLayer.props)}
            v-model={active.value}
          >
            {{
              default: (...args: any) => {
                return <>{slots.default?.(...args) ?? ''}</>;
              },
              base: () => slots.base?.(),
            }}
          </YLayer>
        </>
      );
    });

    return {
      el$,
    };
  },
});

export type YMenu = InstanceType<typeof YMenu>;
