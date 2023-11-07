import type { CSSProperties, PropType } from 'vue';
import {
  computed,
  defineComponent,
  mergeProps,
  nextTick,
  ref,
  watch,
  watchEffect,
} from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { polyTransitionPropOptions } from '../../composables/transition';
import { toKebabCase } from '../../util/string';
import { bindClasses } from '../../util/vue-component';
import { YLayer } from '../layer';
import { YPlate } from '../plate';

import './YTooltip.scss';

const NAME = 'YTooltip';
const KEBAB_NAME = toKebabCase(NAME);

const YTooltipPropOptions = {
  modelValue: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  tooltipClasses: {
    type: [Array, String, Object] as PropType<
      string[] | string | Record<string, any>
    >,
  },
  disabled: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  position: {
    type: String as PropType<'default' | 'top' | 'bottom' | 'left' | 'right'>,
    default: 'default',
  },
  align: {
    type: String as PropType<'center' | 'start' | 'end'>,
    default: 'center',
  },
  openOnHover: {
    type: Boolean as PropType<boolean>,
    default: true,
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
    transition: {
      ...polyTransitionPropOptions.transition,
      default: 'fade',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { slots, emit, expose }) {
    const el$ = ref<typeof YLayer>();
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

    const coordinatesStyles = computed<CSSProperties>(() => {
      const $base = baseEl.value;
      if ($base) {
        const { position, align } = props;
        const $content = contentEl.value;
        const rect = $base.getBoundingClientRect();

        let top = rect.top;
        let left = rect.left + rect.width / 2;

        if ($content) {
          if (position === 'top' || position === 'bottom') {
            if (position === 'top') {
              top -= $content.clientHeight;
              top -= 8; // Offset
            }

            if (position === 'bottom') {
              top += rect.height;
              top += 8; // Offset
            }

            if (align === 'center') {
              left -= $content.clientWidth / 2;
            } else if (align === 'end') {
              left = rect.right;
              left -= $content.clientWidth;
            }
          } else if (position === 'left' || position === 'right') {

          }
        }

        return {
          top: `${top}px`,
          left: `${left}px`,
        };
      }
      return {};
    });

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
          const $content = el$.value?.content$;
          contentEl.value = $content;
        });
      }
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

    function bindHover(el: HTMLElement) {
      el.addEventListener('mouseenter', onMouseenter);
      el.addEventListener('mouseleave', onMouseleave);
    }

    function unbindHover(el: HTMLElement) {
      el.removeEventListener('mouseenter', onMouseenter);
      el.removeEventListener('mouseleave', onMouseleave);
    }

    watch(baseEl, (neo, old) => {
      if (neo) {
        bindHover(neo);
      } else if (old) {
        unbindHover(old);
      }
    });

    useRender(() => {
      const slotBase = slots.base?.({
        active: active.value,
        props: mergeProps({
          ref: base$,
        }),
      });
      baseSlot.value = slotBase;
      return (
        <>
          {slotBase}
          <YLayer
            v-model={active.value}
            ref={el$}
            classes={classes.value}
            scrim={false}
            disabled={props.disabled}
            content-styles={{ ...coordinatesStyles.value }}
            transition={props.transition}
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
            }}
          </YLayer>
        </>
      );
    });

    return {
      base$,
      el$,
      baseEl,
      coordinatesStyles,
      baseSlot,
      active,
    };
  },
});
