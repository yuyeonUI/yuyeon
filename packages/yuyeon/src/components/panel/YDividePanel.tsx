import {
  Comment,
  type CSSProperties,
  computed,
  createTextVNode,
  defineComponent,
  Fragment,
  isVNode,
  onBeforeUnmount,
  type PropType,
  ref,
  type SlotsType,
  Text,
  type VNode,
  type VNodeChild,
  watch,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';

import { getDividerRates, getMinPanelRate } from './divide-panel';

import './YDividePanel.scss';

function getPanelNodes(nodes: VNodeChild[]): VNode[] {
  return nodes.flatMap((node) => {
    if (Array.isArray(node)) return getPanelNodes(node);
    if (!isVNode(node)) {
      return node == null || typeof node === 'boolean' || !String(node).trim()
        ? []
        : [createTextVNode(String(node))];
    }
    if (node.type === Fragment && Array.isArray(node.children)) {
      return getPanelNodes(node.children);
    }
    if (
      node.type === Comment ||
      (node.type === Text && !String(node.children ?? '').trim())
    ) {
      return [];
    }
    return [node];
  });
}

export const YDividePanel = defineComponent({
  name: 'YDividePanel',
  props: {
    /** A percentage, or divider positions in percent when using multiple panels. */
    modelValue: {
      type: [Number, Array] as PropType<number | number[]>,
      default: 50,
    },
    horizontal: Boolean,
    /** Treat each child of the default slot as a separate panel. */
    multiple: Boolean,
  },
  emits: {
    'update:modelValue': (_value: number | number[]) => true,
  },
  slots: Object as SlotsType<{
    default: any;
    secondary: any;
  }>,
  setup(props, { slots }) {
    const contentRate = useModelDuplex(props);
    const panelCount = ref(1);
    const resizingIndex = ref<number | null>(null);
    const activeSecondary = computed(() => panelCount.value > 1);
    const rootRef = ref<HTMLElement>();
    let resizeFrame: number | undefined;

    const dividerRates = computed<number[]>(() => {
      if (props.multiple) {
        return getDividerRates(contentRate.value, panelCount.value);
      }
      if (!activeSecondary.value) return [];
      return [
        Array.isArray(contentRate.value)
          ? (contentRate.value[0] ?? 50)
          : contentRate.value,
      ];
    });

    const classes = computed(() => ({
      'y-divide-panel': true,
      'y-divide-panel--horizontal': props.horizontal,
      'y-divide-panel--resizing': resizingIndex.value !== null,
    }));

    function getPanelStyles(start: number, end = 100): CSSProperties {
      const leading = start === 0 ? '0' : `${start}%`;
      const trailing = end === 100 ? '0' : `${100 - end}%`;
      return {
        position: 'absolute',
        inset:
          start === 0 && end === 100
            ? '0 0'
            : props.horizontal
              ? `0 ${trailing} 0 ${leading}`
              : `${leading} 0 ${trailing} 0`,
      };
    }

    function moveListener(event: MouseEvent) {
      if (!rootRef.value || resizingIndex.value === null) return;
      const rect = rootRef.value.getBoundingClientRect();
      const offset = props.horizontal
        ? event.clientX - rect.x
        : event.clientY - rect.y;
      const size = props.horizontal ? rect.width : rect.height;
      if (size <= 0) return;

      if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = undefined;
        const index = resizingIndex.value;
        if (index === null) return;

        const rates = [...dividerRates.value];
        const minRate = getMinPanelRate(panelCount.value);
        const min = (rates[index - 1] ?? 0) + minRate;
        const max = (rates[index + 1] ?? 100) - minRate;
        const rate = Math.min(Math.max(min, (offset / size) * 100), max);
        if (rates[index] === rate) return;

        rates[index] = rate;
        contentRate.value =
          props.multiple || Array.isArray(contentRate.value) ? rates : rate;
      });
    }

    function cancelEvent() {
      resizingIndex.value = null;
      if (resizeFrame !== undefined) {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = undefined;
      }
      rootRef.value?.removeEventListener('mousemove', moveListener);
      rootRef.value?.removeEventListener('mouseup', cancelEvent);
      rootRef.value?.removeEventListener('mouseleave', cancelEvent);
    }

    function onMousedown(event: MouseEvent, index: number) {
      event.preventDefault();
      cancelEvent();
      resizingIndex.value = index;
      rootRef.value?.addEventListener('mousemove', moveListener);
      rootRef.value?.addEventListener('mouseup', cancelEvent);
      rootRef.value?.addEventListener('mouseleave', cancelEvent);
    }

    watch([panelCount, () => props.multiple], cancelEvent);
    onBeforeUnmount(cancelEvent);

    useRender(() => {
      const panels = props.multiple
        ? getPanelNodes(slots.default?.() ?? []).map((node, index) => ({
            key: node.key ?? index,
            content: node,
          }))
        : [
            { key: 'default', content: slots.default?.() },
            ...(slots.secondary
              ? [{ key: 'secondary', content: slots.secondary() }]
              : []),
          ];
      panelCount.value = panels.length;
      const rates = dividerRates.value;
      const boundaries = [0, ...rates, 100];

      return (
        <div class={classes.value} ref={rootRef}>
          {panels.map((panel, index) => (
            <div
              key={panel.key}
              class={[
                'y-divide-panel__container',
                {
                  'y-divide-panel__top-container': index === 0,
                  'y-divide-panel__secondary-container': index === 1,
                },
              ]}
              style={getPanelStyles(boundaries[index], boundaries[index + 1])}
            >
              {panel.content}
            </div>
          ))}
          {rates.map((rate, index) => (
            <div
              key={`divider-${index}`}
              class={[
                'y-divide-panel__divider',
                {
                  'y-divide-panel__divider--resizing':
                    resizingIndex.value === index,
                },
              ]}
              style={getPanelStyles(rate)}
              onMousedown={(event) => onMousedown(event, index)}
            >
              <div class="y-divide-panel__divider-line"></div>
            </div>
          ))}
        </div>
      );
    });

    return {
      activeSecondary,
      contentRate,
    };
  },
});

export type YDividePanel = InstanceType<typeof YDividePanel>;
