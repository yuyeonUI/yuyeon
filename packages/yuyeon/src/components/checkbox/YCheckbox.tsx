import {
  PropType,
  computed,
  defineComponent,
  ref,
  watch,
  withModifiers,
} from 'vue';

import { useRender } from '../../composables/component';
import { getUid } from '../../util/vue-component';
import YInputCheckbox from './YInputCheckbox';

import './YCheckbox.scss';

export const YCheckbox = defineComponent({
  name: 'YCheckbox',
  components: { YInputCheckbox },
  emits: ['focus', 'blur', 'click', 'update:modelValue', 'change'],
  props: {
    modelValue: [Boolean, Array] as PropType<boolean | any[]>,
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
    const checked = ref(false);
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
      emit('click', e);
      if (props.disabled || props.readonly) return;
      const check = !checked.value;
      checked.value = check;
      emit('change', check);
    }

    function inputByProp() {
      if (Array.isArray(props.modelValue)) {
        const found = props.modelValue?.find((inp: any) => inp === props.value);
        if (found !== undefined) {
          checked.value = true;
        } else {
          checked.value = false;
        }
      } else if (typeof props.modelValue === 'boolean') {
        checked.value = props.modelValue;
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
      return Array.isArray(props.modelValue);
    });

    function getMultipleInputIndex() {
      if (!isMultipleInput.value) {
        return -1;
      }
      return (props.modelValue as any[]).findIndex(
        (v: any) => v === props.value,
      );
    }

    watch(checked, (neo) => {
      if (Array.isArray(props.modelValue)) {
        const value = props.modelValue;
        const index = getMultipleInputIndex();
        if (neo && index === -1) {
          value.push(props.value);
        } else if (!neo && index !== -1) {
          value.splice(index, 1);
        }
        emit('update:modelValue', value);
      } else {
        emit('update:modelValue', neo);
      }
    });

    watch(
      () => props.modelValue,
      (neo) => {
        if (Array.isArray(neo)) {
          inputByProp();
        } else {
          checked.value = !!neo;
        }
      },
      { immediate: true, deep: true },
    );

    useRender(() => {
      return (
        <div class={[{ ...classes.value }]}>
          {slots.leading?.()}
          <div class="y-checkbox__slot">
            <YInputCheckbox
              onClick={(e: Event, ...args: any[]) => {
                e.stopPropagation();
                onClick(e, ...args);
              }}
              onFocus={onFocus}
              onBlur={onBlur}
              id={counterId}
              value={checked.value}
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
          {slots.trailing?.()}
        </div>
      );
    });

    return {
      checked,
    };
  },
});

export type YCheckbox = InstanceType<typeof YCheckbox>;
