import { computed, type PropType, ref } from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { pressPolyTransitionPropsOptions } from '@/composables/transition';
import { omit } from '@/util/common';
import {
  bindClasses,
  chooseProps,
  defineComponent,
  propsFactory,
} from '@/util/component';

import { pressYLayerProps, YLayer } from '../layer';
import { YPlate } from '../plate';

import './YTooltip.scss';

const NAME = 'YTooltip';

const YTooltipPropOptions = {
  tooltipClasses: {
    type: [Array, String, Object] as PropType<
      string[] | string | Record<string, any>
    >,
  },
  preventClip: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  ...pressYLayerProps({
    coordinateStrategy: 'levitation' as const,
    scrollStrategy: 'reposition' as const,
    openOnHover: true,
    align: 'center',
    offset: 8,
  }),
  ...pressPolyTransitionPropsOptions({
    transition: 'fade',
  }),
};

export const pressYTooltipPropsOptions = propsFactory(
  YTooltipPropOptions,
  'YTooltip',
);

/**
 * #  Component
 */
export const YTooltip = defineComponent<
  ReturnType<typeof pressYTooltipPropsOptions>
>({
  name: NAME,
  props: {
    ...pressYTooltipPropsOptions(),
  },
  emits: ['update:modelValue'],
  setup(props, { slots, emit, expose }) {
    const model = useModelDuplex(props);

    const layer$ = ref<typeof YLayer>();

    const active = computed({
      get: (): boolean => {
        return !!model.value;
      },
      set: (v: boolean) => {
        if (!(v && props.disabled)) model.value = v;
      },
    });

    const baseEl = computed(() => {
      return layer$.value?.baseEl;
    });

    const classes = computed(() => {
      const boundClasses = bindClasses(props.tooltipClasses);
      return {
        ...boundClasses,
        'y-tooltip': true,
      };
    });

    expose({
      layer$,
      baseEl,
    });

    useRender(() => {
      return (
        <YLayer
          ref={layer$}
          {...omit(chooseProps(props, YLayer.props), ['scrim'])}
          classes={classes.value}
          scrim={false}
          transition={props.transition}
          v-model={active.value}
        >
          {{
            default: (...args: any) => {
              return (
                <>
                  <YPlate></YPlate>
                  <div class="y-tooltip__content">
                    {slots.default?.(...args) ?? ''}
                  </div>
                </>
              );
            },
            base: (...args: any[]) => slots.base?.(...args),
          }}
        </YLayer>
      );
    });

    return {
      layer$,
      el$: layer$,
      baseEl,
      active,
    };
  },
});

export type YTooltip = InstanceType<typeof YTooltip>;
