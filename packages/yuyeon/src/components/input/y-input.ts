/*
 * Created by yeonyu 2022.
 */
import { getSlot } from '../../util/vue-component';

import './index.scss';
import {
  defineComponent,
  Directive,
  h,
  PropType,
  resolveDirective,
  VNode,
  withDirectives,
} from 'vue';
import RebindAttrs from '../../mixins/rebind-attrs';
import DiMixin from '../../mixins/di';

const NAME = 'y-input';
let uidCounter = 0;

export default defineComponent({
  name: NAME,
  inheritAttrs: false,
  mixins: [RebindAttrs, DiMixin],
  props: {
    name: String,
    width: {
      type: [String, Number] as PropType<string | number>,
    },
    height: [Number, String],
    displayTag: {
      type: String as PropType<string>,
      default: 'div',
    },
    outlined: Boolean as PropType<boolean>,
    filled: {
      type: Boolean as PropType<boolean>,
    },
    ceramic: Boolean as PropType<boolean>,
    label: String as PropType<string>,
    modelValue: { type: [String, Number] as PropType<string | number> },
    autoSelect: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    floated: { type: Boolean as PropType<boolean>, default: () => false },
    placeholder: String as PropType<string>,
    loading: Boolean as PropType<boolean>,
    // validate
    readonly: Boolean as PropType<boolean>,
    disabled: Boolean as PropType<boolean>,
    error: Boolean as PropType<boolean>,
    validators: Array as PropType<((v: any) => boolean | string)[] | string[]>,
  },
  data() {
    const iid = uidCounter.toString();
    uidCounter += 1;
    return {
      isFocused: false,
      iid,
      lazyValue: undefined as string | undefined,
      inValue: '' as string | number | undefined,
      hasMouseDown: false,
      errorResult: undefined as string | undefined,
      inError: false,
    };
  },
  computed: {
    classes(): Record<string, boolean> {
      return {
        'y-input--outlined': !this.ceramic && !!this.outlined,
        'y-input--filled': !!this.filled,
        'y-input--focused': this.isFocused,
        'y-input--ceramic': !!this.ceramic,
        'y-input--readonly': !!this.readonly,
        'y-input--has-value': !!this.inValue,
        'y-input--disabled': !!this.disabled,
        'y-input--error': this.isError,
      };
    },
    displayStyles(): Record<string, any> {
      let { width } = this;
      if (!Number.isNaN(Number(width))) {
        width = `${width}px`;
      }
      return {
        width,
        height: this.getDisplayHeight(),
      };
    },
    attrId(): string {
      return (this.$attrs.id as string) ?? `y-input--${this.iid}`;
    },
    isFloatedLabel(): boolean {
      return (
        this.floated ||
        !!this.placeholder ||
        (!this.placeholder && this.isFocused) ||
        !!this.inValue
      );
    },
    formLoading(): boolean {
      const form$ = (this as any).form$ as any;
      if (form$) {
        return form$.loading;
      }
      return false;
    },
    isError(): boolean {
      return !!this.error || this.inError;
    },
  },
  methods: {
    createPrependOuter(): VNode | undefined {
      const slot = getSlot(this, 'prepend-outer');
      return slot
        ? h('div', { class: `${NAME}__prepend-outer` }, slot)
        : undefined;
    },
    createAppendOuter(): VNode | undefined {
      const slot = getSlot(this, 'append-outer');
      return slot
        ? h('div', { class: `${NAME}__append-outer` }, slot)
        : undefined;
    },
    createLabelSlot(): (VNode | string | VNode[])[] {
      const slot: VNode[] | undefined = getSlot(this, 'label');
      if (!slot) {
        if (this.label) {
          return [this.label];
        }
        if (this.placeholder && !this.inValue) {
          return [this.placeholder];
        }
      }

      return slot ? [slot] : [];
    },
    createLabel(): VNode | undefined {
      const show = !!this.label || !!getSlot(this, 'label');
      if (!show) {
        return undefined;
      }
      return h(
        'label',
        {
          class: {
            [`${NAME}__label`]: true,
            'y-input__label--floated': this.isFloatedLabel,
          },
          '.for': this.attrId,
        },
        this.createLabelSlot(),
      );
    },
    createDefaultSlot(): VNode[] | string | undefined {
      const { modelValue } = this;
      const slotContent = getSlot(this, 'default', { modelValue });
      return slotContent ?? modelValue?.toString();
    },
    createDefaultChildren(): (VNode | undefined | VNode[] | string)[] {
      return [this.createLabel(), this.createDefaultSlot()];
    },
    createDefault(): VNode {
      return h(
        'div',
        {
          [`.${NAME}__value`]: true,
          '.data-id': this.attrId,
          '.tabindex': 0,
          onFocus: this.onFocus,
          onBlur: this.onBlur,
        },
        this.createDefaultChildren(),
      );
    },
    createPrepend(): VNode | undefined {
      const slot = getSlot(this, 'prepend', { error: this.isError });
      return slot
        ? h(
            'div',
            {
              class: 'y-input__prepend',
              onClick: this.onClickPrepend,
            },
            slot,
          )
        : undefined;
    },
    createAppend(): VNode | undefined {
      const slot = getSlot(this, 'append');
      return slot ? h('div', { class: 'y-input__append' }, slot) : undefined;
    },
    getDisplayHeight() {
      const { height } = this;
      if (!isNaN(Number(height))) {
        return `${height}px`;
      }
      return height;
    },
    createDisplay(): VNode {
      return h(
        'div',
        {
          class: {
            [`${NAME}__display`]: true,
          },
          onClick: this.onClick,
          onMousedown: this.onMousedown,
          onMouseup: this.onMouseup,
          ref: 'display',
          style: {
            ...this.displayStyles,
          },
        },
        [
          h('div', { class: `${NAME}__plate` }),
          this.createPrepend(),
          this.createDefault(),
          this.createAppend(),
        ],
      );
    },
    createHelperText(): VNode {
      const helperTextSlot = getSlot(this, 'helper-text', {
        error: !!this.error || this.inError,
        errorResult: this.errorResult,
      });
      const children = [];
      if (helperTextSlot) {
        children.push(helperTextSlot);
      } else {
        children.push(this.errorResult);
      }
      return h('div', { class: `${NAME}__helper-text` }, children);
    },
    createStackChildren(): VNode[] {
      return [this.createDisplay(), this.createHelperText()];
    },
    createStack(): VNode {
      return h(
        'div',
        {
          class: `${NAME}__stack`,
          ref: 'stack',
        },
        this.createStackChildren(),
      );
    },
    createContent(): (VNode | undefined)[] {
      return [
        this.createPrependOuter(),
        this.createStack(),
        this.createAppendOuter(),
      ];
    },
    //
    onClick(event: MouseEvent) {
      if (this.autoSelect) {
        if (event.target) {
          window.getSelection()?.selectAllChildren(event.target as HTMLElement);
        }
      }
      this.$emit('click', event);
    },
    onMousedown(e: Event) {
      this.hasMouseDown = true;
      this.$emit('mousedown', e);
    },
    onMouseup(e: Event) {
      this.hasMouseDown = false;
      this.$emit('mouseup', e);
    },
    onFocus(event: FocusEvent) {
      this.isFocused = true;
      this.$emit('focus', event);
    },
    onBlur(event: FocusEvent) {
      this.isFocused = false;
      this.invokeValidators();
      this.$emit('blur', event);
    },
    onClickPrepend(event: MouseEvent) {
      this.$emit('click:prepend', event);
    },
    onChange(event?: Event) {
      this.invokeValidators();
    },
    //
    invokeValidators(): boolean {
      const { validators, inValue, $attrs } = this;
      const { required } = $attrs;
      this.resetError();
      let flag = true;
      if (Array.isArray(validators)) {
        validators.some((validator: any) => {
          const result = validator(inValue);
          if (typeof result === 'string') {
            this.inError = true;
            this.errorResult = result;
            flag = false;
            return true;
          }
          if (result === false) {
            this.inError = true;
            this.errorResult = '';
            flag = false;
            return true;
          }
          return false;
        });
      }
      if (flag && required && !inValue) {
        this.inError = true;
        return false;
      }
      return flag;
    },
    resetError() {
      this.inError = false;
      this.errorResult = undefined;
    },
    getClasses() {
      return this.classes;
    },
  },
  watch: {
    modelValue(neo: string) {
      if (!this.readonly) {
        this.inValue = neo;
      }
    },
    readonly(neo: boolean) {
      if (!neo) {
        this.inValue = this.modelValue;
      }
    },
    inValue(neo: string) {
      if (!this.readonly) {
        this.$emit('update:modelValue', neo);
      }
    },
    isError(neo: boolean) {
      this.$emit('error', neo);
    },
  },
  created() {
    this.inValue = this.modelValue;
  },
  render(): VNode {
    return withDirectives(
      h(
        'div',
        {
          class: { ...this.getClasses(), [`${NAME}`]: true },
        },
        this.createContent(),
      ),
      [
        // [
        //   resolveDirective('theme') as Directive,
        //   (this as any).theme.dark ? 'dark' : 'light',
        // ],
      ],
    );
  },
});
