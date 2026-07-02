export function differenceBetween(inspect: any[], exclude: any[]) {
  const ret = [];
  for (const target of exclude) {
    if (!inspect.includes(target)) {
      ret.push(target);
    }
  }
  return ret;
}

export function wrapInArray(arrOrNot: any | any[]) {
  return Array.isArray(arrOrNot) ? arrOrNot : [arrOrNot];
}

export const includes = <T, A extends T>(
  array: ReadonlyArray<A>,
  item: T,
): item is A => array.includes(item as A);
