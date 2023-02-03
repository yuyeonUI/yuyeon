<template>
  <svg
    class="y-ring-spinner"
    width="48"
    height="48"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      class="y-ring-spinner__circle"
      cx="24"
      cy="24"
      r="18"
      stroke-width="4"
      stroke-dasharray="113.097"
      stroke-dashoffset="113.097"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import './y-ring-spinner.scss';

const NAME = 'y-ring-spinner';

export default defineComponent({
  name: NAME,
});
</script>
