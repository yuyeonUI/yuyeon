<script setup lang="ts">
import { computed, ref } from "vue";

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
const activeGroups = ref([]);
const selected = ref([]);
const opened = ref([]);
</script>

<template>
  <section>
    <y-card class="pa-4 ma-1" style="width: 320px">
      <y-tree-view
        v-model:selected="selected"
        v-model:expanded="opened"
        v-model:active="activeGroups"
        :items="groups"
        enable-active
        multiple-active
        active-strategy="cascade"
        enable-select
        select-strategy="cascade"
        default-expand="0"
      ></y-tree-view>
    </y-card>
  </section>
</template>

<style scoped></style>
