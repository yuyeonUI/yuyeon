import type { CSSProperties, PropType, Ref } from 'vue';
import { onScopeDispose, ref, watch } from 'vue';

import { Rect } from '../../util/rect';
import { propsFactory } from '../../util/vue-component';
import { useToggleScope } from '../scope';
import { applyArrangement } from './arrangement';
import { applyLevitation } from './levitation';

import { CoordinateState } from './types';

const coordinateStrategies = {
  levitation: applyLevitation,
  arrangement: applyArrangement,
};

export type CoordinateStrategyFn = (
  props: any,
  state: CoordinateState,
  coordinate: Ref<Rect | undefined>,
  coordinateStyles: Ref<CSSProperties>,
) => undefined | { updateCoordinate: (e: Event) => void };

export const pressCoordinateProps = propsFactory(
  {
    coordinateStrategy: {
      type: [String, Function] as PropType<keyof typeof coordinateStrategies | CoordinateStrategyFn>,
      default: 'arrangement',
    },
    position: {
      type: String as PropType<
        'default' | 'top' | 'end' | 'right' | 'bottom' | 'left' | 'start'
      >,
      default: 'default',
    },
    align: {
      type: String as PropType<'start' | 'center' | 'end'>,
      default: 'start',
    },
    origin: {
      type: String,
      default: 'auto'
    },
    offset: {
      type: [Number, String, Array] as PropType<number | string | string[]>,
    },
    viewportMargin: {
      type: Number,
      default: 16,
    }
  },
  'Coordinate',
);

export function useCoordinate(props: any, state: CoordinateState) {
  const updateCoordinate = ref<(e: Event) => void>();
  const coordinate = ref<Rect | undefined>();
  const coordinateStyles = ref<CSSProperties>({});

  useToggleScope(
    () => !!(state.active.value && props.coordinateStrategy),
    (reset) => {
      watch(() => props.coordinateStrategy, reset);
      onScopeDispose(() => {
        updateCoordinate.value = undefined;
      });

      if (typeof props.coordinateStrategy === 'function') {
        updateCoordinate.value = props.coordinateStrategy(
          props,
          state,
          coordinate,
          coordinateStyles,
        )?.updateCoordinate;
      } else {
        const strategy =
          coordinateStrategies[
            props.coordinateStrategy as keyof typeof coordinateStrategies
          ];
        updateCoordinate.value = strategy?.(
          props,
          state,
          coordinate,
          coordinateStyles,
        )?.updateCoordinate;
      }
    },
  );

  window.addEventListener('resize', onResize, { passive: true });

  onScopeDispose(() => {
    window.removeEventListener('resize', onResize);
    updateCoordinate.value = undefined;
  });

  function onResize(e: Event) {
    updateCoordinate.value?.(e);
  }

  return {
    coordinate,
    coordinateStyles,
    updateCoordinate,
  };
}
