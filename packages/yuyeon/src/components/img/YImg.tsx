import { shallowRef } from '@vue/runtime-core';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  vShow,
  watch,
  withDirectives,
} from 'vue';
import type {
  CSSProperties,
  ImgHTMLAttributes,
  PropType,
  SlotsType,
} from 'vue';

import { useRender } from '../../composables/component';
import { pressDimensionPropsOptions } from '../../composables/dimension';
import {
  PolyTransition,
  pressPolyTransitionPropsOptions,
  usePolyTransition,
} from '../../composables/transition';
import Environments from '../../util/environments';
import { propsFactory } from '../../util/vue-component';

import './YImg.scss';

export const pressYImgPropsOptions = propsFactory(
  {
    src: String as PropType<string>,
    crossorigin: String as PropType<ImgHTMLAttributes['crossorigin']>,
    referrerpolicy: String as PropType<ImgHTMLAttributes['referrerpolicy']>,
    ...pressPolyTransitionPropsOptions({
      transition: 'fade',
    }),
    objectFit: {
      type: String as PropType<
        Extract<
          CSSProperties['objectFit'],
          'contain' | 'cover' | 'fill' | 'scale-down'
        >
      >,
      default: 'contain',
    },
    eager: Boolean,
    ...pressDimensionPropsOptions(),
  },
  'YImg',
);

export type YImgStatus = 'idle' | 'loading' | 'loaded' | 'error';

export const YImg = defineComponent({
  name: 'YImg',
  props: {
    ...pressYImgPropsOptions(),
  },
  slots: Object as SlotsType<{
    placeholder: any;
  }>,
  emits: ['load', 'loaded', 'error'],
  setup(props, { slots, attrs, emit }) {
    const vm = getCurrentInstance()!;
    const image$ = ref<HTMLImageElement>();
    const status = shallowRef<YImgStatus>(props.eager ? 'loading' : 'idle');
    const imgSrc = shallowRef('');
    const naturalWidth = shallowRef<number>();
    const naturalHeight = shallowRef<number>();
    const { polyTransitionBindProps } = usePolyTransition(props);

    const srcMeta = computed(() => {
      const src = props.src;

      return {
        src,
      };
    });

    const imgClasses = computed(() => {
      return {
        'y-img--cover': props.objectFit === 'cover',
        'y-img--contain': props.objectFit === 'contain',
        'y-img--fill': props.objectFit === 'fill',
        'y-img--scale-down': props.objectFit === 'scale-down',
      };
    });

    function getImgSrc() {
      const imgEl = image$.value;
      if (imgEl) {
        imgSrc.value = imgEl.currentSrc || imgEl.src;
      }
    }

    function inspectImage(imgEl: HTMLImageElement) {
      if (imgEl.naturalWidth || imgEl.naturalHeight) {
        naturalWidth.value = imgEl.naturalWidth;
        naturalHeight.value = imgEl.naturalHeight;
      } else if (!imgEl.complete && status.value === 'loading') {
        return false;
      } else if (
        imgEl.currentSrc.endsWith('.svg') ||
        imgEl.currentSrc.startsWith('data:image/svg+xml')
      ) {
        naturalWidth.value = 1;
        naturalHeight.value = 1;
      }

      return true;
    }

    watch(
      () => props.src,
      () => {
        initIntersect();
      },
    );

    const _Placeholder = () => {
      if (!slots.placeholder) return null;
      return (
        <PolyTransition {...polyTransitionBindProps.value} appear>
          {(status.value === 'idle' || status.value === 'error') && (
            <div class="y-img__placeholder">
              {slots.placeholder?.({ status: status.value })}
            </div>
          )}
        </PolyTransition>
      );
    };

    function onLoad() {
      if (vm.isUnmounted) return;
      status.value = 'loaded';
    }

    function onError(event?: Event) {
      if (vm.isUnmounted) return;
      status.value = 'error';
      emit('error', event);
    }

    const _Image = () => {
      const Img = (
        <img
          ref={image$}
          src={srcMeta.value.src}
          crossorigin={props.crossorigin}
          referrerpolicy={props.referrerpolicy}
          draggable={(attrs as ImgHTMLAttributes).draggable}
          alt={(attrs as ImgHTMLAttributes).alt}
          class={['y-img__img', imgClasses.value]}
          onLoad={onLoad}
          onError={onError}
        />
      );

      return (
        <PolyTransition {...polyTransitionBindProps.value} appear>
          {withDirectives(Img, [[vShow, status.value === 'loaded']])}
        </PolyTransition>
      );
    };

    let requestTimer = -1;

    /**
     *
     * @param imgEl
     * @param timeout null: once
     */
    function requestInspectImage(
      imgEl: HTMLImageElement,
      timeout: number | null = 100,
    ) {
      const _request = () => {
        clearTimeout(requestTimer);
        if (vm.isUnmounted) return;
        if (!inspectImage(imgEl) && timeout != null) {
          requestTimer = window.setTimeout(_request, timeout);
        }
      };

      _request();
    }

    function initIntersect(isIntersection?: boolean) {
      if (props.eager && isIntersection) return;
      if (
        Environments.canUseIntersectionObserver &&
        !isIntersection &&
        !props.eager
      )
        return;

      status.value = 'loading';

      if (!srcMeta.value.src) return;
      nextTick(() => {
        emit('load', image$.value?.currentSrc || srcMeta.value.src);
        setTimeout(() => {
          if (vm.isUnmounted) return;
          if (image$.value?.complete) {
            if (!image$.value?.naturalWidth) {
              onError();
            }
            if (status.value === 'error') return;
            requestInspectImage(image$.value, null);
            if (status.value === 'loading') onLoad();
          } else if (image$.value) {
            requestInspectImage(image$.value);
            getImgSrc();
          }
        });
      });
    }

    onBeforeMount(() => {
      initIntersect();
    });

    onBeforeUnmount(() => {
      clearTimeout(requestTimer);
    });

    useRender(() => {
      return (
        <div class={['y-img']}>
          <_Placeholder />
          <_Image />
        </div>
      );
    });
  },
});
