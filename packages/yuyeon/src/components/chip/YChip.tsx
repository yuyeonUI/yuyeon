import { defineComponent } from 'vue';

import { hasOwnProperty } from '../../util/common';

import './YChip.scss';
import { rgbFromHex } from "../../util/color";

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
        'y-chip': true,
        'y-chip--small': this.small,
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
        return rgbFromHex(color)?.join(',') || '';
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
  render() {
    const { classes, styles } = this;
    return (
      <span class={classes} style={styles}>
        <span class="y-chip__content">
          {this.$slots.default?.()}
        </span>
      </span>
    );
  },
});
