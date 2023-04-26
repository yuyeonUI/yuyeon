<!--
  - Created by yeonyu at 2021-09-23
  -->

<template>
  <div @click="onClick" class="y-input y-input--checkbox" :class="classes">
    <input
      :id="inputId"
      :aria-checked="checked"
      role="checkbox"
      type="checkbox"
      :checked="checked"
      @focus="onFocus"
      @blur="onBlur"
      :disabled="disabled"
      :readonly="readonly"
    />
    <slot name="icon" :checked="checked">
      <component :is="iconComponent" v-if="iconComponent"></component>
      <icon-checkbox v-else></icon-checkbox>
    </slot>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

import IconCheckbox from './IconCheckbox.vue';
import './y-input-checkbox.scss';

export default defineComponent({
  name: 'y-input-checkbox',
  components: { IconCheckbox },
  props: {
    id: String as PropType<string>,
    value: Boolean as PropType<boolean>,
    icon: String as PropType<string>,
    color: {
      type: String as PropType<string>,
      default: () => 'primary',
    },
    disabled: Boolean as PropType<boolean>,
    readonly: Boolean as PropType<boolean>,
  },
  data() {
    return {
      counterId: this.$.uid.toString(),
      checked: false,
      focused: false,
    };
  },
  computed: {
    coloredClass() {
      if (this.color.startsWith('#')) {
        return undefined;
      }
      return `color--${this.color}`;
    },
    classes() {
      const ret: Record<string, boolean> = {
        'y-input--active': this.checked,
        'y-input--focused': this.focused,
      };
      if (this.coloredClass) {
        ret[this.coloredClass] = true;
      }
      return ret;
    },
    inputId() {
      let id = this.counterId;
      if (this.id) {
        id = this.id;
      }
      return `input-${id}`;
    },
    iconComponent() {
      if (this.icon) {
        return IconCheckbox;
      }
      return null;
    },
  },
  methods: {
    onFocus(e: FocusEvent) {
      this.focused = true;
      this.$emit('focus', e);
    },
    onBlur(e: FocusEvent) {
      this.focused = false;
      this.$emit('blur', e);
    },
    onClick(event: MouseEvent) {
      this.$emit('click', event);
    },
  },
  watch: {
    value(neo: boolean) {
      this.checked = neo;
    },
  },
  created() {
    this.checked = !!this.value;
  },
});
</script>
