import { computed, getCurrentInstance, ref, watch } from 'vue';

import { hasOwnProperty } from '../util/common';
import { camelToKebab, kebabToCamel } from '../util/string';
import { useToggleScope } from './scope';

export function useModelDuplex(
  props: any,
  prop: string = 'modelValue',
  defaultValue?: any,
) {
  const vm = getCurrentInstance()!;
  const kebabProp = camelToKebab(prop);
  const property = kebabProp === prop ? kebabToCamel(prop) : prop;
  const txValue = ref(
    props[property] !== undefined ? props[property] : defaultValue,
  );

  function getProp() {
    return props[property];
  }

  const isDefinedProp = computed(() => {
    getProp();
    const registeredProps = vm.vnode.props;
    return (
      (hasOwnProperty(registeredProps, kebabProp) ||
        hasOwnProperty(registeredProps, property)) &&
      (hasOwnProperty(registeredProps, `onUpdate:${kebabProp}`) ||
        hasOwnProperty(registeredProps, `onUpdate:${property}`))
    );
  });

  useToggleScope(
    () => !isDefinedProp.value,
    () => {
      watch(
        () => getProp(),
        (value) => {
          txValue.value = value;
        },
      );
    },
  );

  const model = computed({
    get(): any {
      return isDefinedProp.value ? getProp() : txValue.value;
    },
    set(value) {
      const neo = value;
      txValue.value = neo;
      vm?.emit(`update:${property}`, neo);
    },
  });

  Object.defineProperty(model, 'rxValue', {
    get: () => isDefinedProp.value ? getProp() : txValue.value,
  })

  return model;
}
