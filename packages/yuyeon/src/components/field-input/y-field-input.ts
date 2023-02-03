/*
 * Created by yeonyu 2022.
 */

import { YInput } from '../input';
import { VNode, defineComponent, h } from 'vue';

import './index.scss';
import { getSlot } from '../../util/vue-component';
import IconClearable from '../icons/icon-clearable';

const NAME = 'y-field-input';

export default defineComponent({
  extends: YInput,
  name: NAME,
  inheritAttrs: false,
  props: {
    clearable: Boolean,
    inputAlign: String,
    displayText: [String, Function],
    whenInputValid: [Boolean, Number],
    tabindex: {
      type: String,
      default: '0',
    },
  },
  mounted() {
    this.displayValue = this.inValue as string;
  },
  data() {
    return {
      displayValue: '' as string,
    };
  },
  computed: {
    fieldInputClasses(): Record<string, any> {
      return {
        ...this.classes,
        [NAME]: true,
      };
    },
    inputType(): string {
      const attr = (this.$attrs.type as string) || 'text';
      return attr;
    },
  },
  methods: {
    getClasses() {
      return {
        ...YInput.methods?.getClasses(),
        ...this.fieldInputClasses,
      };
    },
    createInput(): VNode {
      const { readonly, placeholder, disabled } = this;
      return h('input', {
        '.value': this.displayValue,
        '.id': this.attrId,
        '.type': this.inputType,
        readonly: readonly || this.loading || this.formLoading,
        '.placeholder': placeholder,
        '.disabled': disabled,
        '^tabindex': this.tabindex || '0',
        autocomplete: this.$attrs.autocomplete,
        maxlength: this.$attrs.maxlength,
        onInput: this.onInput,
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        onChange: this.onChange,
        onKeydown: this.onKeydown,
        onKeyup: this.onKeyup,
        style: {
          textAlign: this.inputAlign,
        },
        ref: 'input',
      });
    },
    createDefaultChildren(): (VNode | undefined)[] {
      return [
        YInput.methods!.createLabel.call(this),
        this.createInput.call(this),
      ];
    },
    createDefault(): VNode {
      return h(
        'div',
        {
          class: `${NAME}__field`,
          'data-id': this.attrId,
          ref: 'field',
        },
        this.createDefaultChildren(),
      );
    },
    createClearAppend(): VNode {
      return h('div', { class: 'y-input__append y-input__append--clear' }, [
        h(
          'button',
          {
            class: `${NAME}__clear`,
            onClick: this.onClickClear,
            onKeydown: this.onKeydownClear,
            '^tabindex': '2',
          },
          [h(IconClearable)],
        ),
      ]);
    },
    createAppend(): VNode[] {
      const appends = [];
      if (this.clearable && this.inValue) {
        appends.push(this.createClearAppend());
      }
      const slot = getSlot(this, 'append');
      if (slot) {
        appends.push(h('div', { class: 'y-input__append' }, slot));
      }
      return appends;
    },
    //
    onClick(event: MouseEvent) {
      (this.$refs.input as HTMLElement).focus();
      this.$emit('click', event);
    },
    onFocus(event: FocusEvent) {
      if (this) {
        this.isFocused = true;
        this.displayValue = this.inValue as string;
        this.$emit('focus', event);
      }
    },
    onBlur(event: FocusEvent) {
      this.isFocused = false;
      this.invokeValidators();
      this.$emit('blur', event);
      this.changeDisplay();
    },
    onInput(event: InputEvent) {
      const target = event.target as HTMLInputElement | null;
      this.inValue = target?.value;
      this.displayValue = target?.value as string;
      if (this.whenInputValid) {
        this.invokeValidators();
      }
      this.$emit('update:modelValue', this.inValue);
    },
    onChange(event: Event) {
      YInput.methods?.onChange.call(this, event);
      this.$emit('change', this.inValue);
    },
    onKeydown(event: KeyboardEvent) {
      this.$emit('keydown', event);
    },
    onKeyup(event: KeyboardEvent) {
      this.$emit('keyup', event);
    },
    //
    clear() {
      this.inValue = '';
      this.$emit('update:modelValue', this.inValue);
    },
    onClickClear(event: MouseEvent) {
      this.clear();
    },
    onKeydownClear(event: KeyboardEvent) {
      if (event.code === 'Space' || event.code === 'Enter') {
        this.clear();
      }
    },
    //
    /**
     * @public
     */
    focus() {
      (this.$refs.input as HTMLInputElement).focus();
    },
    /**
     * @public
     */
    select() {
      (this.$refs.input as HTMLInputElement).select();
    },
    //
    changeDisplay() {
      const { displayText } = this;
      if (displayText !== undefined) {
        let text = this.inValue;
        if (typeof displayText === 'string') {
          text = displayText;
        }
        if (displayText && typeof displayText === 'function') {
          text = (displayText as any).call(this, text);
        }
        this.$nextTick(() => {
          this.displayValue = text as string;
        });
      }
    },
  },
  watch: {
    modelValue(neo: any) {
      this.inValue = neo;
      this.displayValue = neo;
    },
    inValue(neo: string) {
      if (!this.isFocused) {
        this.changeDisplay();
      } else {
        this.displayValue = neo;
      }
    },
  },
});
