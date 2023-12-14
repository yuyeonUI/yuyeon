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
  defineComponent,
  getCurrentInstance,
  mergeProps,
  reactive,
  ref,
  shallowRef,
  toRef,
  watchEffect,
} from 'vue';

import { useRender } from '../../composables/component';
import {
  pressCoordinateProps,
  useCoordinate,
} from '../../composables/coordinate';
import {
  pressDimensionPropsOptions,
  useDimension,
} from '../../composables/dimension';
import { useLayerGroup } from '../../composables/layer-group';
import { pressThemePropsOptions, useLocalTheme } from '../../composables/theme';
import { useLazy } from '../../composables/timing';
import {
  PolyTransition,
  polyTransitionPropOptions,
  usePolyTransition,
} from '../../composables/transition';
import {
  ComplementClick,
  ComplementClickBindingOptions,
} from '../../directives/complement-click';
import { bindClasses, propsFactory } from '../../util/vue-component';

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
    ...pressThemePropsOptions(),
    ...polyTransitionPropOptions,
    ...pressCoordinateProps(),
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
    const base$ = ref();
    const scrim$ = ref<HTMLElement>();
    const content$ = ref<HTMLElement>();
    const baseSlot = ref();
    const baseEl = ref<HTMLElement>();

    const { themeClasses } = useLocalTheme(props);
    const { layerGroup, layerGroupState, getActiveLayers } = useLayerGroup();
    const { polyTransitionBindProps } = usePolyTransition(props);
    const { dimensionStyles } = useDimension(props);
    const active = computed<boolean>({
      get: (): boolean => {
        return !!props.modelValue;
      },
      set: (v: boolean) => {
        emit('update:modelValue', v);
      },
    });
    const finish = shallowRef(false);

    const disabled = toRef(props, 'disabled');
    const { lazyValue, onAfterUpdate } = useLazy(toRef(props, 'eager'), active);
    const rendered = computed<boolean>(
      () => !disabled.value && (lazyValue.value || active.value),
    );

    const { coordinateStyles, updateCoordinate } = useCoordinate(props, {
      contentEl: content$,
      baseEl,
      active,
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
        active.value && finish.value
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

    const baseFromSlotEl = computed(() => {
      return baseSlot.value?.[0]?.el;
    });

    watchEffect(() => {
      if (!base$.value) {
        baseEl.value = baseFromSlotEl.value;
        return;
      }
      let base = base$.value;
      if (base.baseEl) {
        base = base.baseEl;
      }
      if (base$.value?.$el) {
        if (base$.value.$el.nodeType === 1) {
          base = base$.value.$el;
        }
      }
      baseEl.value = base;
    });

    const computedStyle = computed(() => {
      return {
        zIndex: '2000',
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

    const hovered = ref(false);

    function onMouseenter(event: Event) {
      hovered.value = true;
    }

    function onMouseleave(event: Event) {
      hovered.value = false;
    }

    expose({
      scrim$,
      base$,
      content$,
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
        }),
      });
      baseSlot.value = slotBase;
      return (
        <>
          {slotBase}
          <Teleport disabled={!layerGroup.value} to={layerGroup.value as any}>
            {rendered.value && (
              <div
                class={{
                  'y-layer': true,
                  'y-layer--finish': finish.value,
                  ...computedClass.value,
                  [themeClasses.value ?? '']: true,
                }}
                onMouseenter={onMouseenter}
                onMouseleave={onMouseleave}
                style={computedStyle.value}
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
      polyTransitionBindProps,
      coordinateStyles,
      layerGroupState,
      getActiveLayers,
    };
  },
});

export type YLayer = InstanceType<typeof YLayer>;
