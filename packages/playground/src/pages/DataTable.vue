<script setup lang="ts">
import { dataTableHeaders } from '@/settings/headers.ts';
import { computed, ref } from 'vue';
import { tableData } from '@/dummy/data-table.ts';

defineProps({
  bottomProps: Object,
});

const expanded = ref(true);
// const loading = shallowRef(false);
const headers = computed(() => {
  return dataTableHeaders;
});
const items = computed(() => {
  return tableData;
});

const loading = ref(true);

function onClickExpand() {
  expanded.value = !expanded.value;
}
</script>

<template>
  <div class="pa-4">
    <y-button @click="onClickExpand()">Expand/Fold</y-button>
    <y-expand-v-transition>
      <section v-if="expanded" class="pv-2" style="height: 80vh">
        <y-card class="h-100 contain-paint">
          <y-data-table
            :loading="loading"
            :headers="headers"
            :height="150"
            :items="items"
            flex-height
            fixed-head
            enable-select
          >
            <template #item.sequence="{ index }">
              {{ index + 1 }}
            </template>
          </y-data-table>
        </y-card>
      </section>
    </y-expand-v-transition>
  </div>
</template>

<style lang="scss">
.y-table {
  height: 100%;
}

.playground-dialog--showcase {
  filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.4));
}
</style>
