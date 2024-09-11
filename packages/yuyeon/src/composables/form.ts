import {
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Ref,
  type VNode,
  computed,
  inject,
  provide,
  ref,
  shallowRef,
  toRef,
} from 'vue';

import { type EventProp, propsFactory } from '@/util/component';

import { useModelDuplex } from './communication';
import { type ValidationProps } from './validation';

export interface FormInput {
  id: number | string;
  vnode: VNode;
  validate: () => Promise<any[]>;
  isError: boolean | undefined | null;
  errors: any[];
}

export interface InputValidationResult {
  id: number | string;
  vnode: VNode;
  exposed: any;
  errors: any[];
}

export interface FormValidationResult {
  valid: boolean;
  errors: InputValidationResult[];
}

export interface SubmitEventPromise
  extends SubmitEvent,
    Promise<FormValidationResult> {}

export interface FormInstance {
  register: (input: {
    id: number | string;
    vnode: VNode;
    validate: () => Promise<any[]>;
    resetValidation: () => Promise<void>;
  }) => void;
  unregister: (id: number | string) => void;
  update: (
    id: number | string,
    isError: boolean | undefined | null,
    errors: any[],
  ) => void;
  inputs: Ref<FormInput[]>;
  isDisabled: ComputedRef<boolean>;
  isReadonly: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
  isValidating: Ref<boolean>;
  isValid: Ref<boolean | null>;
  validateOn: Ref<FormProps['validateOn']>;
}

export const YUYEON_FORM_KEY: InjectionKey<FormInstance> =
  Symbol.for('yuyeon.form');

export interface FormProps {
  readonly: boolean;
  disabled: boolean;
  loading: boolean;
  modelValue: boolean | null;
  'onUpdate:modelValue': EventProp<[boolean | null]> | undefined;
  validateOn: ValidationProps['validateOn'];
}

export const pressFormPropsOptions = propsFactory(
  {
    readonly: Boolean,
    disabled: Boolean,
    loading: Boolean,
    modelValue: {
      type: Boolean as PropType<boolean | null>,
      default: null,
    },
    validateOn: {
      type: String as PropType<ValidationProps['validateOn']>,
      default: 'input',
    },
  },
  'form',
);

export function createForm(props: FormProps) {
  const model = useModelDuplex(props);
  const isValidating = shallowRef(false);
  const inputs = ref<FormInput[]>([]);
  const errors = ref<InputValidationResult[]>([]);

  const isReadonly = computed(() => props.readonly);
  const isDisabled = computed(() => props.disabled);
  const isLoading = computed(() => props.loading);

  async function validate() {
    const results: InputValidationResult[] = [];
    let valid = true;

    errors.value = [];
    isValidating.value = true;

    for (const item of inputs.value) {
      const itemErrors = await item.validate();

      if (itemErrors.length > 0) {
        valid = false;

        results.push({
          id: item.id,
          vnode: item.vnode,
          exposed: item.vnode.component?.exposed,
          errors: itemErrors,
        });
      }
    }

    errors.value = results;
    isValidating.value = false;

    return { valid, errors: errors.value };
  }

  function register(input: {
    id: number | string;
    vnode: VNode;
    validate: () => Promise<any[]>;
  }) {
    const { id, validate, vnode } = input;
    inputs.value.push({
      id,
      validate,
      vnode,
      isError: null,
      errors: [],
    });
  }

  function unregister(id: number | string) {
    inputs.value = inputs.value.filter((input) => input.id !== id);
  }

  function update(
    id: number | string,
    isError: boolean | undefined | null,
    errors: any[],
  ) {
    const found = inputs.value.find((item) => item.id === id);

    if (!found) return;

    found.isError = isError;
    found.errors = errors;
  }

  const provideInstance: FormInstance = {
    inputs,
    isDisabled,
    isReadonly,
    isLoading,
    isValid: model,
    isValidating,
    register,
    unregister,
    update,
    validateOn: toRef(props, 'validateOn'),
  };

  provide(YUYEON_FORM_KEY, provideInstance);

  return {
    inputs,
    errors,
    isValid: model,
    isDisabled,
    isReadonly,
    isLoading,
    isValidating,
    validate,
  };
}

export function useForm() {
  return inject(YUYEON_FORM_KEY, null);
}
