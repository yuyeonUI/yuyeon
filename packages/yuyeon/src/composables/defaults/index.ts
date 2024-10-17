import {
  type MaybeRef,
  computed,
  getCurrentInstance,
  inject,
  provide,
  ref,
  shallowRef,
  unref,
  watchEffect,
} from 'vue';

import { clamp, mergeDeep } from '@/util/common';
import { injectSelf } from '@/util/component/inject-self';
import { propIsDefined } from '@/util/component/props';

import { YUYEON_DEFAULTS_KEY } from './share';
import {
  DefaultsModuleInstance,
  DefaultsOptions,
  ProvideDefaultsOptions,
} from './types';

function configureOptions(options?: DefaultsOptions) {
  return ref<DefaultsModuleInstance>(options);
}

export function createDefaultsModule(options?: DefaultsModuleInstance) {
  return configureOptions(options);
}

export function useDefaultsModule() {
  const defaults = inject(YUYEON_DEFAULTS_KEY);
  if (!defaults)
    throw new Error('【yuyeon】 Not found provided "DefaultsModule"');

  return defaults;
}

export function provideDefaults(
  defaults?: MaybeRef<DefaultsModuleInstance | undefined>,
  options?: ProvideDefaultsOptions,
) {
  const defaultsModule = useDefaultsModule();
  const provides = ref(defaults);

  const computedDefaults = computed<DefaultsModuleInstance>(() => {
    if (unref(options?.disabled)) return defaultsModule.value;

    const root = unref(options?.root);
    const reset = unref(options?.reset);
    const scoped = unref(options?.scoped);

    if (provides.value == null && !(scoped || reset || root))
      return defaultsModule.value;

    let revision = provides.value ?? {};
    if (!Array.isArray(revision?.revisions)) {
      revision.revisions = [];
    }
    revision.revisions.push(defaultsModule.value);
    if (scoped) return revision;
    if (reset || root) {
      const { revisions } = revision;
      const resetNum = isNaN(Number(reset))
        ? 0
        : clamp(Number(reset), 0, revisions.length);
      revision = revisions[revisions.length - resetNum];
      if (revision && typeof root === 'string' && root in revision) {
        revision = mergeDeep(revision, revision[root]);
      }

      return revision;
    }
  });

  provide(YUYEON_DEFAULTS_KEY, computedDefaults);

  return computedDefaults;
}

export function useSuperDefaults(
  props: Record<string, any> = {},
  name?: string,
  defaults = useDefaultsModule(),
) {
  const vm = getCurrentInstance()!;
  name = name || vm?.type?.name || vm?.type?.__name;
  if (!name) throw new Error('Missing component name');

  const namedDefaults = computed(() => defaults.value?.[name]);
  const _subcomponentDefaults = shallowRef();

  const _props = new Proxy(props, {
    get(target, prop) {
      const propValue = Reflect.get(target, prop);
      if (prop === 'class' || prop === 'style') {
        return [namedDefaults.value?.[prop], propValue].filter(
          (v) => v != null,
        );
      } else if (typeof prop === 'string' && !propIsDefined(vm.vnode, prop)) {
        return namedDefaults.value?.[prop] !== undefined
          ? namedDefaults.value?.[prop]
          : defaults.value?.global?.[prop] !== undefined
            ? defaults.value?.global?.[prop]
            : propValue;
      }
      return propValue;
    },
  });

  watchEffect(() => {
    if (namedDefaults.value) {
      const subComponents = Object.entries(namedDefaults.value).filter(
        ([key]) => key.startsWith(key[0].toUpperCase()),
      );
      _subcomponentDefaults.value = subComponents.length
        ? Object.fromEntries(subComponents)
        : undefined;
    } else {
      _subcomponentDefaults.value = undefined;
    }
  });

  function provideSubDefaults() {
    const injected = injectSelf(YUYEON_DEFAULTS_KEY, vm);
    provide(
      YUYEON_DEFAULTS_KEY,
      computed(() => {
        return _subcomponentDefaults.value
          ? mergeDeep(injected?.value ?? {}, _subcomponentDefaults.value)
          : injected?.value;
      }),
    );
  }

  return { props: _props, provideSubDefaults };
}

export function useDefaults(
  props: undefined,
  name: string,
): Record<string, any>;
export function useDefaults(props: Record<string, any> = {}, name?: string) {
  const { props: _props, provideSubDefaults } = useSuperDefaults(props, name);
  provideSubDefaults();

  return _props;
}
