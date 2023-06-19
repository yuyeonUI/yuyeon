import { getObjectValueByPath } from '../../util/common';

import { NodeKey } from './types';

export function getKeys(items: any[], itemKey: string, childrenKey: string) {
  const keys: NodeKey[] = [];
  for (const item of items) {
    const key = getObjectValueByPath(item, itemKey);
    keys.push(key);
    const children = getObjectValueByPath(item, childrenKey);
    if (Array.isArray(children)) {
      keys.push(...getKeys(children, itemKey, childrenKey));
    }
  }
  return keys;
}
