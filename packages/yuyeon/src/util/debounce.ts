import { isObject } from "./common";

interface DebouncedFn<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
}

interface DebounceSettings {
  leading?: boolean | undefined;
  maxWait?: number | undefined;
  trailing?: boolean | undefined;
}
interface DebounceSettingsLeading extends DebounceSettings {
  leading: true;
}

interface DebouncedFuncLeading<T extends (...args: any[]) => any>
  extends DebouncedFn<T> {
  (...args: Parameters<T>): ReturnType<T>;
  flush(): ReturnType<T>;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 0,
  options: { leading: boolean; maxWait?: number; trailing: boolean } = {
    leading: false,
    trailing: true,
  },
): DebouncedFn<T> {
  let lastArgs: any;
  let lastThis: DebouncedFn<T> | undefined;
  let maxWait: number = 0;
  let result: ReturnType<T> | undefined;
  let timerId: number | undefined = undefined;
  let lastCallTime: number | undefined = undefined;
  let lastInvokeTime: number | undefined = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;

  if (typeof func != 'function') {
    throw new TypeError('NOT Function');
  }
  wait = +wait || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? Math.max(+(options?.maxWait || 0), wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time?: number) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time?: number) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = window.setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    var timeSinceLastCall = time - (lastCallTime ?? 0),
      timeSinceLastInvoke = time - (lastInvokeTime ?? 0),
      timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? Math.min(timeWaiting, (maxWait ?? 0) - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number) {
    var timeSinceLastCall = time - (lastCallTime ?? 0),
      timeSinceLastInvoke = time - (lastInvokeTime ?? 0);

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= (maxWait ?? 0))
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = window.setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function debounced(this: DebouncedFn<T>): (ReturnType<T> | undefined) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = window.setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = window.setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
