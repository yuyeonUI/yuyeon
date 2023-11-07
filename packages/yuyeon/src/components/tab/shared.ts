import { InjectionKey } from 'vue';

import { ChoiceProvide } from '../../composables/choice';

export const Y_TABS_KEY: InjectionKey<ChoiceProvide> =
  Symbol.for('yuyeon.y-tabs');
