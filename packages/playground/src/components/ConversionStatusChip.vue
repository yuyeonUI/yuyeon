<script setup lang="ts">
import { MAIN_PALETTE } from "@/settings/palette.ts";
import {computed} from "vue";

const props = defineProps({
  status: {
    type: String,
    default: "UNKNOWN",
  },
});

const text = computed(() => {
  return props.status;
});

const color = computed(() => {
  return MAIN_PALETTE["chip-gray"];
});
</script>

<template>
  <y-chip class="conversion-status-chip" :color="color" :bg-opacity="0.1">
    {{ text }}
  </y-chip>
</template>

<style scoped lang="scss">
.conversion-status-chip {
  font-weight: 500;
}
</style>
