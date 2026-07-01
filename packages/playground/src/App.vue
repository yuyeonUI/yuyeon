<script setup lang="ts">
import { ref } from "vue";

const mainSnackbar = ref(false);
</script>

<template>
  <y-app>
    <nav id="app-header"></nav>
    <main id="app-main">
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

#app-header {
  height: 56px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(79, 151, 220, 0.5);
  backdrop-filter: blur(12px);
}

#app-main {
  padding-top: 56px;
}
</style>
