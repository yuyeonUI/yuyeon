import { computed, type Ref } from 'vue';

import {
  YExpandHTransition,
  YExpandVTransition,
} from '@/components/transitions';
import { BLOCK } from '@/util/anchor';
import { includes } from '@/util/array';

export function useDrawerTransition(props: any, side: Ref<any>) {
  const transition = computed(() => {
    if (side.value) {
      const isBlockSide = includes(BLOCK, side.value);
      if (isBlockSide) {
        return {
          is: YExpandVTransition,
        };
      } else {
        return {
          is: YExpandHTransition,
        };
      }
    }
    return 'fade';
  });

  return {
    transition,
  };
}
