import { type ExtractPropTypes, type PropType, computed } from 'vue';

import { propsFactory } from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

const dimensionPropsOptions = {
  minWidth: [Number, String] as PropType<number | string>,
  width: [Number, String] as PropType<number | string>,
  maxWidth: [Number, String] as PropType<number | string>,
  minHeight: [Number, String] as PropType<number | string>,
  height: [Number, String] as PropType<number | string>,
  maxHeight: [Number, String] as PropType<number | string>,
};

export const pressDimensionPropsOptions = propsFactory(
  dimensionPropsOptions,
  'dimension',
);

export function useDimension(
  props: ExtractPropTypes<typeof dimensionPropsOptions>,
) {
  const dimensionStyles = computed(() => ({
    minWidth: toStyleSizeValue(props.minWidth),
    width: toStyleSizeValue(props.width),
    maxWidth: toStyleSizeValue(props.maxWidth),
    minHeight: toStyleSizeValue(props.minHeight),
    height: toStyleSizeValue(props.height),
    maxHeight: toStyleSizeValue(props.maxHeight),
  }));

  return {
    dimensionStyles,
  };
}
