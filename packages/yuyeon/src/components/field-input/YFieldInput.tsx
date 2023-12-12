import type { PropType } from 'vue';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  ref,
  toRef,
  watch,
} from 'vue';

import { useRender } from '../../composables/component';
import { useFocus } from '../../composables/focus';
import { chooseProps, propsFactory } from '../../util/vue-component';
import { YIconClear } from '../icons/YIconClear';
import { YInput, pressYInputPropsOptions } from '../input';

import './YFieldInput.scss';

const NAME = 'y-field-input';

export const pressYFieldInputPropsOptions = propsFactory(
  {
    enableClear: Boolean as PropType<boolean>,
    inputAlign: String as PropType<string>,
    displayText: [String, Function] as PropType<
      string | ((value: any) => string)
    >,
    whenInputValid: [Boolean, Number] as PropType<boolean | number>,
    tabindex: {
      type: String as PropType<string>,
      default: '0',
    },
    type: {
      type: String as PropType<string>,
      default: 'text',
    },
    ...pressYInputPropsOptions({
      variation: 'filled',
    }),
  },
  'YFieldInput',
);

export const YFieldInput = defineComponent({
  name: 'YFieldInput',
  props: {
    ...pressYFieldInputPropsOptions(),
  },
  emits: [
    'update:modelValue',
    'update:focused',
    'input',
    'change',
    'click',
    'mousedown',
    'mouseup',
    'keydown',
    'keyup',
    'focus',
    'blur',
    'mousedown:display',
  ],
  setup(props, { attrs, expose, emit, slots }) {
    const yInput$ = ref<YInput>();
    const input$ = ref<HTMLInputElement>();
    const { focused, whenFocus, whenBlur } = useFocus(props, 'y-field-input');
    const inValue = ref<any>('');
    const displayValue = ref('');
    const inputType = toRef(props, 'type');

    const classes = computed(() => {
      return {
        [NAME]: true,
      };
    });

    const invokeValidators = () => {
      //
    };

    function onClick(event: MouseEvent) {
      emit('click', event);
    }

    function onFocus(event: FocusEvent) {
      whenFocus();
      displayValue.value = inValue.value as string;
      emit('focus', event);
    }

    function onBlur(event: FocusEvent) {
      whenBlur();
      invokeValidators();
      emit('blur', event);
      changeDisplay();
    }

    function onInput(event: Event) {
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
      input$.value?.focus();
    }

    function select() {
      input$.value?.select();
    }

    function clear() {
      inValue.value = '';
      displayValue.value = '';
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
      if (!focused.value) {
        changeDisplay();
      } else {
        displayValue.value = neo;
      }
    });

    expose({
      focus,
      select,
      clear,
      input$,
    });

    function onUpdateModel(value: any) {
      emit('update:modelValue', value);
    }

    useRender(() => (
      <YInput
        class={classes.value}
        ref={yInput$}
        {...chooseProps(props, YInput.props)}
        modelValue={inValue.value}
        onUpdate:modelValue={onUpdateModel}
        focused={focused.value}
        onClick={onClick}
        onMousedown:display={($event) => emit('mousedown:display', $event)}
      >
        {{
          leading: slots.leading
            ? (...args: any[]) => {
                const leadingChildren = [];
                const slot = slots.leading?.(...args);
                if (slot) {
                  leadingChildren.push(slot);
                } else {
                  return undefined;
                }
                return leadingChildren;
              }
            : undefined,
          default: (defaultProps: any) => (
            <div
              class={[`${NAME}__field`]}
              data-id={defaultProps.attrId}
              ref={'field'}
            >
              {props.floating
                ? yInput$.value &&
                  YInput.methods!.createLabel.call(yInput$.value)
                : undefined}
              {slots.default?.()}
              {
                <input
                  ref={input$}
                  value={displayValue.value}
                  name={props.name}
                  id={defaultProps.attrId}
                  type={inputType.value}
                  readonly={
                    props.readonly || props.loading || defaultProps.formLoading
                  }
                  placeholder={props.placeholder}
                  disabled={props.disabled}
                  tabindex={props.tabindex || '0'}
                  autocomplete={attrs.autocomplete as string}
                  maxlength={attrs.maxlength as number | string}
                  min={attrs.min as number | string}
                  max={attrs.max as number | string}
                  style={[attrs?.style, { textAlign: props.inputAlign } as any]}
                  onInput={onInput}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onChange={onChange}
                  onKeydown={onKeydown}
                  onKeyup={onKeyup}
                />
              }
            </div>
          ),
          trailing:
            slots.trailing || (props.enableClear && inValue.value)
              ? () => (
                  <>
                    {props.enableClear && inValue.value && (
                      <div
                        class={[
                          'y-input__trailing',
                          'y-input__trailing--clear',
                        ]}
                      >
                        <button
                          class={[`${NAME}__clear`]}
                          onClick={onClickClear}
                          onKeydown={onKeydownClear}
                          tabindex={2}
                        >
                          <YIconClear></YIconClear>
                        </button>
                      </div>
                    )}
                    {slots.trailing && (
                      <div class={['y-input__trailing']}>
                        {slots.trailing()}
                      </div>
                    )}
                  </>
                )
              : undefined,
          label: slots.label ? () => slots.label?.() : undefined,
          'helper-text': slots['helper-text']
            ? () => slots['helper-text']?.()
            : undefined,
        }}
      </YInput>
    ));

    return {
      focused,
      inValue,
    };
  },
});

export type YFieldInput = InstanceType<typeof YFieldInput>;
