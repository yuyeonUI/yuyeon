<template>
  <div class="y-plate" :class="classes"></div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

export default defineComponent({
  name: 'YPlate',
  functional: true,
  props: {
    variation: Object as PropType<Record<string, any>>,
  },
  computed: {
    classes(): Record<string, boolean> {
      return {};
    },
  },
});
</script>

<style lang="scss">
.y-plate {
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-top: 1px solid transparent;
  contain: paint;
  border-radius: 8px;
  outline: 0 solid rgba(0, 0, 0, 0);
}
</style>
