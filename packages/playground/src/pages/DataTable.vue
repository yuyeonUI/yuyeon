<script setup lang="ts">
import IconPrev from "@/assets/prev.svg?component";
import { computed, ref, shallowRef } from "vue";
import { dataTableHeaders } from "@/settings/headers.ts";

const page = ref(1);
const loading = shallowRef(false);
const headers = computed(() => {
  return dataTableHeaders;
});
const items = computed(() => {
  //
})
</script>

<template>
  <div style="height: 80vh">
    <y-data-table-server
      :total="124"
      :headers="headers"
      :height="150"
      flex-height
      fixed-head
      enable-select
    >
      <template #bottom>
        <div class="ph-6 pv-4">
          <y-pagination
            v-model="page"
            :length="10"
            show-end-button
            gap="4"
            :disabled="loading"
            button-variations="outlined"
          >
            <template #prev-icon>
              <IconPrev></IconPrev>
            </template>
          </y-pagination>
        </div>
      </template>
    </y-data-table-server>
  </div>
</template>

<style lang="scss">
.y-table {
  height: 100%;
}
</style>
