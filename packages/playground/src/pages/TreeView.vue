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
</script>

<template>
  <section>
    <div class="pa-4" style="width: 320px">
      <y-tree-view :items="groups"></y-tree-view>
    </div>
  </section>
</template>

<style scoped></style>
