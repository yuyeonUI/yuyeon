import type { PropType } from 'vue';
import {
  computed,
  defineComponent,
  nextTick,
  ref,
  watch,
  watchEffect,
} from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { polyTransitionPropOptions } from '../../composables/transition';
import { omit } from '../../util';
import { bindClasses, chooseProps } from '../../util/vue-component';
import { YLayer, pressYLayerProps } from '../layer';
import { useDelay } from '../layer/active-delay';
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
};

/**
 * #  Component
 */
export const YTooltip = defineComponent({
  name: NAME,
  props: {
    ...YTooltipPropOptions,
    ...pressYLayerProps({
      coordinateStrategy: 'levitation',
      openOnHover: true,
      align: 'center',
      offset: 8,
    }),
    transition: {
      ...polyTransitionPropOptions.transition,
      default: 'fade',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { slots, emit, expose }) {
    const layer$ = ref<typeof YLayer>();
    const base$ = ref();
    const baseSlot = ref();
    const baseEl = ref<HTMLElement>();
    const contentEl = ref<HTMLElement>();

    const classes = computed(() => {
      const boundClasses = bindClasses(props.tooltipClasses);
      return {
        ...boundClasses,
        'y-tooltip': true,
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

    const hovered = computed(() => !!layer$.value?.hovered);

    const baseFromSlotEl = computed(() => {
      return baseSlot.value?.[0]?.el;
    });

    watchEffect(() => {
      if (!base$.value) {
        if (baseFromSlotEl.value?.nodeType !== 3) {
          baseEl.value = baseFromSlotEl.value;
        }
        return;
      }
      const base = base$.value;
      baseEl.value = base$.value?.$el ? base$.value?.$el : base;
    });

    watch(active, (neo) => {
      if (neo) {
        nextTick(() => {
          const $content = layer$.value?.content$;
          contentEl.value = $content;
        });
      }
    });

    const { startOpenDelay, startCloseDelay } = useDelay(
      props,
      (changeActive) => {
        if (!changeActive && props.openOnHover && !hovered.value) {
          active.value = false;
        } else if (changeActive) {
          active.value = true;
        }
      },
    );

    function onMouseenter(e: MouseEvent) {
      if (props.openOnHover) {
        startOpenDelay();
      }
    }

    function onMouseleave(e: MouseEvent) {
      if (props.openOnHover) {
        startCloseDelay();
      }
    }

    watch(hovered, (value) => {
      if (!value) {
        startCloseDelay();
      }
    });

    function bindHover(el: HTMLElement) {
      el.addEventListener('mouseenter', onMouseenter);
      el.addEventListener('mouseleave', onMouseleave);
    }

    function unbindHover(el: HTMLElement) {
      el.removeEventListener('mouseenter', onMouseenter);
      el.removeEventListener('mouseleave', onMouseleave);
    }

    watch(
      () => layer$.value?.baseEl,
      (neo, old) => {
        if (neo) {
          bindHover(neo);
        } else if (old) {
          unbindHover(old);
        }
      },
    );

    useRender(() => {
      return (
        <>
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
        </>
      );
    });

    return {
      base$,
      el$: layer$,
      baseEl,
      baseSlot,
      active,
    };
  },
});

export type YTooltip = InstanceType<typeof YTooltip>;
