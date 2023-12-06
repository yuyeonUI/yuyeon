import { constructYuyeonI18nAdapter } from '../../i18n/built-in';
import { LocaleOptions } from '../../i18n/types';

export function createLocaleModule(options?: LocaleOptions) {
  return options?.adapter && options.adapter?.name
    ? options.adapter
    : constructYuyeonI18nAdapter(options);
}
