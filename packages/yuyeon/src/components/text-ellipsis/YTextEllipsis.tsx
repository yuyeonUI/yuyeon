import { computed, ref, watch } from 'vue';

import { useRender } from '@/composables/component';
import { useResizeObserver } from '@/composables/resize-observer';
import { defineComponent } from '@/util/component';

import './YTextEllipsis.scss';

export const YTextEllipsis = defineComponent({
  name: 'YTextEllipsis',
  props: {
    text: {
      type: String,
      default: '',
    },
    position: {
      type: String,
    }
  },
  setup(props) {
    const { resizeObservedRef, contentRect } = useResizeObserver();

    const isOverflow = ref(false);

    const containerWidth = computed(() => {
      return contentRect.value?.width;
    });

    const title = computed(() => {
      return props.text;
    });

    const startText = computed(() => {
      if (isOverflow.value) {
        const length = Math.round(props.text.length * 0.5);
        return props.text.substring(0, length);
      }
      return props.text;
    });

    const endText = computed(() => {
      if (isOverflow.value) {
        const length = Math.round(props.text.length * 0.5);
        return props.text.substring(length, props.text.length);
      }
      return props.text;
    });

    watch(containerWidth, (neo) => {
      if (resizeObservedRef.value && neo != null) {
        isOverflow.value =
          resizeObservedRef.value.scrollWidth >
          resizeObservedRef.value.offsetWidth;
      }
    });

    useRender(() => {
      return (
        <span
          title={title.value}
          class={['y-text-ellipsis', { overflowed: isOverflow.value }]}
        >
          <span ref={resizeObservedRef} class="y-text-ellipsis__origin">
            {props.text}
          </span>
          {isOverflow.value && (
            <span class="y-text-ellipsis__start">{startText.value}</span>
          )}

          {isOverflow.value && (
            <span class="y-text-ellipsis__end">{endText.value}</span>
          )}
        </span>
      );
    });
  },
});

export type YTextEllipsis = InstanceType<typeof YTextEllipsis>;
