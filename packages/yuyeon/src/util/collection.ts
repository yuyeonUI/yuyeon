export function getFlatChildren(
  children: any[],
  childrenKey = 'children',
): any[] {
  return children.map((child) => {
    if (child[childrenKey]) {
      return [child, ...getFlatChildren(child[childrenKey])];
    }
    return [child];
  });
}
