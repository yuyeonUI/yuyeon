<script setup lang="ts">
import { ref } from "vue";

const mainSnackbar = ref(false);
</script>

<template>
  <y-app>
    <main>
      <router-view>
        <template #default="{ Component }">
          <Transition mode="out-in" name="fade">
            <component :is="Component"></component>
          </Transition>
        </template>
      </router-view>
    </main>
    <y-snackbar v-model="mainSnackbar" :duration="-1">
      <div>스낵바 입니다.</div>
    </y-snackbar>
  </y-app>
</template>

<style lang="scss">
@use './styles/app.scss';
</style>
