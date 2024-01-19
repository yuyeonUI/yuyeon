import {
  SlotsType,
  defineComponent,
  getCurrentInstance,
  nextTick,
  ref,
  watch,
} from 'vue';
import type { PropType } from 'vue';

import { useRender } from '../../composables/component';
import { useFocus } from '../../composables/focus';
import { chooseProps, getUid, propsFactory } from '../../util';
import { YInput, pressYInputPropsOptions } from '../input';

import './YTextarea.scss';

export const pressYTextareaPropsOptions = propsFactory(
  {
    displayText: [String, Function] as PropType<
      string | ((value: any) => string)
    >,
    whenInputValid: [Boolean, Number] as PropType<boolean | number>,
    ...pressYInputPropsOptions({
      variation: 'filled',
    }),
  },
  'YTextarea',
);

const CLASS_NAME = 'y-textarea';

export const YTextarea = defineComponent({
  name: 'YTextarea',
  props: pressYTextareaPropsOptions(),
  emits: {
    'update:modelValue': (v: any) => true,
    'update:focused': (v: boolean) => true,
    'mousedown:display': (e: MouseEvent) => true,
    input: (v: any) => true,
    change: (v: any, e: Event) => true,
    focus: (e: FocusEvent) => true,
    blur: (e: FocusEvent) => true,
    click: (e: MouseEvent) => true,
    keydown: (e: KeyboardEvent) => true,
    keyup: (e: KeyboardEvent) => true,
  },
  slots: Object as SlotsType<{
    default: any;
    label: any;
    'helper-text': any;
  }>,
  setup(props, { attrs, emit, slots, expose }) {
    const UID = getUid();
    const el$ = ref<YInput>();
    const input$ = ref();
    const inValue = ref<any>('');
    const displayValue = ref('');
    const { focused, whenFocus, whenBlur } = useFocus(props, 'y-field-input');

    function onUpdateModel(value: any) {
      emit('update:modelValue', value);
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

    function invokeValidators() {
      //
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
      emit('change', inValue.value, event);
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

    function onKeydown(event: KeyboardEvent) {
      emit('keydown', event);
    }

    function onKeyup(event: KeyboardEvent) {
      emit('keyup', event);
    }

    function onClick(event: MouseEvent) {
      emit('click', event);
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
      el$,
      input$,
    });

    useRender(() => {
      const yInputProps = chooseProps(props, YInput.props);
      return (
        <YInput
          class={[CLASS_NAME]}
          {...yInputProps}
          modelValue={inValue.value}
          onUpdate:modelValue={onUpdateModel}
          focused={focused.value}
          onClick={onClick}
          onMousedown:display={($event) => emit('mousedown:display', $event)}
        >
          {{
            default: (defaultProps: any) => (
              <div
                class={[`${CLASS_NAME}__field`]}
                data-id={defaultProps.attrId}
                ref={'field'}
              >
                {props.floating
                  ? el$.value?.createLabel?.()
                  : undefined}
                {slots.default ? () => slots.default(defaultProps) : undefined}
                {
                  <textarea
                    ref={input$}
                    value={displayValue.value}
                    id={`y-input--${UID}`}
                    disabled={props.disabled}
                    placeholder={props.placeholder}
                    {...attrs}
                    onInput={onInput}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={onChange}
                    onKeydown={onKeydown}
                    onKeyup={onKeyup}
                  ></textarea>
                }
              </div>
            ),
            label: slots.label ? () => slots.label?.() : undefined,
            'helper-text': slots['helper-text']
                ? () => slots['helper-text']?.()
                : undefined,
          }}
        </YInput>
      );
    });

    return {
      el$,
      input$,
    };
  },
});

export type YTextarea = InstanceType<typeof YTextarea>;
