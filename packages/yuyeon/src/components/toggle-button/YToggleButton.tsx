import { InjectionKey } from 'vue';

import { ChoiceProvide } from '../../composables/choice';

export const Y_TOGGLE_BUTTON_KEY: InjectionKey<ChoiceProvide> = Symbol.for(
  'yuyeon.y-toggle-button',
);
