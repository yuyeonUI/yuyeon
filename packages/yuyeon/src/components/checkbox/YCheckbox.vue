<!--
  - Created by yeonyu at 2021-09-23
  -->

<template>
  <div class="y-checkbox" :class="classes">
    <slot name="prepend"></slot>
    <div class="y-checkbox__slot">
      <y-input-checkbox
        @click.stop="onClick"
        :id="counterId"
        :value="innerValue"
        :icon="computedIcon"
        @focus="onFocus"
        @blur="onBlur"
        :color="color"
        :disabled="disabled"
        :readonly="readonly"
      >
        <template v-if="$slots.icon" #icon="{ checked }">
          <slot name="icon" :checked="checked"></slot>
        </template>
      </y-input-checkbox>
      <label @click.stop="" class="y-checkbox__label" :for="inputId">
        <slot name="label">{{ label }}</slot>
      </label>
    </div>
    <slot name="append"></slot>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

import YInputCheckbox from './YInputCheckbox.vue';
import './y-checkbox.scss';

export default defineComponent({
  name: 'y-checkbox',
  components: { YInputCheckbox },
  created() {
    this.innerValue = !!this.inputValue;
  },
  model: {
    prop: 'inputValue',
    event: 'change',
  },
  props: {
    inputValue: Boolean as PropType<boolean>,
    label: String as PropType<string>,
    reverse: Boolean as PropType<boolean>,
    icon: {
      type: [Object, String] as PropType<
        { checked?: string; unchecked?: string } | string
      >,
    },
    color: {
      type: String as PropType<string>,
      default: () => 'primary',
    },
    disabled: Boolean as PropType<boolean>,
    readonly: Boolean as PropType<boolean>,
  },
  data() {
    return {
      innerValue: false,
      focused: false,
      counterId: this.$.uid.toString(),
    };
  },
  computed: {
    classes(): Record<string, boolean> {
      const { reverse, focused, disabled, readonly } = this;
      return {
        'y-checkbox--reverse': !!reverse,
        'y-checkbox--focused': focused,
        'y-checkbox--disabled': !!disabled,
        'y-checkbox--readonly': !!readonly,
      };
    },
    computedIcon(): string | undefined {
      if (typeof this.icon === 'string') {
        return this.icon;
      }
      return undefined;
    },
    inputId() {
      const id = this.counterId;
      return `input-${id}`;
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
    onClick(e: MouseEvent) {
      if (this.disabled || this.readonly) return;
      this.innerValue = !this.innerValue;
      this.$emit('change', this.innerValue, e);
    },
  },
  watch: {
    inputValue(neo: boolean) {
      this.innerValue = neo;
    },
  },
});
</script>
