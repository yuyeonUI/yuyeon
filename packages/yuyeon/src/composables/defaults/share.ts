import type { InjectionKey, Ref } from 'vue';

import type { DefaultsModuleInstance } from './types';

export const YUYEON_DEFAULTS_KEY: InjectionKey<Ref<DefaultsModuleInstance>> =
  Symbol.for('yuyeon.defaults');
