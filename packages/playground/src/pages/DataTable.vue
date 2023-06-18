<script setup lang="ts">
import { ref, shallowRef } from "vue";

const page = ref(1);
const loading = shallowRef(false);
</script>

<template>
  <div>
    <y-data-table-server :total="124">
      <template #bottom>
        <div class="ph-6 pv-4">
          <y-pagination
            v-model="page"
            :length="10"
            show-end-button
            gap="4"
            :disabled="loading"
          ></y-pagination>
        </div>
      </template>
    </y-data-table-server>
  </div>
</template>

<style scoped></style>
