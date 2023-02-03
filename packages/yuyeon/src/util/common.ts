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

export function randomCharOne(str: string) {
  if (str) {
    return str.charAt(Math.floor(Math.random() * str.length));
  }
  return '';
}

export default {
  hasOwnProperty,
  getNestedValue,
  getObjectValueByPath,
};
