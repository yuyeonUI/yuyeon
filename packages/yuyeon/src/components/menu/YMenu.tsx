import type { PropType } from 'vue';
import { computed, defineComponent, ref, toRef, watch } from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { polyTransitionPropOptions } from '../../composables/transition';
import { hasElementMouseEvent } from '../../util/dom';
import { toKebabCase } from '../../util/string';
import { bindClasses, chooseProps } from '../../util/vue-component';
import { YLayer, pressYLayerProps } from '../layer';
import { useDelay } from '../layer/active-delay';
import { useActiveStack } from '../layer/active-stack';

import './YMenu.scss';

const NAME = 'YMenu';
const CLASS_NAME = toKebabCase(NAME);

export const YMenuPropOptions = {
  menuClasses: {
    type: [Array, String, Object] as PropType<
      string[] | string | Record<string, any>
    >,
  },
  openOnClickBase: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  closeCondition: {
    type: [Boolean, Function],
    default: undefined,
  },
  preventClip: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  ...pressYLayerProps({
    coordinateStrategy: 'levitation',
  }),
  preventCloseBubble: Boolean as PropType<boolean>,
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
  emits: ['update:modelValue', 'afterLeave'],
  expose: ['layer$', 'baseEl'],
  setup(props, { slots, emit, expose }) {
    const layer$ = ref<typeof YLayer>();

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

    const hovered = computed(() => !!layer$.value?.hovered);
    const { children, parent } = useActiveStack(
      layer$,
      active,
      toRef(props, 'preventCloseBubble'),
    );
    const { startOpenDelay, startCloseDelay } = useDelay(
      props,
      (changeActive) => {
        if (
          !changeActive &&
          props.openOnHover &&
          !hovered.value &&
          children.value.length === 0
        ) {
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

    function onClick(e: MouseEvent) {
      e.stopPropagation();
      if (!props.openOnClickBase) {
        return;
      }
      const currentActive = active.value;
      if (!props.disabled) {
        active.value = !currentActive;
      }
    }

    function onComplementClick(e: Event) {
      if (props.closeCondition === false) {
        return;
      }
      if (typeof props.closeCondition === 'function') {
        if (props.closeCondition(e) === false) {
          active.value = false;
          return;
        }
      }
      if (active.value) {
        if ((!parent && children.value.length === 0) || parent) {
          active.value = false;
        }
        const parentContent = parent?.$el.value?.content$;
        const parentModal = parent?.$el.value?.modal;
        if (
            !(parentContent && !hasElementMouseEvent(e, parentContent)) &&
            !parentModal
        ) {
          parent?.clear();
        }
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

    watch(
      () => layer$.value?.baseEl,
      (neo, old) => {
        if (neo) {
          bindHover(neo);
          neo.addEventListener('click', onClick);
        } else if (old) {
          unbindHover(old);
          old.removeEventListener('click', onClick);
        }
      },
    );

    const computedContentClasses = computed<Record<string, boolean>>(() => {
      const boundClasses = bindClasses(props.contentClasses);
      return {
        ...boundClasses,
      };
    });

    const baseEl = computed(() => {
      return layer$.value?.baseEl;
    });

    expose({
      layer$,
      baseEl,
    });

    useRender(() => {
      return (
        <>
          <YLayer
            ref={layer$}
            transition={props.transition}
            onClick:complement={onComplementClick}
            onAfterLeave={() => emit('afterLeave')}
            {...{
              ...chooseProps(props, YLayer.props),
              classes: classes.value,
              scrim: false,
              contentClasses: {
                'y-menu__content': true,
                ...computedContentClasses.value,
              },
            }}
            v-model={active.value}
          >
            {{
              default: (...args: any) => {
                return <>{slots.default?.(...args) ?? ''}</>;
              },
              base: (...args: any[]) => slots.base?.(...args),
            }}
          </YLayer>
        </>
      );
    });

    return {
      layer$,
      baseEl,
      classes,
      children,
      parent,
    };
  },
});

export type YMenu = InstanceType<typeof YMenu>;
