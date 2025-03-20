import {
  type PropType,
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch, onScopeDispose,
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
import { YLayer, pressYLayerProps } from '../layer';
import { useActiveStack } from '../layer/active-stack';

import './YDialog.scss';

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
        false | string | string[] | HTMLElement
      >,
      default: true,
    },
    offset: {
      type: String as PropType<string>,
    },
    ...omit(
      pressYLayerProps({
        scrim: true,
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
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const vm = getCurrentInstance();
    const $yuyeon = vm?.appContext.config.globalProperties.$yuyeon;
    const active = useModelDuplex(props);

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

    const layer$ = ref<typeof YLayer>();
    const { children } = useActiveStack(layer$, active, shallowRef(true));

    function onFocusin(e: FocusEvent) {
      if (props.focusTrap === false) {
        return;
      }

      const prevTarget = e.relatedTarget as HTMLElement | null;
      const target = e.target as HTMLElement | null;

      const excludeTarget = props.focusTrap;

      if (
        typeof excludeTarget === 'string' &&
        document.querySelector(excludeTarget) == target
      ) {
        return;
      }

      if (typeof excludeTarget === 'object') {
        if (Array.isArray(excludeTarget)) {
          const excluded = excludeTarget.some((exclude) => {
            if (typeof exclude === 'string') {
              return document.querySelector(exclude) == target;
            }
            if (typeof exclude === 'object') {
              return exclude == target;
            }
          });
          if (excluded) {
            return;
          }
        } else if (excludeTarget == target) {
          return;
        }
      }

      function testChildrenContains(layers: YLayer[]) {
        return layers.some((layer) => {
          return !layer.content$?.contains(target);
        });
      }

      if (
        prevTarget !== target &&
        layer$.value?.content$ &&
        ![document, layer$.value?.content$].includes(target) &&
        !layer$.value?.content$.contains(target) &&
        !testChildrenContains(children.value)
      ) {
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

    function dismantleFocusTrap() {
      document.removeEventListener('focusin', onFocusin);
    }

    const tempScrollTop = ref(0);
    const tempScrollLeft = ref(0);

    function preventInteractionBackground(toggle: boolean) {
      const root$ = $yuyeon.root as HTMLElement;
      const activeLayers = layer$.value?.getActiveLayers();
      if (toggle) {
        if (props.maximized) {
          document.documentElement.classList.add('y-dialog--prevent-scroll');
        }
        const filtered = activeLayers?.filter((layer: any) => {
          return layer.ctx.modal;
        });
        if (
          (filtered && !filtered.length) ||
          !root$.classList.contains('y-dialog--virtual-scroll')
        ) {
          const scrollTop = document.documentElement.scrollTop;
          const scrollLeft = document.documentElement.scrollLeft;
          tempScrollTop.value = scrollTop;
          tempScrollLeft.value = scrollLeft;

          root$.classList.add('y-dialog--virtual-scroll');
          root$.style.top = toStyleSizeValue(-1 * scrollTop) || '';
          root$.style.left = toStyleSizeValue(-1 * scrollLeft) || '';
        }
      } else {
        const filtered = activeLayers?.filter((layer: any) => {
          return !layer$.value?.isMe(layer) && layer.ctx.modal;
        });

        if (!filtered?.length && root$) {
          document.documentElement.classList.remove('y-dialog--prevent-scroll');
          root$.classList.remove('y-dialog--virtual-scroll');
          root$.style.top = '';
          root$.style.left = '';
          requestAnimationFrame(() => {
            document.documentElement.scrollTop = tempScrollTop.value;
            document.documentElement.scrollLeft = tempScrollLeft.value;
          });
        } else if (filtered.every((layer: any) => !layer.ctx?.maximized)) {
          document.documentElement.classList.remove('y-dialog--prevent-scroll');
        }
      }
    }

    function onUpdate(v: boolean) {
      active.value = v;
    }

    function onClick(e: MouseEvent) {
      const currentActive = active.value;
      if (!props.disabled) {
        active.value = !currentActive;
      }
    }

    watch(
      () => layer$.value?.baseEl,
      (neo, old) => {
        if (neo) {
          neo.addEventListener('click', onClick);
        } else if (old) {
          old.removeEventListener('click', onClick);
        }
      },
    );

    if (active.value) {
      installFocusTrap()
      preventInteractionBackground(true);
    }

    watch(active, (neo) => {
      neo ? installFocusTrap() : dismantleFocusTrap();
      preventInteractionBackground(neo);
    });

    onScopeDispose(() => {
      dismantleFocusTrap();
      preventInteractionBackground(false);
    })

    useRender(() => {
      return (
        <>
          <YLayer
            v-model={active.value}
            classes={classes.value}
            content-styles={styles.value}
            modal
            ref={layer$}
            {...omit(chooseProps(props, YLayer.props), ['contentStyles'])}
          >
            {{
              default: (...args: any[]) => slots.default?.(...args),
              base: slots.base,
            }}
          </YLayer>
        </>
      );
    });

    return {
      active,
      layer: layer$,
      classes,
      children,
    };
  },
});
