<script setup lang="ts">
import { PropType, ref, defineProps } from "vue";
import IconPrev from "@/assets/prev.svg?component";

const props = defineProps({
  total: {
    type: Number as PropType<number>,
    default: 0,
  },
  bottomProps: {
    type: Object,
  },
  loading: {
    type: Boolean,
  }
});

const page = ref(props.bottomProps?.page ?? 0);
const pageSize = ref(props.bottomProps?.pageSize ?? 30);
</script>

<template>
  <div class="ph-6 pv-4" style="display: flex; justify-content: space-between">
    <div class="d-flex">
      <y-field-input
        outlined
        type="number"
        width="90"
      ></y-field-input>
    </div>
    <div style="text-align: end; min-width: 360px;">
      <y-pagination
        v-model="page"
        :length="15"
        show-end-button
        gap="4"
        :disabled="loading"
        button-variations="outlined"
        align="end"
      >
        <template #prev-icon>
          <IconPrev></IconPrev>
        </template>
      </y-pagination>
    </div>
  </div>
</template>

<style scoped>

</style>
