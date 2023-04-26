<template>
  <Teleport :disabled="!layerGroup" :to="layerGroup">
    <template v-if="rendered">
      <div class="y-layer" :class="computedClass" :style="computedStyle">
        <Transition name="fade" appear>
          <div
            v-if="active && scrim"
            class="y-layer__scrim"
            @click="onClickScrim"
            ref="scrim$"
          ></div>
        </Transition>
        <PolyTransition
          v-bind="{ ...polyTransitionBindProps }"
          @after-leave="onAfterLeave"
          appear
        >
          <div
            v-show="active"
            v-complement-click="complementClickOption"
            class="y-layer__content"
            :class="computedContentClasses"
            :style="{ ...contentStyles }"
            ref="content$"
          >
            <slot :active="active"></slot>
          </div>
        </PolyTransition>
      </div>
    </template>
  </Teleport>
</template>

<script lang="ts">
import {
  PropType,
  computed,
  defineComponent,
  reactive,
  ref, Prop, CSSProperties
} from "vue";

import { useLayerGroup } from '../../composables/layer-group';
import { useLazy } from '../../composables/timing';
import {
  ComplementClick,
  ComplementClickBindingOptions,
} from '../../directives/complement-click';
import { bindClasses } from '../../util/vue-component';
import { PolyTransition, polyTransitionPropOptions, usePolyTransition } from "../../composables/transition";
import './y-layer.scss';

export default defineComponent({
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
    ...polyTransitionPropOptions,
  },
  emits: {
    'update:modelValue': (value: boolean) => true,
    'click:complement': (mouseEvent: MouseEvent) => true,
  },
  setup(props, { emit, expose }) {
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
    const { lazyValue, onAfterUpdate } = useLazy(!!props.eager, active);
    const rendered = computed<boolean>(() => lazyValue.value || active.value);
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
  methods: {
    onAfterLeave() {
      this.onAfterUpdate();
    },
    onClickScrim() {
      if (this.closeClickScrim) {
        this.active = false;
      }
    },
  },
  computed: {
    computedStyle(): any {
      return {
        zIndex: '2000',
      };
    },
    computedClass(): Record<string, boolean> {
      const { classes } = this;
      const boundClasses = bindClasses(classes);
      return {
        ...boundClasses,
        'y-layer--active': !!this.active,
      };
    },
    computedContentClasses(): Record<string, boolean> {
      const { contentClasses } = this;
      const boundClasses = bindClasses(contentClasses);
      return {
        ...boundClasses,
      };
    },
  },
});
</script>
