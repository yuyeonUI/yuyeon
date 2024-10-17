import { type PropType, computed } from 'vue';

import { useRender } from '@/composables/component';
import { getObjectValueByPath } from '@/util/common';
import { defineComponent } from '@/util/component';
import { simpleBraceParse } from '@/util/string';

export const YTi = defineComponent({
  name: 'YTi',
  props: {
    text: String,
    item: Object,
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'span',
    },
  },
  setup(props, { slots }) {
    const parsed = computed(() => {
      return simpleBraceParse(props.text ?? '');
    });

    function getValue(key: string) {
      return getObjectValueByPath(props.item, key);
    }

    useRender(() => {
      const ElTag = props.tag as keyof HTMLElementTagNameMap;
      return (
        <ElTag>
          {slots.default
            ? slots.default?.({ nodes: parsed.value })
            : parsed.value.map((frag) => {
                if (frag.type === 'text') {
                  return frag.content;
                }
                if (frag.type === 'variable') {
                  return slots?.[frag.content]
                    ? slots[frag.content]?.({
                        key: frag.content,
                        value: getValue(frag.content),
                      })
                    : getValue(frag.content);
                }
              })}
        </ElTag>
      );
    });
  },
});

export type YTi = InstanceType<typeof YTi>;
