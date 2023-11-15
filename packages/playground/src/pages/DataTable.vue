<script setup lang="ts">
import DataTableBottom from "@/pages/data-table/DataTableBottom.vue";
import { dataTableHeaders } from "@/settings/headers.ts";
import {computed, ref, shallowRef} from "vue";

defineProps({
  bottomProps: Object,
});

ref(1);
// const loading = shallowRef(false);
const headers = computed(() => {
  return dataTableHeaders;
});
const items = computed(() => {
  return [
    {
      id: "00001",
      registerDate: 1687708312497,
      os: "Windows 10",
      user: {
        name: "Joe",
      },
      computer: {
        name: "HELLO-DESKTOP",
        username: "jojo",
        cpu: "mt-1000000",
        memSize: 25769803776,
      },
    },
    {
      id: "00002",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
    {
      id: "00003",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
    {
      id: "00004",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
    {
      id: "00005",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
    {
      id: "00006",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
    {
      id: "00007",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
    {
      id: "00008",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
    {
      id: "00009",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
    {
      id: "00010",
      registerDate: 1687708312497,
      os: "Windows 11",
      user: {
        name: "Henry",
      },
      computer: {
        name: "OHLLE-DESKTOP",
        username: "Hen",
        cpu: "mt-2000001",
        memSize: 12884901888,
      },
    },
  ];
});

const loading = ref(true);
</script>

<template>
  <div class="pa-4">
    <section class="pv-2" style="height: 80vh">
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
