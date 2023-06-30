<script setup lang="ts">
import DataTableBottom from "@/pages/data-table/DataTableBottom.vue";
import { dataTableHeaders } from "@/settings/headers.ts";
import { computed, ref, shallowRef } from "vue";

const props = defineProps({
  bottomProps: Object,
});

const showDialog = ref(false);

const page = ref(1);
const loading = shallowRef(false);
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
  ];
});
</script>

<template>
  <div class="pa-4">
    <section class="pv-2" style="height: 80vh">
      <y-card class="h-100 contain-paint">
        <y-card-header> SHOWCASE </y-card-header>
        <y-card-body class="pt-4">
          <div>
            <y-menu position="bottom" offset="8">
              <template #base>
                <y-button class="mr-2"> MENU </y-button>
              </template>
              <y-card>
                <y-card-body> YMenu! </y-card-body>
              </y-card>
            </y-menu>
            <!-- -->
            <y-dialog
              v-model="showDialog"
              :dialog-classes="['playground-dialog--showcase']"
            >
              <template #base>
                <y-button variation="outlined" class="mr-2"> DIALOG </y-button>
              </template>
              <y-card style="width: 400px">
                <div
                  style="
                    width: 40px;
                    height: 40px;
                    position: absolute;
                    top: -20px;
                    left: -20px;
                    background-color: #0c5db9;
                    color: white;
                  "
                >
                  TS
                </div>
                <y-card-header>
                  <div class="y-card-title">당신은 타입스크립트 장인</div>
                </y-card-header>
                <y-card-body class="pv-8">Sure?</y-card-body>
                <y-card-footer style="justify-content: flex-end">
                  <y-button @click="showDialog = false">close</y-button>
                </y-card-footer>
              </y-card>
            </y-dialog>
            <!--  -->
            <y-tooltip :position="'top'">
              <template #base>
                <y-chip>TOOLTIP</y-chip>
              </template>
              <span>어서와 처음이지?</span>
            </y-tooltip>
          </div>
          <div class="pv-4">
            <y-chip small class="mr-2 font-weight-700">LABEL</y-chip>
            <y-chip :color="'#1489ce'" class="mr-2">CHIP</y-chip>
          </div>
        </y-card-body>
      </y-card>
    </section>
    <section class="pv-2" style="height: 80vh">
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
          <template #bottom="bottomProps">
            <DataTableBottom :bottom-props="bottomProps"></DataTableBottom>
          </template>
        </y-data-table-server>
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
