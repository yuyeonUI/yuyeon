import { reactive, watch } from 'vue';

import { LocaleModule } from '../../i18n/types';

export function constructAdapter(options: any, locale: LocaleModule) {
  const instance = reactive(
    typeof options.adapter === 'function'
      ? new options.adapter({
          locale: options.locale[locale.locale.value] ?? locale.locale.value,
          formats: options.formats,
        })
      : options.adapter,
  );

  watch(locale.locale, (value) => {
    instance.locale = options.locale[value] ?? value ?? instance.locale;
  });

  return instance;
}
