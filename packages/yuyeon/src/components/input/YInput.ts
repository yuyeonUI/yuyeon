import {
  PropType,
  VNode,
  defineComponent,
  h,
  resolveDirective,
  withDirectives, SlotsType,
} from 'vue';

import { pressFocusPropsOptions, useFocus } from '../../composables/focus';
import { pressThemePropsOptions, useLocalTheme } from '../../composables/theme';
import DiMixin from '../../mixins/di';
import { getSlot, propsFactory } from '../../util/vue-component';

import './YInput.scss';

const NAME = 'y-input';
let uidCounter = 0;

export const pressYInputPropsOptions = propsFactory(
  {
    name: String,
    width: {
      type: [String, Number] as PropType<string | number>,
    },
    height: [Number, String],
    displayTag: {
      type: String as PropType<string>,
      default: 'div',
    },
    label: String as PropType<string>,
    modelValue: { type: [String, Number, Array, Object] as PropType<any> },
    autoSelect: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    floating: { type: Boolean as PropType<boolean>, default: false },
    floated: { type: Boolean as PropType<boolean>, default: () => false },
    placeholder: String as PropType<string>,
    required: Boolean as PropType<boolean>,
    loading: Boolean as PropType<boolean>,
    // variations
    variation: String as PropType<string>,
    outlined: Boolean as PropType<boolean>,
    filled: Boolean as PropType<boolean>,
    ceramic: Boolean as PropType<boolean>,
    // validate
    readonly: Boolean as PropType<boolean>,
    disabled: Boolean as PropType<boolean>,
    status: {
      type: String as PropType<'success' | 'warning' | 'error' | undefined>,
      validator(value: string) {
        return ['success', 'warning', 'error'].includes(value);
      },
    },
    validators: Array as PropType<((v: any) => boolean | string)[] | string[]>,
    ...pressFocusPropsOptions(),
  },
  'YInput',
);

export const YInput = defineComponent({
  name: 'YInput',
  props: {
    ...pressThemePropsOptions(),
    ...pressYInputPropsOptions(),
  },
  emits: [
    'error',
    'click',
    'mousedown',
    'mouseup',
    'focus',
    'blur',
    'mousedown:display',
    'mouseup:display',
    'click:leading',
    'update:modelValue',
    'update:focused',
  ],
  slots: Object as SlotsType<{
    prepend: any,
    append: any,
    label: any,
    default: { value: any, formLoading: boolean, attrId: string },
    leading: { error: boolean },
    trailing: any,
    'helper-text': { error: boolean, errorResult: string | undefined }
  }>,
  data() {
    const iid = uidCounter.toString();
    uidCounter += 1;
    return {
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
        'y-input--ceramic': !!this.ceramic,
        'y-input--outlined':
          !this.ceramic &&
          (this.variations.includes('outlined') || !!this.outlined),
        'y-input--filled': this.variations.includes('filled') || !!this.filled,
        'y-input--focused': this.isFocused,
        'y-input--readonly': !!this.readonly,
        'y-input--has-value': !!this.inValue,
        'y-input--disabled': !!this.disabled,
        'y-input--error': this.isError,
        'y-input--success': this.isSuccess,
        [this.themeClasses as string]: true,
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
      // TODO: composable `form` binding
      // const form$ = (this as any)?.form$ as any;
      // if (form$) {
      //   return form$.loading;
      // }
      return false;
    },
    isError(): boolean {
      return this.status === 'error' || this.inError;
    },
    isSuccess(): boolean {
      return !this.isError && this.status === 'success';
    },
    variations(): string[] {
      const { variation } = this;
      if (variation) {
        return variation.split(',').map((value) => {
          return value.trim();
        });
      }
      return [];
    },
  },
  methods: {
    createPrepend(): VNode | undefined {
      const slot = getSlot(this, 'prepend');
      return slot ? h('div', { class: `${NAME}__prepend` }, slot) : undefined;
    },
    createAppend(): VNode | undefined {
      const slot = getSlot(this, 'append');
      return slot ? h('div', { class: `${NAME}__append` }, slot) : undefined;
    },
    createLabelSlot(): (VNode | string | VNode[] | undefined)[] {
      const slot: VNode[] | undefined = getSlot(this, 'label');
      if (!slot) {
        if (this.label) {
          return [
            this.label,
            this.required ? h('span', { class: 'y-input__required-mark' }, '*') : undefined,
          ];
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
            'y-input__floating-label': this.floating,
            'y-input__floating-label--floated':
              this.floating && this.isFloatedLabel,
          },
          '.for': this.attrId,
        },
        this.createLabelSlot(),
      );
    },
    createDefaultChildren(): (VNode | undefined | VNode[] | string)[] {
      const { modelValue } = this;
      return [
        this.floating ? this.createLabel() : undefined,
        modelValue?.toString(),
      ];
    },
    createDefault(): VNode[] | VNode {
      const { modelValue, formLoading, attrId } = this;
      const slotContent = getSlot(this, 'default', {
        value: modelValue,
        formLoading,
        attrId,
      });
      return (
        slotContent ??
        h(
          'div',
          {
            [`.${NAME}__value`]: true,
            '.data-id': this.attrId,
            '.tabindex': 0,
            onFocus: this.onFocus,
            onBlur: this.onBlur,
          },
          this.createDefaultChildren(),
        )
      );
    },
    createLeading(): VNode | undefined {
      const slot = getSlot(this, 'leading', { error: this.isError });
      return slot
        ? h(
            'div',
            {
              class: 'y-input__leading',
              onClick: this.onClickLeading,
            },
            slot,
          )
        : undefined;
    },
    createTrailing(): VNode | VNode[] | undefined {
      return getSlot(this, 'trailing');
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
          this.createLeading(),
          this.createDefault(),
          this.createTrailing(),
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
    createStackChildren(): (VNode | undefined)[] {
      return [
        !this.floating ? this.createLabel() : undefined,
        this.createDisplay(),
        this.createHelperText(),
      ];
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
      return [this.createPrepend(), this.createStack(), this.createAppend()];
    },
    //
    onClick(event: MouseEvent) {
      this.$emit('click', event);
    },
    onMousedown(e: Event) {
      this.hasMouseDown = true;
      this.$emit('mousedown:display', e);
    },
    onMouseup(e: Event) {
      this.hasMouseDown = false;
      this.$emit('mouseup:display', e);
    },
    onFocus(event: FocusEvent) {
      this.whenFocus();
      this.$emit('focus', event);
    },
    onBlur(event: FocusEvent) {
      this.whenBlur();
      this.invokeValidators();
      this.$emit('blur', event);
    },
    onClickLeading(event: MouseEvent) {
      this.$emit('click:leading', event);
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
  setup(props) {
    const { themeClasses } = useLocalTheme(props);
    const {
      focused: isFocused,
      focusedClasses,
      whenFocus,
      whenBlur,
    } = useFocus(props, 'y-input');
    return {
      themeClasses,
      isFocused,
      focusedClasses,
      whenFocus,
      whenBlur,
    };
  },
  render(): VNode {
    return h(
      'div',
      {
        class: { ...this.getClasses(), [`${NAME}`]: true },
      },
      this.createContent(),
    );
  },
});

export type YInput = InstanceType<typeof YInput>;
