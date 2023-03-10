<!--
  - Created by yeonyu at 2021-09-23
  -->

<template>
  <div class="y-switch" :class="classes">
    <div class="y-switch__slot">
      <div
        class="y-switch__input"
        @click.capture="onClick"
        @keydown="onKeydown"
      >
        <input
          :id="inputId"
          :aria-checked="innerValue"
          type="checkbox"
          role="switch"
          @focus="onFocus"
          @blur="onBlur"
          @change="onChange"
          :disabled="disabled"
          :checked="innerValue"
          ref="checkbox"
        />
        <div class="y-switch__track" :style="trackStyles">
          <div v-if="stateLabel" class="y-switch__state">
            <span class="y-switch__state-label y-switch__state-label--on">
              {{ labelOn }}
            </span>
            <span class="y-switch__state-label y-switch__state-label--off">
              {{ labelOff }}
            </span>
          </div>
        </div>
        <div class="y-switch__thumb">
          <div v-if="loading" class="y-switch__spinner"></div>
        </div>
      </div>
      <label :for="inputId" class="y-switch__label">
        <slot name="label"></slot>
        <input hidden />
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

let uidCounter = 0;

export default defineComponent({
  name: 'YSwitch',
  model: {
    prop: 'input',
    event: 'change',
  },
  props: {
    input: {
      type: [Boolean, Array] as PropType<boolean | any[]>,
      default: false,
    },
    value: {
      type: [String, Number, Object] as PropType<any>,
    },
    max: {
      type: Number,
    },
    loading: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    stickOut: {
      type: Boolean,
    },
    stateLabel: {
      type: Boolean,
    },
    color: {
      type: String,
    },
    labelOn: {
      type: String,
      default: 'ON',
    },
    labelOff: {
      type: String,
      default: 'OFF',
    },
  },
  data() {
    return {
      innerValue: false,
      counterId: '',
      focused: false,
    };
  },
  created() {
    const iid = uidCounter.toString();
    uidCounter += 1;
    this.counterId = iid;
    if (Array.isArray(this.input)) {
      this.inputByValue();
    } else {
      this.innerValue = this.input;
    }
  },
  computed: {
    isMultipleInput() {
      return Array.isArray(this.input);
    },
    multipleInputIndex() {
      if (!Array.isArray(this.input)) {
        return -1;
      }
      return this.input.findIndex((inp) => {
        return inp === this.value;
      });
    },
    inputId() {
      const id = this.counterId;
      return `y-switch--${id}`;
    },
    trackStyles() {
      return {
        backgroundColor: this.color,
      };
    },
    classes() {
      return {
        'y-switch--disabled': this.disabled,
        'y-switch--loading': this.loading,
        'y-switch--active': this.innerValue,
        'y-switch--stick-out': this.stickOut,
        'y-switch--focused': this.focused,
      };
    },
  },
  methods: {
    inputByValue() {
      if (Array.isArray(this.input)) {
        const found = this.input.find((inp: any) => {
          return inp === this.value;
        });

        if (found !== undefined) {
          this.innerValue = true;
        } else {
          this.innerValue = false;
        }
      }
    },
    changeMultipleInput(checked: boolean) {
      if (Array.isArray(this.input)) {
        const multipleInput = this.input.slice();
        if (
          checked &&
          this.max !== undefined &&
          multipleInput.length >= this.max
        ) {
          this.$emit('overmax');
          this.nextChange(false, multipleInput);
          return;
        }
        if (checked && this.multipleInputIndex < 0) {
          multipleInput.push(this.value);
        } else if (this.multipleInputIndex > -1) {
          multipleInput.splice(this.multipleInputIndex, 1);
        }
        this.$emit('change', multipleInput);
      }
    },
    nextChange(checked: boolean, value: any) {
      this.$nextTick(() => {
        this.innerValue = checked;
      });
    },
    onClick($event: Event) {
      if (this.disabled || this.loading) return;
      this.changeInput(!this.innerValue, $event);
    },
    onFocus() {
      this.focused = true;
    },
    onBlur() {
      this.focused = false;
    },
    onKeydown($event: KeyboardEvent) {
      // nothing
    },
    onChange($event: Event) {
      const $checkbox = $event.target as HTMLInputElement;
      const { checked } = $checkbox;
      this.changeInput(checked, $event);
    },
    changeInput(checked: boolean, event?: Event) {
      this.innerValue = checked;
      if (this.isMultipleInput) {
        this.changeMultipleInput(checked);
      } else {
        this.$emit('change', checked);
      }
    },
  },
  watch: {
    input() {
      this.inputByValue();
    },
  },
});
</script>

<style lang="scss">
@import 'index';
</style>
