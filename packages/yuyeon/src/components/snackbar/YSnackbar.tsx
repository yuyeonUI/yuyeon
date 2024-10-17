import { animate } from 'motion';
import { type PropType, computed, ref, toRef, watch, withModifiers } from 'vue';

import { useModelDuplex } from '@/composables/communication';
import { useRender } from '@/composables/component';
import { useTimer } from '@/composables/timing';
import { omit } from '@/util/common';
import {
  bindClasses,
  chooseProps,
  defineComponent,
  propsFactory,
} from '@/util/component';

import { YLayer, pressYLayerProps } from '../layer';
import { YPlate } from '../plate';

import './YSnackbar.scss';

const defaultSnackbarTransition = {
  name: 'y-snackbar',
  onBeforeEnter: (direction: 'top' | 'bottom') => (el: HTMLElement) => {
    if (!el.getAttribute('data-transform')) {
      const cache = el.style.getPropertyValue('transform');
      el.setAttribute('data-transform', cache);
      el.style.setProperty(
        'transform',
        `${cache} translateY(${direction === 'top' ? '-' : ''}40px)`,
      );
    }
  },
  onEnter(el: HTMLElement, done: () => void) {
    const cache = el.getAttribute('data-transform');
    const motion = el.getAttribute('data-motion');
    if (motion || !cache) {
      return;
    }
    el.setAttribute('data-motion', 'true');
    animate(
      el,
      {
        transform: `${cache.replace(/translateY(.+)/, 'translateY(0)')}`,
      },
      { duration: 0.1 },
    ).finished.then(() => {
      el.removeAttribute('data-transform');
      el.removeAttribute('data-motion');
      done();
    });
  },
};

export const pressYSnackbarPropsOptions = propsFactory(
  {
    ...pressYLayerProps({
      scrollStrategy: 'none' as const,
      position: 'top center',
    }),
    modelValue: {
      type: Boolean as PropType<boolean>,
    },
    contentClasses: {
      type: [Array, String, Object] as PropType<
        string[] | string | Record<string, any>
      >,
    },
    transition: {
      type: [String, Object] as PropType<string | any>,
      default: () => ({ ...defaultSnackbarTransition }),
    },
    /**
     * @property Number
     *
     * The amount of time the snackbar should be displayed.
     * @default 4000
     */
    duration: {
      type: Number as PropType<number>,
      default: 4000,
    },
    closeClickContent: {
      type: Boolean,
      default: true,
    },
  },
  'YSnackbar',
);

export const YSnackbar = defineComponent({
  name: 'YSnackbar',
  components: { YPlate, YLayer },
  emits: ['update:modelValue', 'click'],
  props: {
    ...pressYSnackbarPropsOptions(),
  },
  setup(props, { emit, slots }) {
    const active = useModelDuplex(props);
    const hover = ref(false);
    const duration = toRef(props, 'duration');

    const classes = computed(() => {
      return {
        'y-snackbar': true,
      };
    });

    const computedContentClasses = computed<Record<string, boolean>>(() => {
      const boundClasses = bindClasses(props.contentClasses);
      return {
        ...boundClasses,
        'y-snackbar__display': true,
      };
    });

    const computedInset = computed(() => {
      const [first, second] = props.position?.split(' ');
      let y = 'top';
      let x = 'left';
      if (second) {
        x = second;
        y = first;
      } else if (first === 'bottom') {
        y = 'bottom';
      } else {
        x = first;
      }
      const ret = {
        [x === 'center' ? 'left' : x]: x === 'center' ? `50%` : 0,
        [y]: 0,
      } as any;
      if (x === 'center') {
        ret.transform = 'translateX(-50%)';
      }
      return ret;
    });

    function dismiss() {
      active.value = false;
    }

    const { start, stop, reset } = useTimer(dismiss, duration);
    function setTimer() {
      if (props.duration > 0) {
        start();
      }
    }

    watch(hover, (neo: boolean) => {
      if (neo) {
        stop();
      } else {
        setTimer();
      }
    });

    watch(
      () => props.duration,
      (neo) => {
        if (!isNaN(neo) && active.value) {
          reset();
          if (!hover.value) {
            setTimer();
          }
        }
      },
    );

    watch(
      active,
      (neo: boolean) => {
        if (neo) {
          setTimer();
        } else {
          reset();
        }
      },
      { immediate: true },
    );

    function onClickContent(event: Event) {
      emit('click', event);
      if (props.closeClickContent) {
        active.value = false;
      }
    }

    const proxyTransition = computed(() => {
      const { transition, position } = props;
      if (transition?.name === 'y-snackbar') {
        transition.onBeforeEnter = defaultSnackbarTransition.onBeforeEnter(
          position.includes('top') ? 'top' : 'bottom',
        );
        return { ...transition };
      }
      return props.transition;
    });

    useRender(() => {
      return (
        <YLayer
          ref="layer"
          {...omit(chooseProps(props, YLayer.props), [
            'scrim',
            'transition',
            'content-classes',
            'classes',
          ])}
          modelValue={active.value}
          onUpdate:modelValue={(v) => (active.value = v)}
          classes={classes.value}
          content-classes={computedContentClasses.value}
          scrim={false}
          content-styles={computedInset.value}
          transition={proxyTransition.value as any}
        >
          {{
            default: () => (
              <>
                <YPlate></YPlate>
                <div
                  class="y-snackbar__content"
                  onClick={withModifiers(onClickContent, ['exact'])}
                  onMouseenter={() => (hover.value = true)}
                  onMouseleave={() => (hover.value = false)}
                >
                  {slots.default?.()}
                </div>
              </>
            ),
          }}
        </YLayer>
      );
    });

    return {
      active,
      hover,
      classes,
      computedContentClasses,
      computedInset,
      proxyTransition,
      onClickContent,
    };
  },
});

export type YSnackbar = InstanceType<typeof YSnackbar>;
