import { type MaybeRef } from 'vue';

export type DefaultsModuleInstance = undefined | {
  [key: string]: any;
}

export type DefaultsOptions = Partial<DefaultsModuleInstance>;

export type ProvideDefaultsOptions = {
  disabled?: MaybeRef<boolean | undefined>
  reset?: MaybeRef<number | string | undefined>
  root?: MaybeRef<boolean | string | undefined>
  scoped?: MaybeRef<boolean | undefined>
}
