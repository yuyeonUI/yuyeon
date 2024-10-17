import { type PropType, type Ref, computed } from 'vue';

import { propsFactory } from '@/util/component';

export const pressContentPropsOptions = propsFactory(
  {
    closeClickContent: {
      type: Boolean as PropType<boolean>,
    },
  },
  'YLayer.content',
);

interface ContentProps {
  closeClickContent: boolean | undefined;
}

export function useContent(props: ContentProps, active: Ref<boolean>) {
  const contentEvents = computed(() => {
    const events: Record<string, EventListener> = {};

    if (props.closeClickContent) {
      events.onClick = (e: Event) => {
        active.value = false;
      };
    }

    return events;
  });

  return {
    contentEvents,
  };
}
