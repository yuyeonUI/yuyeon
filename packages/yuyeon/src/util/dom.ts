export function documentRoot(domNode: Node): null | HTMLDocument | ShadowRoot {
  const root = domNode.getRootNode();
  if (root !== document && root.getRootNode({ composed: true }) !== document)
    return null;
  return root as HTMLDocument | ShadowRoot;
}

export function hasElementMouseEvent(
  mouseEvent: Event,
  element: HTMLElement,
  include?: HTMLElement[],
): boolean {
  if (!mouseEvent) {
    return false;
  }
  const root = documentRoot(element);
  if (
    typeof ShadowRoot !== 'undefined' &&
    root instanceof ShadowRoot &&
    root.host === mouseEvent.target
  ) {
    return false;
  }
  const elements = include ?? [];
  elements.push(element);
  return !elements.some((el) => el?.contains(mouseEvent.target as Node));
}
