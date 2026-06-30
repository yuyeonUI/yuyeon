import {
  computed,
  getCurrentInstance,
  type PropType,
  ref,
  type SlotsType,
  toRef,
  unref,
  watch,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { pressPolyTransitionPropsOptions } from '@/composables/transition';
import { bindClasses, chooseProps, defineComponent } from '@/util/component';
import { hasElementMouseEvent } from '@/util/dom';
import { toKebabCase } from '@/util/string';

import { pressYLayerProps, YLayer } from '../layer';
import { useDelay } from '../layer/active-delay';
import { useActiveStack } from '../layer/active-stack';

import './YMenu.scss';

const NAME = 'YMenu';
const CLASS_NAME = toKebabCase(NAME);

export const YMenuPropOptions = {
  menuClasses: {
    type: [Array, String, Object] as PropType<
      string[] | string | Record<string, any>
    >,
  },
  preventClip: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  ...pressYLayerProps({
    openOnClick: true,
    coordinateStrategy: 'levitation' as const,
    scrollStrategy: 'reposition' as const,
  }),
};

/**
 * #  Component
 */
export const YMenu = defineComponent({
  name: NAME,
  props: {
    ...YMenuPropOptions,
    ...pressPolyTransitionPropsOptions({
      transition: 'fade',
    }),
  },
  emits: ['update:modelValue', 'afterLeave', 'hoverContent'],
  slots: Object as SlotsType<{
    default: any;
    base: any;
  }>,
  expose: ['layer$', 'baseEl'],
  setup(props, { slots, emit, expose }) {
    const vm = getCurrentInstance();
    const active = useModelDuplex(props);
    const layer$ = ref<typeof YLayer>();

    const classes = computed(() => {
      const boundClasses = bindClasses(props.menuClasses);
      return {
        ...boundClasses,
        'y-menu': true,
      };
    });

    const hovered = computed(() => !!layer$.value?.hovered);

    const parent = computed(() => layer$.value?.parent);

    const children = computed(() => layer$.value?.children || []);

    const computedContentClasses = computed<Record<string, boolean>>(() => {
      const boundClasses = bindClasses(props.contentClasses);
      return {
        ...boundClasses,
      };
    });

    const baseEl = computed(() => {
      return layer$.value?.baseEl;
    });

    watch(hovered, (value) => {
      emit('hoverContent', value);
    });

    function onComplementClick(e: Event) {
      if (active.value) {
        if (children.value.length === 0) {
          active.value = false;
        }
        const parentContent = unref(parent.value?.content$);
        const parentModal = unref(parent.value?.modal);
        if (
          !props.preventCloseBubble &&
          !(parentContent && !hasElementMouseEvent(e, parentContent)) &&
          !parentModal
        ) {
          parent.value?.clear();
        }
      }
    }

    expose({
      layer$,
      baseEl,
    });

    useRender(() => {
      return (
        <YLayer
          ref={layer$}
          transition={props.transition}
          onClick:complement={onComplementClick}
          onAfterLeave={() => emit('afterLeave')}
          {...{
            ...chooseProps(props, YLayer.props),
            classes: classes.value,
            scrim: false,
            contentClasses: {
              'y-menu__content': true,
              ...computedContentClasses.value,
            },
          }}
          v-model={active.value}
        >
          {{
            default: (slotProps: any) => {
              return <>{slots.default?.(slotProps) ?? ''}</>;
            },
            base: (...args: any[]) => slots.base?.(...args),
          }}
        </YLayer>
      );
    });

    return {
      layer$,
      baseEl,
      classes,
      children,
      parent,
      active,
      hovered,
    };
  },
});

export type YMenu = InstanceType<typeof YMenu>;
