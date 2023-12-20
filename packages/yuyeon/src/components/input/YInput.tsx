import {
  PropType,
  SlotsType,
  VNode,
  computed,
  defineComponent,
  ref,
  shallowRef,
  watch,
} from 'vue';

import { useRender } from '../../composables/component';
import { pressFocusPropsOptions, useFocus } from '../../composables/focus';
import { pressThemePropsOptions, useLocalTheme } from '../../composables/theme';
import {
  pressValidationPropsOptions,
  useValidation,
} from '../../composables/validation';
import { getUid, toStyleSizeValue } from '../../util';
import { propsFactory } from '../../util/vue-component';

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
    ...pressValidationPropsOptions(),
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
    prepend: any;
    append: any;
    label: any;
    default: { value: any; formLoading: boolean; attrId: string };
    leading: { error: boolean };
    trailing: any;
    'helper-text': { error: boolean; errorResult: string | undefined };
  }>,
  setup(props, { slots, attrs, expose, emit }) {
    const UID = getUid();
    const { themeClasses } = useLocalTheme(props);
    const {
      focused: isFocused,
      focusedClasses,
      whenFocus,
      whenBlur,
    } = useFocus(props, 'y-input');

    const { invokeValidators, isError, isSuccess, errorResult } = useValidation(
      props,
      NAME,
      UID,
    );

    const stack$ = ref();
    const display$ = ref();

    const inValue = ref();
    const lazyValue = ref();
    const hasMouseDown = shallowRef(false);

    const variations = computed(() => {
      if (props.variation) {
        return props.variation.split(',').map((value) => {
          return value.trim();
        });
      }
      return [];
    });

    const isFloatedLabel = computed(() => {
      return (
        props.floated ||
        !!props.placeholder ||
        (!props.placeholder && isFocused.value) ||
        !!inValue.value
      );
    });

    const classes = computed(() => {
      return {
        'y-input--ceramic': !!props.ceramic,
        'y-input--outlined':
          !props.ceramic &&
          (variations.value.includes('outlined') || !!props.outlined),
        'y-input--filled':
          variations.value.includes('filled') || !!props.filled,
        'y-input--focused': isFocused.value,
        'y-input--readonly': !!props.readonly,
        'y-input--has-value': !!inValue.value,
        'y-input--disabled': !!props.disabled,
        'y-input--error': isError.value,
        'y-input--success': isSuccess.value,
        [themeClasses.value as string]: true,
      };
    });

    const displayStyles = computed<Record<string, any>>(() => {
      return {
        width: toStyleSizeValue(props.width),
        height: toStyleSizeValue(props.height),
      };
    });

    const formLoading = computed(() => {
      // TODO: composable `form` binding
      // const form$ = (this as any)?.form$ as any;
      // if (form$) {
      //   return form$.loading;
      // }
      return false;
    });

    watch(
      () => props.modelValue,
      (neo) => {
        inValue.value = neo;
      },
    );

    watch(
      () => props.readonly,
      (neo) => {
        if (!neo) {
          inValue.value = props.modelValue;
        }
      },
    );

    watch(inValue, (neo) => {
      if (!props.readonly) {
        emit('update:modelValue', neo);
      }
    });

    watch(isError, (neo) => {
      emit('error', neo);
    });

    watch(
      () => props.focused,
      (neo) => {
        if (!neo) {
          invokeValidators();
        }
      },
    );

    function onClick(event: MouseEvent) {
      emit('click', event);
    }

    function onMousedown(e: Event) {
      hasMouseDown.value = true;
      emit('mousedown:display', e);
    }

    function onMouseup(e: Event) {
      hasMouseDown.value = false;
      emit('mouseup:display', e);
    }

    function onFocus(event: FocusEvent) {
      whenFocus();
      emit('focus', event);
    }

    function onBlur(event: FocusEvent) {
      whenBlur();
      invokeValidators();
      emit('blur', event);
    }

    function onClickLeading(event: MouseEvent) {
      emit('click:leading', event);
    }

    function onChange(event?: Event) {
      invokeValidators();
    }

    function createLabel(): VNode | undefined {
      const show = !!props.label || !!slots.label;
      if (!show) {
        return undefined;
      }
      return (
        <label
          class={[
            {
              [`${NAME}__label`]: true,
              'y-input__floating-label': props.floating,
              'y-input__floating-label--floated':
                props.floating && isFloatedLabel.value,
            },
          ]}
          for={`y-input--${UID}`}
        >
          {slots.label ? (
            slots.label()
          ) : props.label ? (
            <>
              {props.label}
              {props.required && (
                <span class={'y-input__required-mark'}>*</span>
              )}
            </>
          ) : (
            props.placeholder && !inValue.value && props.placeholder
          )}
        </label>
      );
    }

    expose({
      createLabel,
    });

    useRender(() => {
      return (
        <div class={[`${NAME}`, { ...classes.value }]}>
          {slots.prepend
            ? () => <div class={`${NAME}__prepend`}>slots.prepend()</div>
            : undefined}
          <div ref={stack$} class={[`${NAME}__stack`]}>
            {!props.floating && createLabel()}
            <div
              ref={display$}
              class={`${NAME}__display`}
              style={[{ ...displayStyles.value }]}
              onClick={onClick}
              onMousedown={onMousedown}
              onMouseup={onMouseup}
            >
              <div class={`${NAME}__plate`}></div>
              {slots.leading && (
                <div class={'y-input__leading'} onClick={onClickLeading}>
                  {slots.leading({ error: isError.value })}
                </div>
              )}
              {slots.default ? (
                slots.default({
                  value: props.modelValue,
                  formLoading: formLoading.value,
                  attrId: `y-input--${UID}`,
                })
              ) : (
                <div
                  class={`${NAME}__value`}
                  data-id={`y-input--${UID}`}
                  tabindex={0}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  {props.floating && createLabel()}
                  {props.modelValue?.toString()}
                </div>
              )}
              {slots.trailing?.()}
            </div>
            <div class={`${NAME}__helper-text`}>
              {slots['helper-text'] ? (
                <span>
                  {slots['helper-text']({
                    error: isError.value,
                    errorResult: errorResult.value,
                  })}
                </span>
              ) : (
                errorResult.value
              )}
            </div>
          </div>
          {slots.append
            ? () => <div class={`${NAME}__append`}>slots.append()</div>
            : undefined}
        </div>
      );
    });

    return {
      themeClasses,
      isFocused,
      focusedClasses,
      whenFocus,
      whenBlur,
      createLabel,
    };
  },
});

export type YInput = InstanceType<typeof YInput>;
