import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch } from 'vue';

import { useRender } from '../../composables/component';
import { bindClasses } from '../../util/vue-component';
import { YCard } from '../card';
import { YLayer } from '../layer';

import './YDialog.scss';
import { useModelDuplex } from "../../composables/communication";

export const YDialog = defineComponent({
  name: 'YDialog',
  components: {
    YLayer,
    YCard,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
    },
    persistent: {
      type: Boolean,
    },
    dialogClasses: {
      type: [Array, String, Object] as PropType<
        string[] | string | Record<string, any>
      >,
    },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const active = useModelDuplex(props);

    const classes = computed(() => {
      const boundClasses = bindClasses(props.dialogClasses);
      return {
        ...boundClasses,
        'y-dialog': true,
      };
    });

    const layer = ref<typeof YLayer>();

    function onFocusin(e: FocusEvent) {
      const prevTarget = e.relatedTarget as HTMLElement | null;
      const target = e.target as HTMLElement | null;
      if (
        prevTarget !== target &&
        layer.value?.content$ &&
        ![document, layer.value?.content$].includes(target) &&
        !layer.value?.content$.contains(target)
      ) {
        const focusableSelector =
          'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusables = [
          ...layer.value.content$.querySelectorAll(focusableSelector),
        ].filter(
          (el) =>
            !el.hasAttribute('disabled') && !el.matches('[tabindex="-1"]'),
        ) as HTMLElement[];
        if (!focusables.length) return;
        const firstChild = focusables[0];
        const lastChild = focusables[focusables.length - 1];
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

    function onUpdate(v: boolean) {
      active.value = v;
    }

    function onClick(e: MouseEvent) {
      const currentActive = active.value;
      if (!props.disabled) {
        active.value = !currentActive;
      }
    }

    watch(() => layer.value?.baseEl, (neo, old) => {
      if (neo) {
        neo.addEventListener('click', onClick);
      } else if (old) {
        old.removeEventListener('click', onClick);
      }
    });

    watch(
      () => active.value,
      (neo) => {
        neo ? installFocusTrap() : dismantleFocusTrap();
      },
      { immediate: true },
    );

    useRender(() => {
      return (
        <>
          <YLayer
            v-model={active.value}
            scrim
            classes={classes.value}
            persistent={props.persistent}
            ref={layer}
          >
            {{
              default: (...args: any[]) => slots.default?.(...args),
              base: slots.base
            }}
          </YLayer>
        </>
      );
    });

    return {
      active,
      layer,
      classes,
    };
  },
});
