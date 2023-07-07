export function hasOwnProperty(object: any, property: string) {
  if (object) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }
  return false;
}

export function getNestedValue(
  obj: any,
  path: (string | number)[],
  fallback?: any,
): any {
  const last = path.length - 1;
  let traversObj = obj;

  if (last < 0) return traversObj === undefined ? fallback : traversObj;

  for (let i = 0; i < last; i += 1) {
    if (traversObj == null) {
      return fallback;
    }
    traversObj = traversObj[path[i]];
  }

  if (traversObj == null) return fallback;

  return traversObj[path[last]] === undefined
    ? fallback
    : traversObj[path[last]];
}

export function mergeDeep(
  source: Record<string, any> = {},
  overwrite: Record<string, any> = {},
  arrayFn?: (source: unknown[], overwrite: unknown[]) => unknown[],
) {
  const ret = { ...source };
  for (const key in overwrite) {
    const sourceValue = ret[key];
    const overwriteValue = overwrite[key];

    if (Array.isArray(sourceValue) && Array.isArray(overwriteValue)) {
      if (arrayFn) {
        ret[key] = arrayFn(sourceValue, overwriteValue);
        continue;
      }
    }

    if (typeof sourceValue === 'object' && typeof overwriteValue === 'object') {
      ret[key] = mergeDeep(sourceValue, overwriteValue, arrayFn);
      continue;
    }

    ret[key] = overwriteValue;
  }
  return ret;
}

export function getObjectValueByPath(
  obj: any,
  path: string,
  fallback?: any,
): any {
  // credit: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key#comment55278413_6491621
  let traversPath = path;
  if (obj == null || !traversPath || typeof traversPath !== 'string') {
    return fallback;
  }
  if (obj[traversPath] !== undefined) return obj[traversPath];
  traversPath = traversPath.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  traversPath = traversPath.replace(/^\./, ''); // strip a leading dot
  return getNestedValue(obj, traversPath.split('.'), fallback);
}

export type SelectItemKey =
  | boolean // Ignored
  | string // Lookup by key, can use dot notation for nested objects
  | (string | number)[] // Nested lookup by key, each array item is a key in the next level
  | ((item: Record<string, any>, fallback?: any) => any);

export function getPropertyFromItem(
  item: any,
  property: SelectItemKey,
  fallback?: any,
): any {
  if (property == null) return item === undefined ? fallback : item;

  if (item !== Object(item)) {
    if (typeof property !== 'function') return fallback;

    const value = property(item, fallback);

    return typeof value === 'undefined' ? fallback : value;
  }

  if (typeof property === 'string')
    return getObjectValueByPath(item, property, fallback);

  if (Array.isArray(property)) return getNestedValue(item, property, fallback);

  if (typeof property !== 'function') return fallback;

  const value = property(item, fallback);

  return typeof value === 'undefined' ? fallback : value;
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function getRangeArr(length: number, start = 0) {
  return Array.from({ length }, (v, k) => start + k);
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date && a.getTime() !== b.getTime()) {
    return false;
  }

  if (a !== Object(a) || b !== Object(b)) {
    return false;
  }
  const props = Object.keys(a);
  if (props.length !== Object.keys(b).length) {
    return false;
  }
  return props.every((p) => deepEqual(a[p], b[p]));
}

export function isObject(obj: unknown) {
  const type = typeof obj;
  return obj !== null && (type === 'object' || type === 'function');
}

export function omit<T extends object, U extends Extract<keyof T, string>>(obj: T, excludes: U[]): Omit<T, U> {
  const ret = { ...obj };
  excludes.forEach(prop => delete ret[prop]);
  return ret;
}
