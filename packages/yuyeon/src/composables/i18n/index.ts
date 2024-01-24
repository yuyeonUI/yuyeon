import {inject, provide} from 'vue';

import { LocaleModule, LocaleOptions } from '../../i18n/types';
import { createLocaleModule } from './locale';
import {
  RtlModule,
  RtlOptions,
  RtlProps,
  createRtlModule,
  createRtlProvideValue,
} from './rtl';
import { YUYEON_I18N_KEY } from './share';

export function createI18nModule(options?: LocaleOptions & RtlOptions) {
  const localeModule = createLocaleModule(options);
  const rtlModule = createRtlModule(localeModule, options);

  return {
    localeModule,
    rtlModule,
  };
}

export function useI18n(): LocaleModule & RtlModule {
  const i18n = inject<any>(YUYEON_I18N_KEY);
  if (!i18n) throw new Error('Not found provided "I18nModule"');

  return i18n;
}

export function provideI18n(props: LocaleOptions & RtlProps) {
  const i18n = inject<any>(YUYEON_I18N_KEY);
  if (!i18n) throw new Error('Not found provided "I18nModule"');

  const locale = i18n.getContext(props);
  const rtl = createRtlProvideValue(locale, i18n.rtl, props);

  const state = {
    ...locale,
    ...rtl,
  };
  provide(YUYEON_I18N_KEY, state);

  return state;
}
