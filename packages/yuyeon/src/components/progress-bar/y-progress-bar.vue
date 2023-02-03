<template>
  <div
    class="y-progress y-progress-bar"
    :class="classes"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="numValue"
    :style="{
      '--y-progress-bar__height':
        height !== undefined ? `${height}px` : undefined,
      '--y-progress-bar__outline-color':
        outlineColor !== undefined ? outlineColor : undefined,
    }"
  >
    <div class="y-progress__track"></div>
    <div class="y-progress__tube">
      <div class="y-progress__lead" :style="styles">
        <slot name="lead-inner">
          <div
            v-if="innerText"
            class="y-progress__lead-inner"
            :class="{ 'y-progress__lead-inner--fixed': numValue < 3 }"
            :style="{ color: textColor }"
          >
            <span>{{ numValue }} %</span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, StyleValue } from 'vue';
import { useProgress } from '../../composables/progress';

export default defineComponent({
  name: 'y-progress-bar',
  props: {
    value: {
      type: Number as PropType<number>,
    },
    rounded: {
      type: Boolean as PropType<boolean>,
    },
    height: {
      type: Number as PropType<number>,
    },
    noRewindTransition: {
      type: Boolean as PropType<boolean>,
    },
    outlined: {
      type: Boolean as PropType<boolean>,
    },
    innerText: {
      type: Boolean as PropType<boolean>,
    },
    textColor: {
      type: String as PropType<string>,
    },
    outlineColor: {
      type: String as PropType<string>,
    },
  },
  setup(props) {
    const { numValue } = useProgress(props);

    return {
      numValue,
    };
  },
  data() {
    return {
      delta: 0,
    };
  },
  computed: {
    classes(): Record<string, boolean> {
      let noTransition = false;
      if (this.noRewindTransition && this.delta < 0) {
        noTransition = true;
      }
      return {
        'y-progress--no-trans': noTransition,
        'y-progress--outlined': this.outlined,
        'y-progress-bar--rounded': this.rounded,
      };
    },
    styles(): StyleValue {
      let minWidth;
      if (this.innerText && this.numValue < 5 && this.numValue > 0) {
        minWidth = '2rem';
      }
      return {
        transform: `scaleX(${this.numValue / 100})`,
        minWidth,
      };
    },
  },
});
</script>

<style lang="scss">
.y-progress {
  --y-progress-bar__height: 4px;
  display: flex;
  position: relative;
  height: var(--y-progress-bar__height, 4px);

  &-bar--rounded {
    border-radius: calc(var(--y-progress-bar__height) / 2);
  }

  &--outlined {
    --y-progress-bar__outline-color: var(--y-palette--primary);
    border: 1px solid var(--y-progress-bar__outline-color);
  }

  &__tube {
    border-radius: inherit;
    overflow: clip;
    min-width: 0;
    flex: 1 1;
  }

  &__track {
    background-color: #f0f0f0;
    position: absolute;
    inset: 0;
    border-radius: inherit;
    overflow: clip;
  }

  &__lead {
    width: 100%;
    height: 100%;
    background-color: var(--y-palette--primary);
    position: relative;
    transform-origin: left;
    transition: all 250ms cubic-bezier(0.42, 0.5, 0.51, 1.02);
  }
}
</style>
