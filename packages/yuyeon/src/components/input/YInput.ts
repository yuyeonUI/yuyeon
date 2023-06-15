
import {
  PropType,
  VNode,
  defineComponent,
  h,
  withDirectives, resolveDirective
} from "vue";

import DiMixin from '../../mixins/di';
import { getSlot } from '../../util/vue-component';
import './index.scss';

const NAME = 'y-input';
let uidCounter = 0;

export const YInputProps = {
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
  status: {
    type: String as PropType<'success' | 'warning' | 'error' | undefined>,
    validator(value: string) {
      return ['success', 'warning', 'error'].includes(value);
    }
  },
  validators: Array as PropType<((v: any) => boolean | string)[] | string[]>,
}

export const YInput = defineComponent({
  name: NAME,
  mixins: [DiMixin],
  props: YInputProps,
  emits: ['error', 'click', 'mousedown', 'mouseup', 'focus', 'blur', 'click:prepend', 'update:modelValue'],
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
        'y-input--success': this.isSuccess,
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
      return this.status === 'error' || this.inError;
    },
    isSuccess(): boolean {
      return !this.isError && this.status === 'success';
    }
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
    createDefaultChildren(): (VNode | undefined | VNode[] | string)[] {
      const { modelValue } = this;
      return [this.createLabel(), modelValue?.toString()];
    },
    createDefault(): VNode[] | VNode {
      const { modelValue, formLoading, attrId } = this;
      const slotContent = getSlot(this, 'default', { value: modelValue, formLoading, attrId });
      return slotContent ?? h(
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
    createAppend(): VNode | VNode[] | undefined {
      return getSlot(this, 'append');
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
          // onClick: this.onClick,
          // onMousedown: this.onMousedown,
          // onMouseup: this.onMouseup,
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
        error: this.status === 'error' || this.inError,
        errorResult: this.errorResult,
      });
      const children = [];
      if (helperTextSlot) {
        children.push(h('span', {}, helperTextSlot));
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
        [
          resolveDirective('theme'),
          (this as any)?.theme?.dark ? 'dark' : 'light',
        ],
      ],
    );
  },
});

export type YInput = InstanceType<typeof YInput>;
