import { localeCodesMap } from '../../i18n/config';
import { mergeDeep } from '../../util/common';
import { YuyeonDateAdapter } from '../../util/date';
import type { DateOptions } from './types';

export function configureOptions(options?: DateOptions) {
  const _options = mergeDeep(
    {
      adapter: YuyeonDateAdapter,
      locale: localeCodesMap,
    },
    options,
  );

  return _options;
}
