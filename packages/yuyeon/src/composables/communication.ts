import { computed, getCurrentInstance, ref, toRaw, watch } from 'vue';

import { hasOwnProperty } from '../util/common';
import { kebabToCamel, toKebabCase } from '../util/string';
import { useToggleScope } from './scope';

export function useModelDuplex(
  props: any,
  prop: string = 'modelValue',
  defaultValue?: any,
  getIn: (value?: any) => any = (v: any) => v,
  setOut: (value: any) => any = (v: any) => v,
) {
  const vm = getCurrentInstance()!;
  const kebabProp = toKebabCase(prop);
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
      return getIn(isDefinedProp.value ? getProp() : txValue.value);
    },
    set(value) {
      const neo = setOut(value);
      const current = toRaw(isDefinedProp.value ? getProp() : txValue.value);
      if (current === neo || setOut(current) === value) {
        return;
      }
      txValue.value = neo;
      vm?.emit(`update:${property}`, neo);
    },
  });

  Object.defineProperty(model, 'rxValue', {
    get: () => (isDefinedProp.value ? getProp() : txValue.value),
  });

  return model;
}
