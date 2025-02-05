import { ref, shallowRef } from 'vue';
import type { Ref } from 'vue';

import { useProvided } from '@/composables/communication';
import en from '@/locales/en';
import { getObjectValueByPath } from '@/util/common';

import type { LocaleMessages, LocaleModule, LocaleOptions } from './types';

const LOCALE_PREFIX = '$yuyeon';

function replaceParams(str: string, params: unknown[]) {
  return str.replace(/\{(\d+)\}/g, (item, index) => {
    return String(params[+index]);
  });
}

function generateContext(
  locale: Ref<string>,
  fallbackLocale: Ref<string>,
  messages: Ref<LocaleMessages>,
) {
  function translate(key: string, ...params: unknown[]) {
    if (!key.startsWith(LOCALE_PREFIX)) {
      return replaceParams(key, params);
    }
    const path = key.replace(LOCALE_PREFIX, '');
    const localeMessages = locale.value && messages.value[locale.value];
    const fallbackMessages =
      fallbackLocale.value && messages.value[fallbackLocale.value];

    let msg: string = getObjectValueByPath(localeMessages, path, null);
    if (!msg) {
      msg = getObjectValueByPath(fallbackMessages, path, null);
    }
    if (!msg) {
      msg = key;
    }
    if (typeof msg !== 'string') {
      msg = key;
    }
    return replaceParams(msg, params);
  }

  function number(value: number, options?: Intl.NumberFormatOptions) {
    const numberFormat = new Intl.NumberFormat(
      [locale.value, fallbackLocale.value],
      options,
    );
    return numberFormat.format(value);
  }

  function getContext(props: LocaleOptions) {
    const localLocale = useProvided(props, 'locale', locale);
    const localFallbackLocale = useProvided(
      props,
      'fallbackLocale',
      fallbackLocale,
    );
    const localMessages = useProvided(props, 'messages', messages);
    const ctx = generateContext(
      localLocale,
      localFallbackLocale,
      localMessages,
    );
    return {
      name: 'yuyeon',
      locale,
      fallbackLocale,
      messages,
      t: ctx.translate,
      n: ctx.number,
      getContext: ctx.getContext,
    };
  }

  return {
    translate,
    number,
    getContext,
  };
}

export function constructYuyeonI18nAdapter(
  options?: LocaleOptions,
): LocaleModule {
  const locale = shallowRef(options?.locale ?? 'en');
  const fallbackLocale = shallowRef(options?.fallbackLocale ?? 'en');
  const messages = ref({
    en,
    ...options?.messages,
  });

  const ctx = generateContext(locale, fallbackLocale, messages);

  return {
    name: 'yuyeon',
    locale,
    fallbackLocale,
    messages,
    t: ctx.translate,
    n: ctx.number,
    getContext: ctx.getContext,
  };
}
