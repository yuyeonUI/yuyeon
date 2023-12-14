<script setup lang="ts">
import { computed, PropType, resolveDynamicComponent } from "vue";

const props = defineProps({
  icon: [String, Object] as PropType<unknown>,
});

const isComponentIcon = computed(() => {
  return (
    props.icon &&
    Reflect.has(props.icon as any, "render") &&
    resolveDynamicComponent(props.icon)
  );
});
</script>

<template>
  <div>
    <component v-if="isComponentIcon" :is="icon"></component>
  </div>
</template>

<style scoped></style>
