<!--
  - Created by yeonyu 2022.
  -->

<template>
  <span class="y-chip" :class="classes" :style="styles">
    <span class="y-chip__content">
      <slot></slot>
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { hasOwnProperty } from '../../util/common';
import { colorHexToRgb } from '../../util/ui';

import './y-chip.scss';

export default defineComponent({
  name: 'y-chip',
  props: {
    color: String,
    background: String,
    small: Boolean,
    bgOpacity: {
      type: Number,
      default: 0.14,
    },
  },
  computed: {
    clickable() {
      return hasOwnProperty(this.$attrs, 'onClick');
    },
    classes() {
      return {
        'y-chip--clickable': this.clickable,
      };
    },
    backgroundColor() {
      const color = (this.background as string) ?? this.color;
      return this.colorRgb(color);
    },
    styles() {
      return {
        color: this.color,
        background: `rgba(${this.backgroundColor}, ${this.bgOpacity})`,
      };
    },
  },
  methods: {
    colorRgb(color: string): string {
      if (color?.startsWith('#')) {
        return colorHexToRgb(color)?.join(',') || '';
      }
      const RGBA_REGEX = /rgb(a?)\((?<v>.*)\)/;
      if (RGBA_REGEX.test(color)) {
        const value = RGBA_REGEX.exec(color)?.[2] || '';
        if (value) {
          const valueArray = value.trim().split(',');
          valueArray.splice(3, 1);
          return valueArray.join(',');
        }
      }
      return '';
    },
  },
});
</script>
