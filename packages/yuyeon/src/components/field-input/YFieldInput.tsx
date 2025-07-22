import {
  type PropType,
  type SlotsType,
  computed,
  getCurrentInstance,
  nextTick,
  ref,
  toRef,
  watch,
} from 'vue';

import { useRender } from '@/composables/component';
import { useFocus } from '@/composables/focus';
import { chooseProps, defineComponent, propsFactory } from '@/util/component';

import { YIconClear } from '../icons/YIconClear';
import {
  YInput,
  YInputDefaultSlotProps,
  pressYInputPropsOptions,
} from '../input';

import './YFieldInput.scss';

const NAME = 'y-field-input';

export const pressYFieldInputPropsOptions = propsFactory(
  {
    enableClear: Boolean as PropType<boolean>,
    inputAlign: String as PropType<string>,
    inlineLabel: Boolean as PropType<boolean>,
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
    inputStyle: Object as PropType<any>,
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
    'keydown:display',
    'click:clear',
  ],
  slots: Object as SlotsType<{
    prepend: any;
    append: any;
    label: any;
    default: YInputDefaultSlotProps & { focused: boolean };
    leading: { error: boolean };
    trailing: any;
    'leading-out': any;
    'trailing-out': any;
    'helper-text': { error: boolean; errorResult: string | undefined };
  }>,
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
        [`${NAME}--inline-label`]: !!props.inlineLabel,
      };
    });

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
      emit('blur', event);
      changeDisplay();
    }

    function onInput(event: Event) {
      emit('input', event);
      const target = event.target as HTMLInputElement | null;
      inValue.value = target?.value;
      displayValue.value = target?.value as string;
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
      emit('click:clear', event);
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
      emit('change', inValue.value);
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

    watch(
      inValue,
      (neo: string) => {
        if (!focused.value) {
          changeDisplay();
        } else {
          displayValue.value = neo;
        }
      },
      { immediate: true },
    );

    const extended = {
      focus,
      select,
      clear,
    };

    expose({
      ...extended,
      input$,
      validate: () => yInput$.value?.invokeValidators(),
      resetError: () => yInput$.value?.resetError(),
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
        focused={focused.value}
        extended={extended}
        onUpdate:modelValue={onUpdateModel}
        onClick={onClick}
        onMousedown:display={($event) => emit('mousedown:display', $event)}
        onKeydown:display={($event) => emit('keydown:display', $event)}
        style={[attrs.style]}
      >
        {{
          leading: slots.leading
            ? (args: any) => {
                const leadingChildren = [];
                const slot = slots.leading?.(args);
                if (slot) {
                  leadingChildren.push(slot);
                } else {
                  return undefined;
                }
                return leadingChildren;
              }
            : undefined,
          default: (defaultProps: YInputDefaultSlotProps) => (
            <div
              class={[`${NAME}__field`]}
              data-id={defaultProps.attrId}
              ref={'field'}
            >
              {props.floating ? yInput$.value?.createLabel?.() : undefined}
              {slots.default?.({ ...defaultProps, focused: focused.value })}
              {
                <input
                  ref={input$}
                  value={displayValue.value}
                  name={props.name}
                  id={defaultProps.attrId}
                  type={inputType.value}
                  readonly={
                    props.readonly || props.loading || defaultProps.loading
                  }
                  placeholder={props.placeholder}
                  disabled={props.disabled}
                  tabindex={props.tabindex || '0'}
                  autocomplete={attrs.autocomplete as string}
                  maxlength={attrs.maxlength as number | string}
                  min={attrs.min as number | string}
                  max={attrs.max as number | string}
                  style={[props.inputStyle, { textAlign: props.inputAlign } as any]}
                  size={(attrs.size ?? 1) as number}
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
                          disabled={props.disabled}
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
          prepend: slots.prepend ? () => slots.prepend?.() : undefined,
          append: slots.append ? () => slots.append?.() : undefined,
          'leading-out': slots['leading-out']
            ? () => slots['leading-out']?.()
            : undefined,
          'trailing-out': slots['trailing-out']
            ? () => slots['trailing-out']?.()
            : undefined,
          'helper-text': slots['helper-text']
            ? (slotProps: any) => slots['helper-text']?.(slotProps)
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
