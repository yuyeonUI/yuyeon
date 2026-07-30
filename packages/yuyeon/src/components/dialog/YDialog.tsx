import {
  computed,
  getCurrentInstance,
  nextTick,
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

import './YDialog.scss';

import {
  hasActiveModal,
  hasMaximizedModal,
  isTopModal,
  updateRelayEntry,
} from '@/components/layer/relay-stack';

export const pressYDialogPropsOptions = propsFactory(
  {
    persistent: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    dialogClasses: {
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
    ariaLabel: String as PropType<string>,
    ariaLabelledby: String as PropType<string>,
    ...omit(
      pressYLayerProps({
        scrim: true,
        openOnClick: true,
        scrollStrategy: null,
      }),
      ['offset', 'classes'],
    ),
  },
  'YDialog',
);

export const YDialog = defineComponent({
  name: 'YDialog',
  components: {
    YLayer,
    YCard,
  },
  props: pressYDialogPropsOptions(),
  emits: ['update:modelValue', 'afterEnter', 'afterLeave'],
  setup(props, { emit, slots }) {
    const vm = getCurrentInstance();
    const $yuyeon = vm?.appContext.config.globalProperties.$yuyeon;
    const active = useModelDuplex(props);
    const layer$ = ref<typeof YLayer>();

    const classes = computed(() => {
      const boundClasses = bindClasses(props.dialogClasses);
      return {
        ...boundClasses,
        'y-dialog': true,
        'y-dialog--maximized': props.maximized,
      };
    });

    const styles = computed(() => {
      return {
        ...(props.contentStyles ?? {}),
        paddingTop: toStyleSizeValue(props.offset),
      };
    });

    const children = computed(() => layer$.value?.children || []);

    const relayId = computed(() => layer$.value?.relayId);

    let restoreFocusEl: HTMLElement | null = null;

    watch(active, (neo) => {
      if (neo) {
        restoreFocusEl = document.activeElement as HTMLElement;
        installFocusTrap();
        preventInteractionBackground(true);
        nextTick(() => {
          const content = layer$.value?.content$;
          const focusable = getFocusableElements(content)?.[0];
          (focusable ?? content)?.focus();
        });
      } else {
        uninstallFocusTrap();
        preventInteractionBackground(false);
        restoreFocusEl?.focus();
      }
    });

    watch(relayId, (id) => {
      if (id != null) {
        updateRelayEntry(id, { maximized: () => props.maximized ?? false });
      }
    });

    onBeforeMount(() => {
      if (active.value) {
        installFocusTrap();
        preventInteractionBackground(true);
      }
    });

    onBeforeUnmount(() => {
      active.value = false;
      uninstallFocusTrap();
      preventInteractionBackground(false);
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
        const focusables = getFocusableElements(layer$.value.content$);
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

    const tempScrollTop = ref(0);
    const tempScrollLeft = ref(0);

    function preventInteractionBackground(toggle: boolean) {
      const root$ = $yuyeon.root as HTMLElement;
      const myId = relayId.value ?? undefined;

      if (toggle) {
        if (props.maximized) {
          document.documentElement.classList.add('y-dialog--prevent-scroll');
        }
        // 이미 다른 modal이 scroll lock 중이면 스크롤 위치 저장 스킵
        if (!root$.classList.contains('y-dialog--virtual-scroll')) {
          tempScrollTop.value = document.documentElement.scrollTop;
          tempScrollLeft.value = document.documentElement.scrollLeft;
          root$.classList.add('y-dialog--virtual-scroll');
          root$.style.top = toStyleSizeValue(-1 * tempScrollTop.value) || '';
          root$.style.left = toStyleSizeValue(-1 * tempScrollLeft.value) || '';
        }
      } else {
        if (!hasActiveModal(myId)) {
          // 다른 modal 없음 → 전체 해제 + 스크롤 복원
          document.documentElement.classList.remove('y-dialog--prevent-scroll');
          root$.classList.remove('y-dialog--virtual-scroll');
          root$.style.top = '';
          root$.style.left = '';
          nextTick(() => {
            if (tempScrollTop.value) {
              document.documentElement.scrollTop = tempScrollTop.value;
            }
            if (tempScrollLeft.value) {
              document.documentElement.scrollLeft = tempScrollLeft.value;
            }
          });
        } else if (!hasMaximizedModal(myId)) {
          // 다른 modal은 있지만 maximized 아님 → prevent-scroll만 해제
          document.documentElement.classList.remove('y-dialog--prevent-scroll');
        }
      }
    }

    function onAfterEnter() {
      emit('afterEnter');
    }

    function onAfterLeave() {
      emit('afterLeave');
    }

    function getFocusableElements(target: Element) {
      const focusableSelector =
        'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
      return [...target.querySelectorAll(focusableSelector)].filter(
        (el) => !el.hasAttribute('disabled') && !el.matches('[tabindex="-1"]'),
      ) as HTMLElement[];
    }

    useRender(() => {
      return (
        <YLayer
          ref={layer$}
          v-model={active.value}
          classes={classes.value}
          modal
          relayStack
          role={props.persistent ? 'alertdialog' : 'dialog'}
          content-styles={styles.value}
          contentProps={{
            'aria-modal': 'true',
            ...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {}),
            ...(props.ariaLabelledby
              ? { 'aria-labelledby': props.ariaLabelledby }
              : {}),
            ...props.contentProps,
          }}
          {...omit(chooseProps(props, YLayer.props), [
            'contentStyles',
            'contentProps',
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
    };
  },
});
