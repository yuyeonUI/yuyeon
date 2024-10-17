import { type InjectionKey } from 'vue';

import { type ChoiceProvide } from '@/composables/choice';

export const Y_TOGGLE_BUTTON_KEY: InjectionKey<ChoiceProvide> = Symbol.for(
  'yuyeon.y-toggle-button',
);
