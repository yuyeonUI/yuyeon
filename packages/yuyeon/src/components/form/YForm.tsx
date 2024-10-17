import { ref, withKeys } from 'vue';

import { useRender } from '@/composables/component';
import {
  SubmitEventPromise,
  createForm,
  pressFormPropsOptions,
} from '@/composables/form';
import { defineComponent } from '@/util/component';

const NAME = 'y-form';

export const YForm = defineComponent({
  name: 'YForm',
  props: {
    ...pressFormPropsOptions(),
  },
  emits: {
    'update:modelValue': (val: boolean | null) => true,
    submit: (e: SubmitEventPromise) => true,
    'keydown.enter': (e: Event) => true,
  },
  setup(props, { emit, slots, expose }) {
    const form = createForm(props);
    const form$ = ref<HTMLFormElement>();
    // TODO: naming formData from form composition
    const formData = ref();

    function onSubmit(_e: Event) {
      const e = _e as SubmitEventPromise;

      const validation = form.validate();
      e.then = validation.then.bind(validation);
      e.catch = validation.catch.bind(validation);
      e.finally = validation.finally.bind(validation);

      emit('submit', e);

      if (!e.defaultPrevented) {
        validation.then(({ valid }) => {
          if (valid) {
            form$.value?.submit();
          }
        });
      }
      e.preventDefault();
    }

    function onKeydown(e: Event) {
      e.preventDefault();
      e.stopImmediatePropagation();
      emit('keydown.enter', e);
    }

    expose({
      ...form,
    });

    useRender(() => {
      return (
        <form
          ref={form$}
          class={[NAME]}
          novalidate
          onSubmit={onSubmit}
          onKeydown={withKeys(onKeydown, ['enter'])}
        >
          {slots.default?.()}
        </form>
      );
    });
  },
});

export type YForm = InstanceType<typeof YForm>;
