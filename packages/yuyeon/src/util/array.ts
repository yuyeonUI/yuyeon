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
