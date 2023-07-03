import { getObjectValueByPath } from '../../util/common';

import { CandidateKey } from '../../types';
import { TreeviewFilterFn } from './types';

export function getKeys(items: any[], itemKey: string, childrenKey: string) {
  const keys: CandidateKey[] = [];
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

export function filterTreeItem(
  item: object,
  search: string,
  textKey: string,
): boolean {
  const text = getObjectValueByPath(item, textKey);

  return text.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1;
}

export function filterTreeItems(
  filter: TreeviewFilterFn,
  item: any,
  search: string,
  idKey: string,
  textKey: string,
  childrenKey: string,
  excluded: Set<CandidateKey>,
): boolean {
  const children = getObjectValueByPath(item, childrenKey);

  if (children) {
    let match = false;
    for (let i = 0; i < children.length; i++) {
      if (
        filterTreeItems(
          filter,
          children[i],
          search,
          idKey,
          textKey,
          childrenKey,
          excluded,
        )
      ) {
        match = true;
      }
    }

    if (match) {
      return true;
    } else if (filter(item, search, textKey)) {
      return true;
    }
  } else if (filter(item, search, textKey)) {
    return true;
  }

  excluded.add(getObjectValueByPath(item, idKey));

  return false;
}
