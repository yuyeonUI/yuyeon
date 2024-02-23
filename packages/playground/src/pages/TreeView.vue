<script setup lang="ts">
import { ref } from "vue";

const groups = ref([
  {
    id: "1",
    text: "안녕하세요.",
    children: [
      {
        id: "1-1",
        text: "OLLEHY",
        children: [
          {
            id: "1-1-1",
            text: "HEY AYAYA",
          },
        ],
      },
      {
        id: "1-2",
        text: "google",
      },
      {
        id: "1-3",
        text: "yyyyyyyyyy",
      },
    ],
  },
  {
    id: "2",
    text: "HIKIKI",
    children: [
      {
        id: "2-1",
        text: "ollehy",
      },
    ],
  },
]);

const active0 = ref(["1-1"]);
const opened0 = ref([]);
const search0 = ref('');

const opened = ref([]);
const search = ref("");
const activeGroups = ref(["1-1", "1-3"]);
const selected = ref(["2", "1-1"]);

const opened2 = ref([]);
const active2 = ref([]);
const search2 = ref('');

setTimeout(() => {
  active0.value = ["2"]
}, 3000)
</script>

<template>
  <section class="d-flex pa-2" style="gap: 8px">
    <y-card class="pa-4 ma-1" style="width: 320px">
      <y-field-input
        v-model="search0"
        clearable
        ceramic
        class="mb-2"
      ></y-field-input>
      <y-tree-view
        v-model:expanded="opened0"
        v-model:active="active0"
        :items="groups"
        :search="search0"
        enable-active
        required-active
      ></y-tree-view>
    </y-card>

    <y-card class="pa-4 ma-1" style="width: 320px">
      <y-field-input
        v-model="search"
        clearable
        ceramic
        class="mb-2"
      ></y-field-input>
      <y-tree-view
        v-model:selected="selected"
        v-model:expanded="opened"
        v-model:active="activeGroups"
        :items="groups"
        :search="search"
        enable-active
        multiple-active
        active-strategy="cascade"
        active-single-modifier="Control"
        enable-select
        select-strategy="cascade"
        default-expand="0"
      ></y-tree-view>
    </y-card>

    <y-card class="pa-4 ma-1" style="width: 320px">
      <y-field-input
          v-model="search"
          clearable
          ceramic
          class="mb-2"
      ></y-field-input>
      <y-tree-view
          v-model:expanded="opened2"
          v-model:active="active2"
          :items="groups"
          :search="search2"
          enable-active
          multiple-active
          required-active
          active-strategy="cascade"
          active-single-modifier="Control"
          default-expand="0"
      ></y-tree-view>
    </y-card>

  </section>
</template>

<style scoped></style>
