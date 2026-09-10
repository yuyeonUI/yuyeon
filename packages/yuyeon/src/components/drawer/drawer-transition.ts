import { computed, type Ref } from 'vue';

import { BLOCK } from '@/util/anchor';
import { includes } from '@/util/array';

import { YSlideVTransition, YSlideHTransition } from '../transitions';

export function useDrawerTransition(props: any, side: Ref<any>) {
  const transition = computed(() => {
    if (side.value) {
      const isBlockSide = includes(BLOCK, side.value);
      if (isBlockSide) {
        return {
          is: YSlideVTransition,
          duration: 300,
          side: side.value,
        };
      } else {
        return {
          is: YSlideHTransition,
          duration: 300,
          side: side.value,
        };
      }
    }
    return 'fade';
  });

  return {
    transition,
  };
}
