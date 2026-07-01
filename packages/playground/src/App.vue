<script setup lang="ts">
import { computed, ref } from 'vue';

const mainSnackbar = ref(false);

const items = computed(() => {
  return [
    {
      text: 'Home',
      to: '/',
    },
    {
      text: 'DataTable',
      to: '/data-table',
    },
    {
      text: 'DataTableServer',
      to: '/data-table-server',
    },
    {
      text: 'TreeView',
      to: '/tree-view',
    },
    {
      text: 'DatePicker',
      to: '/date-picker',
    },
    {
      text: 'MaxDialog',
      to: '/max-dialog',
    },
    {
      text: 'Menu',
      to: '/menu',
    },
  ];
});
</script>

<template>
  <y-app>
    <nav id="app-bar">
      <y-tabs :items="items"></y-tabs>
    </nav>
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

#app-bar {
  height: 56px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(79, 151, 220, 0.5);
  backdrop-filter: blur(12px);

  display: flex;
  padding: 0 24px;

  .y-tabs {
    align-self: flex-end;
  }
}

#app-main {
  padding-top: 56px;
}
</style>
