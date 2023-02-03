export function documentRoot(domNode: Node): null | HTMLDocument | ShadowRoot {
  const root = domNode.getRootNode();
  if (root !== document && root.getRootNode({ composed: true }) !== document)
    return null;
  return root as HTMLDocument | ShadowRoot;
}
