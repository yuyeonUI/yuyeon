import type { Ref } from 'vue';

export type LocaleMessages = {
    [key: string]: LocaleMessages | string;
};

export interface LocaleOptions {
    messages?: LocaleMessages;
    locale?: string;
    fallbackLocale?: string;
    adapter?: LocaleModule;
}

export interface LocaleModule {
    name: string;
    locale: Ref<string>;
    fallbackLocale: Ref<string>;
    messages: Ref<LocaleMessages>;
    t: (key: string, ...args: unknown[]) => string;
    n: (value: number) => string;
    getContext: (props: LocaleOptions) => LocaleModule
}
