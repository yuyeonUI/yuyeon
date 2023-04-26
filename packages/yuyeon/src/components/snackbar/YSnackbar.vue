<template>
  <y-layer
    v-model="active"
    :classes="classes"
    :content-classes="computedContentClasses"
    :scrim="false"
    :content-styles="{ ...computedInset }"
    :transition="transition as string"
    ref="layer"
  >
    <y-plate></y-plate>
    <div
      class="y-snackbar__content"
      @click.capture="onClickContent"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <slot></slot>
    </div>
  </y-layer>
</template>

<script lang="ts">
import { animate } from 'motion';
import { PropType, computed, defineComponent, ref, watch } from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useTimer } from '../../composables/timing';
import { bindClasses } from '../../util/vue-component';
import YPlate from '../plate/y-plate.vue';
import './y-snackbar.scss';

const defaultSnackbarTransition = {
  name: 'y-snackbar',
  onBeforeEnter(el: HTMLElement) {
    if (!el.getAttribute('data-transform')) {
      const cache = el.style.getPropertyValue('transform');
      el.setAttribute('data-transform', cache);
      el.style.setProperty('transform', `${cache} translateY(-40px)`);
    }
  },
  onEnter(el: HTMLElement, done: () => void) {
    const cache = el.getAttribute('data-transform');
    animate(el, {
      transform: `${cache} translateY(0)`,
    }, { duration: 300 }).finished.then(() => {
      el.removeAttribute('data-transform');
      done();
    });
  },
};

export default defineComponent({
  name: 'YSnackbar',
  components: { YPlate },
  emits: ['update:modelValue', 'click'],
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
    },
    contentClasses: {
      type: [Array, String, Object] as PropType<
        string[] | string | Record<string, any>
      >,
    },
    position: {
      type: String as PropType<string>,
      default: 'top center',
    },
    transition: {
      type: [String, Object] as PropType<string | any>,
      default: () => ({ ...defaultSnackbarTransition }),
    },
    /**
     * @property Number
     *
     * The amount of time the snackbar should be displayed.
     * @default 4000
     */
    duration: {
      type: Number as PropType<number>,
      default: 4000,
    },
  },
  setup(props, { emit }) {
    const active = useModelDuplex(props);
    const hover = ref(false);

    const classes = computed(() => {
      return {
        'y-snackbar': true,
      };
    });

    const computedContentClasses = computed<Record<string, boolean>>(() => {
      const boundClasses = bindClasses(props.contentClasses);
      return {
        ...boundClasses,
        'y-snackbar__display': true,
      };
    });

    const computedInset = computed(() => {
      const [first, second] = props.position?.split(' ');
      let y = 'top';
      let x = 'left';
      if (second) {
        x = second;
        y = first;
      } else {
        x = first;
      }
      const ret = {
        [x === 'center' ? 'left' : x]: x === 'center' ? `50%` : 0,
        [y]: 0,
      } as any;
      if (x === 'center') {
        ret.transform = 'translateX(-50%)';
      }
      return ret;
    });

    function dismiss() {
      active.value = false;
    }

    const { start, stop, reset } = useTimer(dismiss, props.duration);

    watch(hover, (neo: boolean) => {
      if (neo) {
        stop();
      } else {
        start();
      }
    });

    watch(
      active,
      (neo: boolean) => {
        if (neo) {
          start();
        } else {
          reset();
        }
      },
      { immediate: true },
    );

    function onClickContent(event: MouseEvent) {
      emit('click', event);
      active.value = false;
    }

    return {
      active,
      hover,
      classes,
      computedContentClasses,
      computedInset,
      onClickContent,
    };
  },
});
</script>

<style lang="scss">
.y-snackbar {
  font-size: 1rem;
  margin: 8px;

  &__display {
    display: flex;
    align-items: center;
    min-height: 48px;
    min-width: 240px;
  }

  &__content {
    position: relative;
    flex-grow: 1;
    font-size: 0.875em;
    font-weight: 400;
    line-height: 0.625em;
    padding: 0.875em;

    color: #fff;
  }

  .y-plate {
    background-color: rgba(0, 0, 0, 0.74);
    backdrop-filter: blur(4px);
    box-shadow: 0 0 4px -1px rgba(0, 0, 0, 0.4);
  }

  &-enter-active,
  &-leave-active {
    transition: all 300ms ease-in-out;
  }

  &-enter-from {
    transform: translateY(-40px);
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
