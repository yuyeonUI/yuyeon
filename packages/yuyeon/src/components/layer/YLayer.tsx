import type {
  CSSProperties,
  ComponentInternalInstance,
  PropType,
  SlotsType,
} from 'vue';
import {
  Teleport,
  Transition,
  computed,
  getCurrentInstance,
  mergeProps,
  reactive,
  ref,
  shallowRef,
  toRef,
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
  ComplementClickBindingOptions,
} from '@/directives/complement-click';
import { bindClasses, defineComponent, propsFactory } from '@/util/component';

import { pressBasePropsOptions, useBase } from './base';
import { pressContentPropsOptions, useContent } from './content';
import {
  pressScrollStrategyProps,
  useScrollStrategies,
} from './scroll-strategies';

import './YLayer.scss';

export const pressYLayerProps = propsFactory(
  {
    modelValue: {
      type: Boolean as PropType<boolean>,
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
      type: Object as PropType<CSSProperties>,
      default: () => {},
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    maximized: {
      type: Boolean as PropType<boolean>,
    },
    openOnHover: {
      type: Boolean as PropType<boolean>,
      default: false,
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
    ...pressThemePropsOptions(),
    ...pressPolyTransitionPropsOptions(),
    ...pressBasePropsOptions(),
    ...pressContentPropsOptions(),
    ...pressCoordinateProps(),
    ...pressScrollStrategyProps(),
    ...pressDimensionPropsOptions(),
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
    ...pressYLayerProps(),
  },
  emits: {
    'update:modelValue': (value: boolean) => true,
    'click:complement': (mouseEvent: MouseEvent) => true,
    afterLeave: () => true,
  },
  slots: Object as SlotsType<{
    base: any;
    default: any;
  }>,
  setup(props, { emit, expose, attrs, slots }) {
    const vm = getCurrentInstance();
    const scrim$ = ref<HTMLElement>();
    const content$ = ref<HTMLElement>();
    const root$ = ref<HTMLElement>();
    const model = useModelDuplex(props);
    const active = computed({
      get: (): boolean => {
        return !!model.value;
      },
      set: (v: boolean) => {
        if (!(v && props.disabled)) model.value = v;
      },
    });
    // Frags
    const { base, base$, baseEl, baseSlot, baseFromSlotEl } = useBase(props);
    const { contentEvents } = useContent(props, active);
    const { themeClasses } = useLocalTheme(props);
    const { layerGroup, layerGroupState, getActiveLayers } = useLayerGroup(props);
    const { polyTransitionBindProps } = usePolyTransition(props);
    const { dimensionStyles } = useDimension(props);

    const { lazyValue, onAfterUpdate } = useLazy(toRef(props, 'eager'), active);
    // States
    const finish = shallowRef(false);
    const hovered = ref(false);
    const focused = ref(false);
    const disabled = toRef(props, 'disabled');
    const maximized = toRef(props, 'maximized');

    const rendered = computed<boolean>(
      () => !disabled.value && (lazyValue.value || active.value),
    );

    const { coordinateStyles, updateCoordinate } = useCoordinate(props, {
      contentEl: content$,
      base,
      active,
    });
    useScrollStrategies(props, {
      root: root$,
      contentEl: content$,
      active,
      baseEl: base,
      updateCoordinate,
    });

    function onClickComplementLayer(mouseEvent: MouseEvent) {
      emit('click:complement', mouseEvent);
      if (!props.modal) {
        if (
          scrim$.value !== null &&
          scrim$.value === mouseEvent.target &&
          props.closeClickScrim
        ) {
          active.value = false;
        }
      } else {
        // TODO: shrug ani
      }
    }

    function closeConditional(): boolean {
      return (
        (!props.openOnHover || (props.openOnHover && !hovered.value)) &&
        active.value &&
        finish.value
      ); // TODO: && groupTopLevel.value;
    }

    const complementClickOption = reactive<ComplementClickBindingOptions>({
      handler: onClickComplementLayer,
      determine: closeConditional,
      include: () => [baseEl.value],
    });

    function onAfterEnter() {
      finish.value = true;
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

    function onMouseenter(event: Event) {
      hovered.value = true;
    }

    function onMouseleave(event: Event) {
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
        'y-layer--active': !!active.value,
      };
    });

    const computedContentClasses = computed<Record<string, boolean>>(() => {
      const boundClasses = bindClasses(props.contentClasses);
      return {
        ...boundClasses,
      };
    });

    expose({
      scrim$,
      base$,
      content$: computed(() => content$.value),
      baseEl,
      active,
      onAfterUpdate,
      updateCoordinate,
      hovered,
      finish,
      modal: computed(() => props.modal),
      getActiveLayers,
      isMe: (vnode: ComponentInternalInstance) => {
        return vnode === vm;
      },
    });

    useRender(() => {
      const slotBase = slots.base?.({
        active: active.value,
        props: mergeProps({
          ref: base$,
          class: {
            'y-layer-base': true,
            'y-layer-base--active': active.value,
          },
          ...(props.baseProps ?? {}),
        }),
      });
      baseSlot.value = slotBase;
      return (
        <>
          {slotBase}
          <Teleport disabled={!layerGroup.value} to={layerGroup.value as any}>
            {rendered.value && (
              <div
                class={[
                  {
                    'y-layer': true,
                    'y-layer--finish': finish.value,
                    'y-layer--contained': props.contained,
                    ...computedClass.value,
                  },
                  themeClasses.value,
                ]}
                onMouseenter={onMouseenter}
                onMouseleave={onMouseleave}
                style={computedStyle.value}
                ref={root$}
                {...attrs}
              >
                <Transition name="fade" appear>
                  {active.value && props.scrim && (
                    <div
                      class="y-layer__scrim"
                      style={{ '--y-layer-scrim-opacity': props.scrimOpacity }}
                      onClick={onClickScrim}
                      ref="scrim$"
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
                    ref={content$}
                  >
                    {slots.default?.({ active: active.value })}
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
      rendered,
      lazyValue,
      onAfterUpdate: onAfterUpdate as () => void,
      scrim$,
      content$,
      base$,
      baseEl,
      baseFromSlotEl,
      polyTransitionBindProps,
      coordinateStyles,
      layerGroupState,
      getActiveLayers,
    };
  },
});

export type YLayer = InstanceType<typeof YLayer>;
