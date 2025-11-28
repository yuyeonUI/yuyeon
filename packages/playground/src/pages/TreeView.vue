<script setup lang="ts">
import { ref } from "vue";

const groups = ref([
  {
    id: "1",
    text: "1",
    children: [
      {
        id: "1-1",
        text: "1-1",
        children: [
          {
            id: "1-1-1",
            text: "1-1-1",
            children: [
              {
                id: "1-1-1-a",
                text: "1-1-1-a",
              },
              {
                id: "1-1-1-b",
                text: "1-1-1-b",
              }
            ]
          },
          {
            id: "1-1-2",
            text: "1-1-2",
          },
        ],
      },
      {
        id: "1-2",
        text: "1-2",
        children: [
          {
            id: "1-2-1",
            text: "1-2-1",
          },
          {
            id: "1-2-2",
            text: "1-2-2",
          },
        ],
      },
      {
        id: "1-3",
        text: "1-3",
      },
    ],
  },
  {
    id: "2",
    text: "2",
    children: [
      {
        id: "2-1",
        text: "2-1",
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
const selected2 = ref(["2", "1-1"])
const selected3 = ref(["2", "1-1"])
const selected4 = ref(["1-1-1"])

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
        active cascade
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
      <y-card-header class="ph-2 pt-0 pb-2">
        active: relative / select: cascade
      </y-card-header>
      <y-field-input
          v-model="search"
          clearable
          ceramic
          class="mb-2"
      ></y-field-input>
      <y-tree-view
          v-model:expanded="opened2"
          v-model:selected="selected2"
          v-model:active="active2"
          :items="groups"
          :search="search2"
          enable-active
          multiple-active
          required-active
          active-strategy="relative"
          active-single-modifier="Control"
          enable-select
          select-strategy="cascade"
          default-expand="0"
      ></y-tree-view>
    </y-card>
    <y-card class="pa-4 ma-1" style="width: 320px">
      <y-card-header class="ph-2 pt-0 pb-2">
        active: relative / select: relative
      </y-card-header>
      <y-field-input
          v-model="search"
          clearable
          ceramic
          class="mb-2"
      ></y-field-input>
      <y-tree-view
          v-model:expanded="opened2"
          v-model:selected="selected3"
          v-model:active="active2"
          :items="groups"
          :search="search2"
          enable-active
          multiple-active
          required-active
          active-strategy="relative"
          active-single-modifier="Control"
          enable-select
          select-strategy="relative"
          default-expand="0"
      ></y-tree-view>
    </y-card>
    <y-card class="pa-4 ma-1" style="width: 320px">
      <y-card-header class="ph-2 pt-0 pb-2">
        active: relative / select: leaf
      </y-card-header>
      <y-field-input
        v-model="search"
        clearable
        ceramic
        class="mb-2"
      ></y-field-input>
      <y-tree-view
        v-model:expanded="opened2"
        v-model:selected="selected4"
        v-model:active="active2"
        :items="groups"
        :search="search2"
        enable-active
        multiple-active
        required-active
        active-strategy="relative"
        active-single-modifier="Control"
        enable-select
        select-strategy="leaf"
        default-expand="0"
      ></y-tree-view>
      <y-card-footer class="flex-column">
        <div v-for="s of selected4" :key="s">
          {{ s }}
        </div>
      </y-card-footer>
    </y-card>
  </section>
</template>

<style scoped>
.flex-column {
  flex-direction: column;
}
</style>
