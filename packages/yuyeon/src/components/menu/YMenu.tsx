import type { CSSProperties, PropType } from 'vue';
import {
  computed,
  defineComponent,
  mergeProps,
  nextTick,
  ref,
  toRef,
  watch,
  watchEffect,
} from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { polyTransitionPropOptions } from '../../composables/transition';
import { toKebabCase } from '../../util/string';
import { bindClasses } from '../../util/vue-component';
import { YLayer } from '../layer';
import './YMenu.scss';
import { toStyleSizeValue } from "../../util/ui";

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
  position: {
    type: String as PropType<'default' | 'top' | 'bottom' | 'left' | 'right'>,
    default: 'default',
  },
  align: {
    type: String as PropType<'center' | 'start' | 'end'>,
    default: 'start',
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
  offsetY: {
    type: [Number, String],
  }
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
    const base$ = ref();
    const baseSlot = ref();
    const baseEl = ref<HTMLElement>();
    const contentEl = ref<HTMLElement>();

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

    const position = toRef(props, 'position');
    const align = toRef(props, 'align');
    const coordinate = ref<CSSProperties>();
    const coordinateStyles = computed<CSSProperties>(() => {
      return coordinate.value ?? {};
    });

    function computeCoordinates() {
      const $base = baseEl.value;
      const actived = active.value;
      if ($base && actived) {
        const $content = contentEl.value;
        const rect = $base.getBoundingClientRect();

        let top = rect.top;
        let left = rect.left + rect.width / 2;
        if ($content) {
          if (position.value === 'top' || position.value === 'bottom') {
            if (position.value === 'top') {
              top -= $content.clientHeight;
              top -= 8; // Offset
            }
            if (position.value === 'bottom') {
              top += rect.height;
              top += 8; // Offset
            }
          }

          if (align.value === 'center') {
            left -= $content.clientWidth / 2;
          } else if (align.value === 'start') {
            left = rect.left;
          } else if (align.value === 'end') {
            left = rect.right;
            left -= $content.clientWidth;
          }
        }

        if (props.offsetY) {
          top += +(props.offsetY);
        }

        return {
          top: `${top}px`,
          left: `${left}px`,
          minWidth: toStyleSizeValue(rect.width),
        };
      }
      return {};
    }

    const baseFromSlotEl = computed(() => {
      return baseSlot.value?.[0]?.el;
    });

    watchEffect(() => {
      if (!base$.value) {
        baseEl.value = baseFromSlotEl.value;
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
          coordinate.value = computeCoordinates();
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

    watch(baseEl, (neo, old) => {
      if (neo) {
        bindHover(neo);
        neo.addEventListener('click', onClick);
      } else if (old) {
        unbindHover(old);
        old.removeEventListener('click', onClick);
      }
    });

    useRender(() => {
      const slotBase = slots.base?.({
        active: active.value,
        props: mergeProps({
          ref: base$,
          class: {
            'y-menu-base': true,
            'y-menu-base--active': active.value,
          }
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
            content-styles={{ ...coordinateStyles.value }}
            content-classes={['y-menu__content']}
            transition={props.transition}
            onClick:complement={onComplementClick}
          >
            {{
              default: (...args: any) => {
                return <>{slots.default?.(...args) ?? ''}</>;
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
      coordinatesStyles: coordinateStyles,
      baseSlot,
    };
  },
});

export type YMenu = InstanceType<typeof YMenu>;
