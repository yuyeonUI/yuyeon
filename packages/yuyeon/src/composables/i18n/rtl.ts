import { computed, inject, ref } from 'vue';
import type { Ref } from 'vue';

import { defaultRtl } from '../../i18n/config';
import { LocaleModule } from '../../i18n/types';
import { YUYEON_I18N_KEY } from './share';

export const YUYEON_RTL_KEY = Symbol.for('yuyeon.rtl');

export interface RtlOptions {
  rtlOptions: Record<string, boolean>;
}

export interface RtlProps {
  rtl?: boolean;
}

export interface RtlModule {
  rtl: Ref<boolean>;
  rtlOptions: Ref<Record<string, boolean>>;
  rtlClasses: Ref<string>;
}

export function createRtlModule(
  localeModule: LocaleModule,
  options?: RtlOptions,
): RtlModule {
  const rtlOptions = ref<Record<string, boolean>>(
    options?.rtlOptions ?? defaultRtl,
  );
  const rtl = computed(() => {
    return rtlOptions.value[localeModule.locale.value] ?? false;
  });
  const rtlClasses = computed(() => `y-i18n--${rtl.value ? 'rtl' : 'ltr'}`);

  return {
    rtlOptions,
    rtl,
    rtlClasses,
  };
}

export function createRtlProvideValue(
  localeModule: LocaleModule,
  rtlOptions: RtlModule['rtlOptions'],
  props: RtlProps,
): RtlModule {
  const rtl = computed(
    () => props.rtl ?? rtlOptions.value[localeModule.locale.value] ?? false,
  );
  const rtlClasses = computed(() => `y-i18n--${rtl.value ? 'rtl' : 'ltr'}`);

  return {
    rtl,
    rtlOptions,
    rtlClasses,
  };
}

export function useRtl() {
  const i18n = inject<any>(YUYEON_I18N_KEY);
  if (!i18n) throw new Error('Not found provided "I18nModule" for rtl');
  return {
    rtl: i18n.rtl,
    rtlClasses: i18n.rtlClasses,
  };
}
