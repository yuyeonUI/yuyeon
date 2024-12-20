import { type ExtractPropTypes, type PropType, computed } from 'vue';

import { propsFactory } from '@/util/component';

import { useModelDuplex } from './communication';

const focusPropsOptions = {
  focused: Boolean,
  'onUpdate:focused': Function as PropType<(v: boolean) => void>,
};

export const pressFocusPropsOptions = propsFactory(focusPropsOptions, 'focus');

export function useFocus(
  props: ExtractPropTypes<typeof focusPropsOptions>,
  className: string,
) {
  const focused = useModelDuplex(props, 'focused');

  function whenFocus() {
    focused.value = true;
  }

  function whenBlur() {
    focused.value = false;
  }

  const focusedClasses = computed(() => {
    return {
      [`${className}--focused`]: focused.value,
    };
  });

  return {
    focused,
    whenFocus,
    whenBlur,
    focusedClasses,
  };
}
