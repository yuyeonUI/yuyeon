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
  return [
    {
      id: '00001',
      registerDate: 1687708312497,
      os: 'Windows 10',
      user: {
        name: 'Joe'
      },
      computer: {
        name: 'HELLO-DESKTOP',
        username: 'jojo',
        cpu: 'mt-1000000',
        memSize: 25769803776,
      }
    },
    {
      id: '00002',
      registerDate: 1687708312497,
      os: 'Windows 11',
      user: {
        name: 'Henry'
      },
      computer: {
        name: 'OHLLE-DESKTOP',
        username: 'Hen',
        cpu: 'mt-2000001',
        memSize: 12884901888,
      }
    }
  ]
})
</script>

<template>
  <div class="pa-4" style="height: 80vh">
    <y-card class="h-100 contain-paint">
      <y-data-table-server
        :total="124"
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
        <template #bottom>
          <div class="ph-6 pv-4" style="display: flex; justify-content: center">
            <div>
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
          </div>
        </template>
      </y-data-table-server>
    </y-card>
  </div>
</template>

<style lang="scss">
.y-table {
  height: 100%;
}
</style>
