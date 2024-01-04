<script setup lang="ts">
import { ref } from 'vue';

const open = ref(true);
</script>

<template>
  <div>
    <y-dialog v-model="open" maximized :scrim="false" offset="56">
      <y-card>
        <y-card-header>
          <div class="y-card-header__title">Settings</div>
        </y-card-header>
      </y-card>
    </y-dialog>
  </div>
</template>

<style scoped>

</style>
