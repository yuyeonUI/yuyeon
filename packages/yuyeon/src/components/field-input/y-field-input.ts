/*
 * Created by yeonyu 2022.
 */
import {
  PropType,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  ref,
  watch,
} from 'vue';

import IconClearable from '../icons/icon-clearable';
import { YInput, YInputProps } from '../input';
import './index.scss';

const NAME = 'y-field-input';

export const YFieldInput = defineComponent({
  name: NAME,
  props: {
    ...YInputProps,
    clearable: Boolean as PropType<boolean>,
    inputAlign: String as PropType<string>,
    displayText: [String, Function] as PropType<
      string | ((value: any) => string)
    >,
    whenInputValid: [Boolean, Number] as PropType<boolean | number>,
    tabindex: {
      type: String as PropType<string>,
      default: '0',
    },
  },
  emits: [
    'update:modelValue',
    'input',
    'change',
    'click',
    'mousedown',
    'mouseup',
    'keydown',
    'keyup',
    'focus',
    'blur',
  ],
  setup(props, { attrs, expose, emit, slots }) {
    const yInputRef = ref<YInput>();
    const inputRef = ref<HTMLInputElement>();
    const isFocused = ref(false);
    const inValue = ref<any>('');
    const displayValue = ref('');

    const classes = computed(() => {
      return {
        ...(yInputRef.value?.classes || {}),
        'y-input--focused': isFocused.value,
        [NAME]: true,
      };
    });

    const inputType = computed(() => {
      const attr = (attrs.type as string) || 'text';
      return attr;
    });

    const invokeValidators = () => {
      //
    };

    function onClick(event: MouseEvent) {
      inputRef.value?.focus();
      emit('click', event);
    }

    function onFocus(event: FocusEvent) {
      isFocused.value = true;
      displayValue.value = inValue.value as string;
      emit('focus', event);
    }

    function onBlur(event: FocusEvent) {
      isFocused.value = false;
      invokeValidators();
      emit('blur', event);
      changeDisplay();
    }

    function onInput(event: InputEvent) {
      emit('input', event);
      const target = event.target as HTMLInputElement | null;
      inValue.value = target?.value;
      displayValue.value = target?.value as string;
      if (props.whenInputValid) {
        invokeValidators();
      }
    }

    function onChange(event: Event) {
      emit('change', inValue.value);
    }

    function onKeydown(event: KeyboardEvent) {
      emit('keydown', event);
    }

    function onKeyup(event: KeyboardEvent) {
      emit('keyup', event);
    }

    function onClickClear(event: MouseEvent) {
      clear();
    }

    function onKeydownClear(event: KeyboardEvent) {
      if (event.code === 'Space' || event.code === 'Enter') {
        clear();
      }
    }

    function focus() {
      inputRef.value?.focus();
    }

    function select() {
      inputRef.value?.select();
    }

    function clear() {
      inValue.value = '';
      emit('update:modelValue', inValue.value);
    }

    function changeDisplay() {
      const vm = getCurrentInstance();
      const { displayText } = props;
      if (displayText !== undefined) {
        let text = inValue.value;
        if (typeof displayText === 'string') {
          text = displayText;
        }
        if (displayText && typeof displayText === 'function') {
          text = (displayText as any).call(vm, text);
        }
        nextTick(() => {
          displayValue.value = text as string;
        });
      }
    }

    watch(
      () => props.modelValue,
      (neo: any) => {
        inValue.value = neo;
        displayValue.value = neo;
      },
      {
        immediate: true,
      },
    );

    watch(inValue, (neo: string) => {
      if (!isFocused.value) {
        changeDisplay();
      } else {
        displayValue.value = neo;
      }
    });

    expose({
      focus,
      select,
      clear,
      inputRef
    })

    const yInputProps = () => {
      const ret: Record<string, any> = {};
      for (const propKey in YInputProps) {
        ret[propKey] = props[propKey as keyof typeof props];
      }
      return ret;
    };

    function onUpdateModel(value: any) {
      emit('update:modelValue', value);
    }

    return () =>
      h(
        YInput,
        {
          class: classes.value,
          ref: yInputRef,
          ...yInputProps(),
          modelValue: inValue.value,
          'onUpdate:modelValue': onUpdateModel,
          onClick,
        },
        {
          default: (defaultProps: any) =>
            h(
              'div',
              {
                class: `${NAME}__field`,
                'data-id': defaultProps.attrId,
                ref: 'field',
              },
              [
                YInput.methods!.createLabel.call(yInputRef),
                h('input', {
                  '.value': displayValue.value,
                  '.id': defaultProps.attrId,
                  '.type': inputType.value,
                  readonly:
                    props.readonly || props.loading || defaultProps.formLoading,
                  '.placeholder': props.placeholder,
                  '.disabled': props.disabled,
                  '^tabindex': props.tabindex || '0',
                  autocomplete: attrs.autocomplete,
                  maxlength: attrs.maxlength,
                  onInput,
                  onFocus,
                  onBlur,
                  onChange,
                  onKeydown,
                  onKeyup,
                  style: {
                    textAlign: props.inputAlign,
                  },
                  ref: inputRef,
                }),
              ],
            ),
          append: () => {
            const appends = [];
            if (props.clearable && inValue.value) {
              appends.push(
                h('div', { class: 'y-input__append y-input__append--clear' }, [
                  h(
                    'button',
                    {
                      class: `${NAME}__clear`,
                      onClick: onClickClear,
                      onKeydown: onKeydownClear,
                      '^tabindex': '2',
                    },
                    [h(IconClearable)],
                  ),
                ]),
              );
            }
            const slot = slots.append;
            if (slot) {
              appends.push(h('div', { class: 'y-input__append' }, slot()));
            }
            return appends;
          },
          'helper-text': () => {
            return slots['helper-text']?.();
          }
        },
      );
  },
});

export type YFieldInput = InstanceType<typeof YFieldInput>;
