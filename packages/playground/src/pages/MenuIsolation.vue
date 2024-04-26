<script setup lang="ts">
import { ref } from "vue";

const noBaseMenu = ref(false);

function onClickNoBaseMenu() {
  noBaseMenu.value = true;
}
</script>

<template>
  <div>
    <y-card class="pa-6">
      <!--     No Base       -->
      <y-button @click="onClickNoBaseMenu"> NoBase Menu </y-button>
      <y-menu v-model="noBaseMenu" :base="[300, 300]">
        <y-card>
          <y-card-header> No Base </y-card-header>
        </y-card>
      </y-menu>
    </y-card>
  </div>
</template>

<style scoped></style>
