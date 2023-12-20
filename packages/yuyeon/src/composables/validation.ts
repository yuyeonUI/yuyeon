import { PropType, computed, ref, watch } from 'vue';

import { getUid, propsFactory } from '../util';
import { useModelDuplex } from './communication';
import { useToggleScope } from './scope';

export const pressValidationPropsOptions = propsFactory(
  {
    readonly: Boolean as PropType<boolean>,
    disabled: Boolean as PropType<boolean>,
    status: {
      type: String as PropType<'success' | 'warning' | 'error' | undefined>,
      validator(value: string) {
        return ['success', 'warning', 'error'].includes(value);
      },
    },
    validators: Array as PropType<((v: any) => boolean | string)[] | string[]>,
    validateOn: {
      type: String as PropType<string>,
    },
    validationValue: null,
    maxErrors: {
      type: [Number, String] as PropType<number | string>,
      default: 1,
    },
  },
  'validation',
);

export function useValidation(props: any, name: string, uid = getUid()) {
  const model = useModelDuplex(props, 'modelValue');
  const validationModel = computed(() =>
    props.validationValue === undefined ? model.value : props.validationValue,
  );

  const validating = ref(false);
  const validateOn = computed(() => {
    let value = props.validateOn || 'input';
    if (value === 'lazy') value = 'input,lazy';
    const onSet = new Set(value?.split(',') ?? []);

    return {
      blur: onSet.has('blur') || onSet.has('input'),
      input: onSet.has('input'),
      lazy: onSet.has('lazy'),
      submit: onSet.has('submit'),
    };
  });

  const errorResult = ref();
  const errors = ref<any[]>([]);

  const isError = computed(() => {
    return props.status === 'error' || errors.value.length > 0;
  });

  const isSuccess = computed(() => {
    return !isError.value && props.status === 'success';
  });

  useToggleScope(
    () => validateOn.value.input,
    () => {
      watch(validationModel, () => {
        if (validationModel.value != null) {
          invokeValidators();
        } else if (props.focused) {
          const unwatch = watch(
            () => props.focused,
            (val) => {
              if (!val) invokeValidators();

              unwatch();
            },
          );
        }
      });
    },
  );

  async function invokeValidators() {
    const results: any[] = [];
    validating.value = true;

    if (Array.isArray(props.validators)) {
      for (const validator of props.validators) {
        if (results.length >= +(props.maxErrors ?? 1)) {
          break;
        }

        const handler =
          typeof validator === 'function' ? validator : () => validator;
        const result = await handler(validationModel.value);

        if (result === true) {
          continue;
        }

        if (result !== false && typeof result !== 'string') {
          console.warn('Wrong validator return type');
          continue;
        }
        results.push(result || '');
      }
    }
    validating.value = false;
    errors.value = results;
    errorResult.value = results?.[0];

    return results;
  }

  function resetError() {
    errors.value = [];
    errorResult.value = undefined;
  }

  return {
    invokeValidators,
    resetError,
    validating,
    validateOn,
    errorResult,
    errors,
    isError,
    isSuccess,
  };
}
