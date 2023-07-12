import { defineComponent, ref, shallowRef } from 'vue';

import { useRender } from '../../composables/component';
import { pressThemePropsOptions, useLocalTheme } from '../../composables/theme';
import { propsFactory } from '../../util/vue-component';

import './YList.scss';

export const pressYListPropsOptions = propsFactory(
  {
    disabled: Boolean,
    ...pressThemePropsOptions(),
  },
  'YList',
);

export const YList = defineComponent({
  name: 'YList',
  props: {
    ...pressYListPropsOptions(),
  },
  setup(props, { slots }) {
    const el$ = ref<HTMLElement>();

    const { themeClasses } = useLocalTheme(props);

    const focused = shallowRef(false);

    function onFocus(event: FocusEvent) {
      if (!focused.value && !(event.relatedTarget && el$.value?.contains(event.relatedTarget as Node))) {
        focus();
      }
    }

    function onFocusIn(event: FocusEvent) {
      focused.value = true;
    }

    function onFocusOut(event: FocusEvent) {
      focused.value = false;
    }

    function onKeydown(event: KeyboardEvent) {
      //
    }

    function focus(target?: string) {
      //
    }

    useRender(() => (
      <>
        <div
          ref={el$}
          class={['y-list', themeClasses.value]}
          role="listbox"
          tabindex={props.disabled || focused.value ? -1 : 0}
          onFocus={onFocus}
          onFocusin={onFocusIn}
          onFocusout={onFocusOut}
          onKeydown={onKeydown}
        >
          {slots.default?.()}
        </div>
      </>
    ));
  },
});

export type YList = InstanceType<typeof YList>;
