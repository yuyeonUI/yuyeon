import { getCurrentInstance, PropType, SlotsType } from 'vue';
import { computed, ref, toRef, watch } from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { pressPolyTransitionPropsOptions } from '@/composables/transition';
import { defineComponent } from '@/util/component';
import { bindClasses, chooseProps } from '@/util/component';
import { hasElementMouseEvent } from '@/util/dom';
import { toKebabCase } from '@/util/string';

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
    coordinateStrategy: 'levitation' as const,
    scrollStrategy: 'reposition' as const,
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
    ...pressPolyTransitionPropsOptions({
      transition: 'fade',
    }),
  },
  emits: ['update:modelValue', 'afterLeave', 'hoverContent'],
  slots: Object as SlotsType<{
    default: any;
    base: any;
  }>,
  expose: ['layer$', 'baseEl'],
  setup(props, { slots, emit, expose }) {
    const vm = getCurrentInstance();
    const layer$ = ref<typeof YLayer>();

    const classes = computed(() => {
      const boundClasses = bindClasses(props.menuClasses);
      return {
        ...boundClasses,
        'y-menu': true,
      };
    });

    const active = useModelDuplex(props);
    const hovered = computed(() => !!layer$.value?.hovered);
    const finish = computed(() => !!layer$.value?.finish);
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
      emit('hoverContent', value);
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
        if (props.openOnHover && finish.value && currentActive) {
          return;
        }
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
        if ((children.value.length === 0)) {
          active.value = false;
        }
        const parentContent = parent?.$el.value?.content$;
        const parentModal = parent?.$el.value?.modal;
        if (
          !(parentContent && !hasElementMouseEvent(e, parentContent)) &&
          !parentModal &&
          !props.preventCloseBubble
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
      {
        immediate: true,
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
      active,
      hovered,
    };
  },
});

export type YMenu = InstanceType<typeof YMenu>;
