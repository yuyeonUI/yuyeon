<template>
  <y-layer v-model="active" content-tag-dialog scrim>
    <slot name="activator"></slot>
    <slot></slot>
  </y-layer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, provide } from 'vue';
import { YLayer } from '../layer';
import { YCard } from '../card';

import './y-dialog.scss';

export default defineComponent({
  name: 'YDialog',
  components: {
    YLayer,
    YCard,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
    },
  },
  emits: {
    'update:modelValue': (value: boolean) => true,
  },
  setup(props: any, { emit }) {
    const active = computed({
      get: () => {
        return props.modelValue;
      },
      set: (v: boolean) => {
        emit('update:modelValue', v);
      },
    });

    provide('poly', 'y-dialog');

    return {
      active,
    };
  },
});
</script>
