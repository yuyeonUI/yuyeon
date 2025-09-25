type DelayType = 'closeDelay' | 'openDelay';

export function useDelay(props: any, callback?: (active: boolean) => void) {
  const state: Partial<Record<DelayType, number>> = {};

  function clearDelay(propKey: DelayType) {
    state[propKey] && window.clearTimeout(state[propKey]);
    delete state[propKey];
  }

  function setDelay(propKey: DelayType, timeout: number, resolve: any) {
    state[propKey] = window.setTimeout(() => {
      const active = propKey === 'openDelay';
      callback?.(active);
      resolve(active);
    }, timeout);
  }

  const generateDelay = (propKey: DelayType) => () => {
    clearDelay('openDelay');
    clearDelay('closeDelay');
    const delayTime = props[propKey] ?? 0;
    return new Promise<boolean>((resolve) => {
      const delay = parseInt(String(delayTime), 10);
      setDelay(propKey, delay, resolve);
    });
  };

  return {
    startOpenDelay: generateDelay('openDelay'),
    startCloseDelay: generateDelay('closeDelay'),
  };
}
