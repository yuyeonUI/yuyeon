<template>
  <Teleport :to="layerGroup" :disabled="!layerGroup">
    <template v-if="rendered">
      <div class="y-layer" :class="computedClass" :style="computedStyle">
        <Transition name="fade" appear>
          <div
            v-if="active && scrim"
            class="y-layer__scrim"
            @click="onClickScrim"
            ref="scrimElement"
          ></div>
        </Transition>
        <Transition name="slide-fade" @after-leave="onAfterLeave" appear>
          <div
            v-show="active"
            v-complement-click="complementClickOption"
            class="y-layer__content"
          >
            <slot :active="active"></slot>
          </div>
        </Transition>
      </div>
    </template>
  </Teleport>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  inject,
  reactive,
  ref
} from "vue";
import { useLayerGroup } from '../../composables/layer-group';

import './y-layer.scss';
import { useLazy } from '../../composables/lazy';
import {
  ComplementClick,
  ComplementClickBindingOptions,
} from '../../directives/complement-click';

export default defineComponent({
  name: 'YLayer',
  inheritAttrs: false,
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
    contentTagDialog: {
      type: Boolean as PropType<boolean>,
    },
    eager: {
      type: Boolean as PropType<boolean>,
    },
    class: {
      type: [Array, String, Object] as PropType<
        string[] | string | Record<string, boolean>
      >,
    },
    closeClickScrim: {
      type: Boolean as PropType<boolean>,
    },
    persistent: Boolean as PropType<boolean>,
  },
  emits: {
    'update:modelValue': (value: boolean) => true,
    'click:complement': (mouseEvent: MouseEvent) => true,
  },
  setup(props: any, { emit }) {
    const { layerGroup } = useLayerGroup();
    const active = computed({
      get: () => {
        return props.modelValue;
      },
      set: (v: boolean) => {
        emit('update:modelValue', v);
      },
    });
    const { lazyValue, onAfterUpdate } = useLazy(props.eager, active);
    const rendered = computed(() => lazyValue.value || active.value);
    const poly = inject('poly');
    const scrimElement = ref<HTMLElement | null>(null);
    function onClickComplementLayer(mouseEvent: MouseEvent) {
      emit('click:complement', mouseEvent);
      if (!props.persistent) {
        if (scrimElement.value !== null && scrimElement.value === mouseEvent.target && props.closeClickScrim) {
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
    return {
      complementClickOption,
      layerGroup,
      active,
      rendered,
      onAfterUpdate,
      poly,
      scrimElement,
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
    computedClass(): any {
      return {
        'y-layer--active': this.active,
        'y-dialog': this.poly === 'y-dialog',
      };
    },
  },
});
</script>
