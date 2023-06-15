import {
  CSSProperties,
  Prop,
  PropType,
  Teleport,
  Transition,
  computed,
  defineComponent,
  reactive,
  ref,
  toRef,
} from 'vue';

import { useRender } from '../../composables/component';
import { useLayerGroup } from '../../composables/layer-group';
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
import { bindClasses } from '../../util/vue-component';

import './YLayer.scss';

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
    modelValue: {
      type: Boolean as PropType<boolean>,
    },
    scrim: {
      type: Boolean as PropType<boolean>,
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
    persistent: Boolean as PropType<boolean>,
    contentStyles: {
      type: Object as PropType<CSSProperties>,
      default: () => {},
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    ...polyTransitionPropOptions,
  },
  emits: {
    'update:modelValue': (value: boolean) => true,
    'click:complement': (mouseEvent: MouseEvent) => true,
  },
  setup(props, { emit, expose, attrs, slots }) {
    const { layerGroup } = useLayerGroup();
    const { polyTransitionBindProps } = usePolyTransition(props);
    const active = computed<boolean>({
      get: (): boolean => {
        return !!props.modelValue;
      },
      set: (v: boolean) => {
        emit('update:modelValue', v);
      },
    });
    const disabled = toRef(props, 'disabled');
    const { lazyValue, onAfterUpdate } = useLazy(!!props.eager, active);
    const rendered = computed<boolean>(
      () => !disabled.value && (lazyValue.value || active.value),
    );
    const scrim$ = ref<HTMLElement>();
    const content$ = ref<HTMLElement>();

    function onClickComplementLayer(mouseEvent: MouseEvent) {
      emit('click:complement', mouseEvent);
      if (!props.persistent) {
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
      return active.value; // TODO: && groupTopLevel.value;
    }

    const complementClickOption = reactive<ComplementClickBindingOptions>({
      handler: onClickComplementLayer,
      determine: closeConditional,
      include: () => [
        // activatorEl.value
      ],
    });

    expose({
      scrim$,
      content$,
      active,
      onAfterUpdate,
    });

    function onAfterEnter() {
      // console.log('after')
    }

    function onAfterLeave() {
      onAfterUpdate();
    }

    function onClickScrim() {
      if (props.closeClickScrim) {
        active.value = false;
      }
    }

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

    useRender(() => {
      return (
        <Teleport disabled={!layerGroup.value} to={layerGroup.value as any}>
          {rendered.value && (
            <div
              class={{ 'y-layer': true, ...computedClass.value }}
              style={computedStyle.value}
              {...attrs}
            >
              <Transition name="fade" appear>
                {active.value && props.scrim && (
                  <div
                    class="y-layer__scrim"
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
                  style={props.contentStyles}
                  ref="content$"
                >
                  {slots.default?.({ active: active.value })}
                </div>
              </PolyTransition>
            </div>
          )}
        </Teleport>
      );
    });

    return {
      complementClickOption,
      layerGroup,
      active,
      rendered,
      onAfterUpdate: onAfterUpdate as () => void,
      scrim$,
      content$,
      polyTransitionBindProps,
    };
  },
});

export type YLayer = InstanceType<typeof YLayer>;
