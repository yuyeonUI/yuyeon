import {
  type PropType,
  computed,
  nextTick,
  ref,
  watch,
  withModifiers,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { defineComponent, getUid, propsFactory } from '@/util/component';

import './YSwitch.scss';

export const pressYSwitchPropsOptions = propsFactory(
  {
    modelValue: {
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
  'YSwitch',
);

export const YSwitch = defineComponent({
  name: 'YSwitch',
  props: {
    ...pressYSwitchPropsOptions(),
  },
  emits: [
    'update:modelValue',
    'change',
    'click',
    'focus',
    'blur',
    'keydown',
    'overmax',
  ],
  setup(props, { emit, slots }) {
    const counterId = (getUid() ?? '').toString();
    const inputId = `input-${counterId}`;
    const input$ = ref<HTMLInputElement>();
    const model = useModelDuplex(props);
    const checked = ref(false);
    const focused = ref(false);

    const isMultipleInput = computed(() => {
      return Array.isArray(model.value);
    });

    const multipleInputIndex = computed(() => {
      if (!isMultipleInput.value) return -1;
      return model.value.findIndex((item: any) => item === props.value);
    });

    const classes = computed(() => {
      return {
        'y-switch--active': checked.value,
        'y-switch--focused': focused.value,
        'y-switch--disabled': !!props.disabled,
        'y-switch--loading': !!props.loading,
        'y-switch--stick-out': !!props.stickOut,
      };
    });

    watch(model, () => {
      inputByProp();
    }, { immediate: true });

    function inputByProp() {
      const modelValue = model.value;
      if (Array.isArray(modelValue)) {
        const found = modelValue.find((item: any) => {
          return item === props.value;
        });
        checked.value = found !== undefined;
      } else if (typeof modelValue === 'boolean') {
        checked.value = modelValue;
      }
    }

    function changeMultipleInput(to: boolean) {
      const modelValue = model.value;
      if (Array.isArray(modelValue)) {
        const multipleInput = modelValue.slice();
        if (
          to &&
          props.max !== undefined &&
          multipleInput.length >= props.max
        ) {
          emit('overmax');
          nextChange(false, multipleInput);
          return;
        }
        if (to && multipleInputIndex.value < 0) {
          multipleInput.push(props.value);
        } else if (multipleInputIndex.value > -1) {
          multipleInput.splice(multipleInputIndex.value, 1);
        }
        emit('change', multipleInput);
      }
    }

    function nextChange(to: boolean, value: any) {
      nextTick(() => {
        checked.value = to;
      });
    }

    function onFocus(e: FocusEvent) {
      focused.value = true;
      emit('focus', e);
    }

    function onBlur(e: FocusEvent) {
      focused.value = false;
      emit('blur', e);
    }

    function onClick($event: Event) {
      if (props.disabled || props.loading) return;
      changeInput(!checked.value, $event);
    }

    function changeInput(to: boolean, event?: Event) {
      checked.value = to;
      if (isMultipleInput.value) {
        changeMultipleInput(to);
      } else {
        model.value = to;
        emit('change', to);
      }
    }

    function onKeydown($event: KeyboardEvent) {
      emit('keydown', $event);
    }

    useRender(() => {
      const trackStyles = {
        backgroundColor: props.color,
      };

      return (
        <div class={{ 'y-switch': true, ...classes.value }}>
          <div class="y-switch__slot">
            <div
              class="y-switch__input"
              onClick={withModifiers(onClick, ['exact'])}
              onKeydown={onKeydown}
            >
              <input
                ref={input$}
                id={inputId}
                aria-checked={checked.value}
                type="checkbox"
                role="switch"
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={props.disabled}
                checked={checked.value}
              />
              <div class="y-switch__track" style={trackStyles}>
                {props.stateLabel && (
                  <div class="y-switch__state">
                    <span class="y-switch__state-label y-switch__state-label--on">
                      {props.labelOn}
                    </span>
                    <span class="y-switch__state-label y-switch__state-label--off">
                      {props.labelOff}
                    </span>
                  </div>
                )}
              </div>
              <div class="y-switch__thumb">
                {props.loading && <div class="y-switch__spinner"></div>}
              </div>
            </div>
            {slots.label && (
              <label for={inputId} class="y-switch__label">
                {slots.label?.()}
                <input hidden />
              </label>
            )}
          </div>
        </div>
      );
    });
  },
});

export type YSwitch = InstanceType<typeof YSwitch>;
