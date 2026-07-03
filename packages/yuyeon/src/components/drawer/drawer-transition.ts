import { computed, type Ref } from 'vue';

import { BLOCK } from '@/util/anchor';
import { includes } from '@/util/array';

import { YExpandHTransition, YExpandVTransition } from '../transitions/index';

export function useDrawerTransition(props: any, side: Ref<any>) {
  const transition = computed(() => {
    if (side.value) {
      const isBlockSide = includes(BLOCK, side.value);
      if (isBlockSide) {
        return {
          is: YExpandVTransition,
          appear: true,
          duration: 300,
        };
      } else {
        return {
          is: YExpandHTransition,
          appear: true,
          duration: 300,
        };
      }
    }
    return 'fade';
  });

  return {
    transition,
  };
}
