import {
  computed,
  getCurrentInstance,
  onBeforeMount,
  onBeforeUnmount,
  type PropType,
  ref,
  watch,
} from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { omit } from '@/util/common';
import {
  bindClasses,
  chooseProps,
  defineComponent,
  propsFactory,
} from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

import { YCard } from '../card';
import { pressYLayerProps, YLayer } from '../layer';

import './YDrawer.scss';

import { useDrawerTransition } from '@/components/drawer/drawer-transition';
import { isTopModal, updateRelayEntry } from '@/components/layer/relay-stack';
import { pressPolyTransitionPropsOptions } from '@/composables';

export const pressYDrawerPropsOptions = propsFactory(
  {
    persistent: {
      type: Boolean as PropType<boolean>,
    },
    drawerClasses: {
      type: [Array, String, Object] as PropType<
        string[] | string | Record<string, any>
      >,
    },
    focusTrap: {
      type: [Boolean, String, Object, Array] as PropType<
        false | string | string[] | HTMLElement | HTMLElement[]
      >,
      default: true,
    },
    offset: {
      type: String as PropType<string>,
    },
    ...omit(
      pressYLayerProps({
        scrim: true,
        closeClickScrim: true,
        openOnClick: true,
        coordinateStrategy: 'arrangement' as const,
        scrollStrategy: null,
        position: 'right' as const,
      }),
      ['offset', 'classes'],
    ),
    ...pressPolyTransitionPropsOptions({
      transition: null,
    }),
  },
  'YDrawer',
);

export const YDrawer = defineComponent({
  name: 'YDrawer',
  components: {
    YLayer,
    YCard,
  },
  props: pressYDrawerPropsOptions(),
  emits: ['update:modelValue', 'afterEnter', 'afterLeave'],
  setup(props, { emit, slots }) {
    const vm = getCurrentInstance();
    const $yuyeon = vm?.appContext.config.globalProperties.$yuyeon;
    const active = useModelDuplex(props);

    const classes = computed(() => {
      const boundClasses = bindClasses(props.drawerClasses);
      return {
        ...boundClasses,
        'y-drawer': true,
      };
    });

    const styles = computed(() => {
      return {
        ...(props.contentStyles ?? {}),
        paddingTop: toStyleSizeValue(props.offset),
      };
    });

    const layer$ = ref<typeof YLayer>();

    const children = computed(() => layer$.value?.children || []);

    const relayId = computed(() => layer$.value?.relayId);

    const side = computed(() => layer$.value?.coordination?.side);

    const { transition } = useDrawerTransition(props, side);

    watch(active, (neo) => {
      neo ? installFocusTrap() : uninstallFocusTrap();
    });

    watch(relayId, (id) => {
      if (id != null) {
        updateRelayEntry(id, { maximized: () => props.maximized ?? false });
      }
    });

    onBeforeMount(() => {
      if (active.value) {
        installFocusTrap();
      }
    });

    onBeforeUnmount(() => {
      active.value = false;
      uninstallFocusTrap();
    });

    function onFocusin(e: FocusEvent) {
      if (props.focusTrap === false) return;

      if (relayId.value == null || isTopModal() !== relayId.value) return;

      const prevTarget = e.relatedTarget as HTMLElement | null;
      const target = e.target as HTMLElement | null;

      const excludeTarget = props.focusTrap;

      if (
        typeof excludeTarget === 'string' &&
        document.querySelector(excludeTarget)?.isSameNode(target)
      ) {
        return;
      }

      if (typeof excludeTarget === 'object') {
        if (Array.isArray(excludeTarget)) {
          const excluded = excludeTarget.some((exclude) => {
            if (typeof exclude === 'string') {
              return document.querySelector(exclude)?.isSameNode(target);
            }
            if (typeof exclude === 'object') {
              return exclude?.isSameNode(target);
            }
            return false;
          });
          if (excluded) {
            return;
          }
        } else if (excludeTarget?.isSameNode(target)) {
          return;
        }
      }

      function testChildrenContains(layers: any[]): boolean {
        return layers.some((layer: any) => {
          const content$ = layer?.exposeProxy?.content$;
          if (content$?.contains(target)) return true;

          const grandChildren = layer?.exposeProxy?.children ?? [];
          return testChildrenContains(grandChildren);
        });
      }

      if (prevTarget === target) {
        return;
      }
      if (!layer$.value?.content$) {
        return;
      }
      if ([document, layer$.value?.content$].includes(target)) {
        return;
      }
      if (layer$.value?.content$.contains(target)) {
        return;
      }
      if (!testChildrenContains(children.value)) {
        const focusableSelector =
          'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusables = [
          ...layer$.value.content$.querySelectorAll(focusableSelector),
        ].filter(
          (el) =>
            !el.hasAttribute('disabled') && !el.matches('[tabindex="-1"]'),
        ) as HTMLElement[];
        if (!focusables.length) return;
        const firstChild = focusables[0];
        const lastChild = focusables[focusables.length - 1];
        if (target?.isSameNode(firstChild) || target?.isSameNode(lastChild)) {
          return;
        }
        if (firstChild === lastChild) {
          lastChild.focus();
        } else {
          firstChild.focus();
        }
      }
    }

    function installFocusTrap() {
      document.addEventListener('focusin', onFocusin);
    }

    function uninstallFocusTrap() {
      document.removeEventListener('focusin', onFocusin);
    }

    function onAfterEnter() {
      emit('afterEnter');
    }

    function onAfterLeave() {
      emit('afterLeave');
    }

    useRender(() => {
      return (
        <YLayer
          ref={layer$}
          v-model={active.value}
          classes={classes.value}
          content-styles={styles.value}
          modal
          relayStack
          transition={transition.value}
          {...omit(chooseProps(props, YLayer.props), [
            'contentStyles',
            'transition',
          ])}
          onAfterEnter={onAfterEnter}
          onAfterLeave={onAfterLeave}
        >
          {{
            default: (...args: any[]) => slots.default?.(...args),
            base: (...args: any[]) => slots.base?.(...args),
          }}
        </YLayer>
      );
    });

    return {
      active,
      layer: layer$,
      classes,
      children,
      relayId,
      side,
      transition,
    };
  },
});
