import { inject } from '@vue/runtime-core';

import { LocaleModule } from '../../i18n/types';
import { useI18n } from '../i18n';
import { constructAdapter } from './factory';
import { configureOptions } from './setting';
import {DateInstance, DateOptions} from './types';

export const YUYEON_DATE_KEY = Symbol.for('yuyeon.date');
export const YUYEON_DATE_OPTIONS_KEY = Symbol.for('yuyeon.date-options');

export function createDateModule(options: DateOptions, locale: LocaleModule) {
  const _options = configureOptions(options);
  return {
    options: _options,
    instance: constructAdapter(_options, locale),
  };
}

export function useDate(): DateInstance {
  const options = inject<any>(YUYEON_DATE_OPTIONS_KEY);
  if (!options) throw new Error('Not found provided "DateModule" for options');

  const i18n = useI18n();

  return constructAdapter(options, i18n);
}
