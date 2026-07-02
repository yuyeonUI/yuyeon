import {
  type ComponentInternalInstance,
  cloneVNode,
  computed,
  getCurrentInstance,
  mergeProps,
  type PropType,
  reactive,
  ref,
  type SlotsType,
  shallowRef,
  Teleport,
  Transition,
  toRef,
  watch,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { pressCoordinateProps, useCoordinate } from '@/composables/coordinate';
import {
  pressDimensionPropsOptions,
  useDimension,
} from '@/composables/dimension';
import { useLayerGroup } from '@/composables/layer-group';
import { pressThemePropsOptions, useLocalTheme } from '@/composables/theme';
import { useLazy } from '@/composables/timing';
import {
  PolyTransition,
  pressPolyTransitionPropsOptions,
  usePolyTransition,
} from '@/composables/transition';
import {
  ComplementClick,
  type ComplementClickBindingOptions,
} from '@/directives/complement-click';
import { bindClasses, defineComponent, propsFactory } from '@/util/component';

import { pressBasePropsOptions, useBase } from './base';
import {
  pressScrollStrategyProps,
  useScrollStrategies,
} from './scroll-strategies';

import './YLayer.scss';

import {
  pressActiveEventProps,
  pressContentPropsOptions,
  useActiveEvent,
} from '@/components/layer/active-event';
import { useActiveStack } from '@/components/layer/active-stack';
import type { CssProperties } from '@/types';
import { noop } from '@/util';
import { isEventsApplied } from '@/util/component/vnode-event';

export const pressYLayerProps = propsFactory(
  {
    modelValue: {
      type: Boolean as PropType<boolean>,
    },
    pinned: {
      type: Boolean as PropType<boolean>,
      default: undefined,
    },
    scrim: {
      type: Boolean as PropType<boolean>,
    },
    scrimOpacity: {
      type: Number as PropType<number>,
    },
    eager: {
      type: Boolean as PropType<boolean>,
    },
    classes: {
      type: [Array, String, Object] as PropType<
        string[] | string | Record<string, any>
      >,
    },
    contentClasses: {
      type: [Array, String, Object] as PropType<
        string[] | string | Record<string, any>
      >,
    },
    closeClickScrim: {
      type: Boolean as PropType<boolean>,
    },
    contentStyles: {
      type: Object as PropType<CssProperties>,
      default: () => {},
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    maximized: {
      type: Boolean as PropType<boolean>,
    },
    openDelay: {
      type: Number as PropType<number>,
      default: 200,
    },
    closeDelay: {
      type: Number as PropType<number>,
      default: 200,
    },
    zIndex: {
      type: [Number, String] as PropType<number | string>,
      default: 2000,
    },
    contained: Boolean,
    layerGroup: [String, Object] as PropType<string | Element>,
    ...pressActiveEventProps(),
    ...pressThemePropsOptions(),
    ...pressPolyTransitionPropsOptions(),
    ...pressBasePropsOptions(),
    ...pressContentPropsOptions(),
    ...pressCoordinateProps(),
    ...pressScrollStrategyProps(),
    ...pressDimensionPropsOptions(),
    preventCloseBubble: Boolean as PropType<boolean>,
    closeCondition: {
      type: [Boolean, Function],
      default: undefined,
    },
  },
  'YLayer',
);

export const YLayer = defineComponent({
  name: 'YLayer',
  inheritAttrs: false,
  components: {
    PolyTransition,
  },
  directives: {
    ComplementClick,
  },
  props: {
    modal: Boolean as PropType<boolean>,
    relayStack: Boolean,
    ...pressYLayerProps(),
  },
  emits: {
    'update:modelValue': (value: boolean) => true,
    'update:pinned': (value: boolean) => true,
    'click:complement': (mouseEvent: MouseEvent) => true,
    afterLeave: () => true,
    afterEnter: () => true,
  },
  slots: Object as SlotsType<{
    base: any;
    default: any;
  }>,
  setup(props, { emit, expose, attrs, slots }) {
    const vm = getCurrentInstance();
    const finish = shallowRef(false);
    const disabled = toRef(props, 'disabled');
    const maximized = toRef(props, 'maximized');
    const scrim$ = ref<HTMLElement>();
    const content$ = ref<HTMLElement>();
    const root$ = ref<HTMLElement>();
    const model = useModelDuplex(props);
    const pinned = useModelDuplex(props, 'pinned', false);
    const active = computed({
      get: (): boolean => {
        return !!model.value;
      },
      set: (v: boolean) => {
        if (!(v && props.disabled)) model.value = v;
      },
    });
    // __ Composition
    const { themeClasses } = useLocalTheme(props);
    const { polyTransitionBindProps } = usePolyTransition(props);
    const { dimensionStyles } = useDimension(props);
    // base -> layerGroup -> activeStack -> activeEvent;
    const { base, base$, baseEl, baseSlot, baseFromSlotEl, pivot } =
      useBase(props);
    const { layerGroup, layerGroupState, getActiveLayers } =
      useLayerGroup(props);
    const { children, parent, relayId, handleOutsideClick } = useActiveStack(
      props,
      active,
      pinned,
    );
    const { hovered, focused, baseEvents, contentEvents } = useActiveEvent(
      props,
      {
        active,
        pinned,
        children,
        base,
        finish,
        baseSlotEl: baseFromSlotEl,
      },
    );
    // Render timing
    const { lazyValue, onAfterUpdate } = useLazy(toRef(props, 'eager'), active);

    const isRendering = computed<boolean>(
      () => !disabled.value && (lazyValue.value || active.value),
    );
    // #Content to Pivot
    // coordinate -> scroll
    const { coordination, coordinateStyles, updateCoordinate } = useCoordinate(
      props,
      {
        contentEl: content$,
        base,
        active,
        pivot,
      },
    );

    useScrollStrategies(props, {
      root: root$,
      contentEl: content$,
      active,
      baseEl: base,
      updateCoordinate,
    });

    watch(active, (neo) => {
      if (!neo) {
        finish.value = false;
        hovered.value = false;
      }
    });

    function onClickOutsideLayer(mouseEvent: MouseEvent) {
      emit('click:complement', mouseEvent);

      if (!shouldClose(mouseEvent)) {
        return;
      }

      if (props.modal) {
        if (
          scrim$.value !== null &&
          scrim$.value === mouseEvent.target &&
          props.closeClickScrim
        ) {
          active.value = false;
        }
      } else {
        handleOutsideClick(mouseEvent);
      }
    }

    function closeConditional(): boolean {
      return (
        (!props.openOnHover || (props.openOnHover && !hovered.value)) &&
        active.value &&
        finish.value
      );
    }

    function shouldClose(e?: Event) {
      if (props.closeCondition === false) {
        return false;
      }
      if (
        typeof props.closeCondition === 'function' &&
        props.closeCondition(e) === false
      ) {
        return false;
      }

      return true;
    }

    const complementClickOption = reactive<ComplementClickBindingOptions>({
      handler: onClickOutsideLayer,
      determine: closeConditional,
      include: () => [baseEl.value],
    });

    function onAfterEnter() {
      finish.value = true;
      emit('afterEnter');
    }

    function onAfterLeave() {
      onAfterUpdate();
      finish.value = false;
      emit('afterLeave');
    }

    function onClickScrim() {
      if (props.closeClickScrim) {
        active.value = false;
      }
    }

    function onMouseenterLayer(event: Event) {
      hovered.value = true;
    }

    function onMouseleaveLayer(event: Event) {
      hovered.value = false;
    }

    const computedStyle = computed(() => {
      return {
        zIndex: (props.zIndex ?? '2000').toString(),
      };
    });

    const computedClass = computed<Record<string, boolean>>(() => {
      const { classes } = props;
      const boundClasses = bindClasses(classes);
      return {
        ...boundClasses,
        'y-layer--pinned': !!pinned.value,
        'y-layer--active': !!active.value,
      };
    });

    const computedContentClasses = computed<Record<string, boolean>>(() => {
      const boundClasses = bindClasses(props.contentClasses);
      const { side, align } = coordination.value;
      return {
        ...boundClasses,
        [`y-layer--side-${side}`]: !!side,
        [`y-layer--align-${align}`]: !!align,
      };
    });

    function close() {
      active.value = false;
    }

    expose({
      scrim$,
      base$,
      content$: computed(() => content$.value),
      baseEl,
      active,
      pinned,
      onAfterUpdate,
      updateCoordinate,
      hovered,
      focused,
      finish,
      maximized,
      modal: computed(() => props.modal),
      preventCloseBubble: props.preventCloseBubble,
      getActiveLayers,
      isMe: (vnode: ComponentInternalInstance) => {
        return vnode === vm;
      },
      coordination,
      children,
      parent,
      relayId,
    });

    useRender(() => {
      const slotBase = slots.base?.({
        active: active.value,
        props: mergeProps(
          {
            ref: base$,
            class: {
              'y-layer-base': true,
              'y-layer-base--active': active.value,
            },
          },
          baseEvents.value,
          props.baseProps ?? {},
        ),
      });
      const baseNode = slotBase?.[0];
      const applied = isEventsApplied(baseNode, baseEvents.value);

      baseSlot.value =
        baseNode && !applied
          ? [
              cloneVNode(
                baseNode,
                mergeProps(baseNode.props ?? {}, baseEvents.value),
              ),
            ]
          : slotBase;

      return (
        <>
          {baseSlot.value}
          <Teleport disabled={!layerGroup.value} to={layerGroup.value as any}>
            {isRendering.value && (
              <div
                ref={root$}
                class={[
                  {
                    'y-layer': true,
                    'y-layer--finish': finish.value,
                    'y-layer--contained': props.contained,
                    ...computedClass.value,
                  },
                  themeClasses.value,
                ]}
                onMouseenter={onMouseenterLayer}
                onMouseleave={onMouseleaveLayer}
                style={computedStyle.value}
                {...attrs}
              >
                <Transition name="fade" appear>
                  {active.value && props.scrim && (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                    <div
                      ref="scrim$"
                      class="y-layer__scrim"
                      style={{ '--y-layer-scrim-opacity': props.scrimOpacity }}
                      onClick={onClickScrim}
                      onKeydown={noop()}
                      onKeyup={noop()}
                    ></div>
                  )}
                </Transition>
                <PolyTransition
                  onAfterEnter={onAfterEnter}
                  onAfterLeave={onAfterLeave}
                  appear
                  {...polyTransitionBindProps.value}
                >
                  <div
                    ref={content$}
                    v-show={active.value}
                    v-complement-click={{ ...complementClickOption }}
                    class={{
                      'y-layer__content': true,
                      ...computedContentClasses.value,
                    }}
                    style={[
                      {
                        ...dimensionStyles.value,
                        ...coordinateStyles.value,
                        ...props.contentStyles,
                      },
                    ]}
                    {...contentEvents.value}
                  >
                    {slots.default?.({ active: active.value, close })}
                  </div>
                </PolyTransition>
              </div>
            )}
          </Teleport>
        </>
      );
    });

    return {
      complementClickOption,
      layerGroup,
      active,
      finish,
      rendered: isRendering,
      lazyValue,
      onAfterUpdate: onAfterUpdate as () => void,
      scrim$,
      content$,
      base,
      base$,
      baseEl,
      baseFromSlotEl,
      polyTransitionBindProps,
      coordinateStyles,
      layerGroupState,
      getActiveLayers,
      coordination,
      baseEvents,
    };
  },
});

export type YLayer = InstanceType<typeof YLayer>;
