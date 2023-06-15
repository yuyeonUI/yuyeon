import { PropType, computed, defineComponent, ref, withModifiers } from 'vue';

import { useRender } from '../../composables/component';
import { getUid } from '../../util/vue-component';

import './YCheckbox.scss';
import YInputCheckbox from './YInputCheckbox.js';

export default defineComponent({
  name: 'YCheckbox',
  components: { YInputCheckbox },
  model: {
    prop: 'inputValue',
    event: 'change',
  },
  emits: ['focus', 'blur', 'change'],
  props: {
    inputValue: [Boolean, Array] as PropType<boolean | any[]>,
    value: [String, Number, Object] as PropType<any>,
    label: String as PropType<string>,
    reverse: Boolean as PropType<boolean>,
    icon: {
      type: [Object, String] as PropType<
        { checked?: string; unchecked?: string } | string
      >,
    },
    color: {
      type: String as PropType<string>,
      default: () => 'primary',
    },
    disabled: Boolean as PropType<boolean>,
    readonly: Boolean as PropType<boolean>,
  },
  setup(props, { emit, slots }) {
    const focused = ref(false);
    const innerValue = ref(false);
    const counterId = (getUid() ?? '').toString();
    const inputId = `input-${counterId}`;

    function onFocus(e: FocusEvent) {
      focused.value = true;
      emit('focus', e);
    }

    function onBlur(e: FocusEvent) {
      focused.value = false;
      emit('blur', e);
    }

    function onClick(e: Event, ...args: any[]) {
      if (props.disabled || props.readonly) return;
      innerValue.value = !innerValue.value;
      emit('change', innerValue.value, e);
    }

    function inputByValue() {
      if (Array.isArray(props.inputValue)) {
        const found = props.inputValue?.find((inp: any) => inp === props.value);

        if (found !== undefined) {
          innerValue.value = true;
        } else {
          innerValue.value = false;
        }
      } else if (typeof props.inputValue === 'boolean') {
        innerValue.value = props.inputValue;
      }
    }

    const classes = computed<Record<string, boolean>>(() => {
      const { reverse, disabled, readonly } = props;
      return {
        'y-checkbox': true,
        'y-checkbox--reverse': !!reverse,
        'y-checkbox--focused': focused.value,
        'y-checkbox--disabled': !!disabled,
        'y-checkbox--readonly': !!readonly,
      };
    });

    const computedIcon = computed<string | undefined>(() => {
      if (typeof props.icon === 'string') {
        return props.icon;
      }
      return undefined;
    });

    const isMultipleInput = computed<boolean>(() => {
      return Array.isArray(props.inputValue);
    });

    const multipleInputIndex = computed<number>(() => {
      if (!isMultipleInput.value) {
        return -1;
      }
      return (props.inputValue as any[]).findIndex(
        (v: any) => v === props.value,
      );
    });

    useRender(() => {
      return (
        <div class={classes}>
          <slot name="prepend"></slot>
          <div class="y-checkbox__slot">
            <YInputCheckbox
              onClick={(e: Event, ...args: any[]) => {
                e.stopPropagation();
                onClick(e, ...args);
              }}
              onFocus={onFocus}
              onBlur={onBlur}
              id={'counterId'}
              value={innerValue.value}
              icon={computedIcon.value}
              color={props.color}
              disabled={props.disabled}
              readonly={props.readonly}
            >
              {slots.icon && {
                icon: (...args: any[]) => slots.icon?.(...args),
              }}
            </YInputCheckbox>
            <label
              onClick={withModifiers(() => {}, ['stop'])}
              class="y-checkbox__label"
              for={inputId}
            >
              {slots.label ? slots.label?.() : props.label}
            </label>
          </div>
          {slots.append?.()}
        </div>
      );
    });

    return {
      innerValue,
      inputByValue,
    };
  },
  created() {
    if (Array.isArray(this.inputValue)) {
      this.inputByValue();
    } else {
      this.innerValue = !!this.inputValue;
    }
  },
  watch: {
    inputValue: {
      handler() {
        this.inputByValue();
      },
      immediate: true,
    },
  },
});
