export function getScrollParent(el?: HTMLElement, horizontal?: boolean) {
  while (el) {
    if (hasScrollbar(el, horizontal)) return el;
    el = el.parentElement!;
  }
  return document.scrollingElement as HTMLElement;
}

export function getScrollParents(
  el?: Element | null,
  stopAt?: Element | null,
  horizontal?: boolean,
) {
  const elements: HTMLElement[] = [];

  if (stopAt && el && !stopAt.contains(el)) return elements;

  while (el) {
    if (hasScrollbar(el, horizontal)) elements.push(el as HTMLElement);
    if (el === stopAt) break;
    el = el.parentElement!;
  }

  return elements;
}

export function hasScrollbar(el?: Element | null, horizontal?: boolean) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  const style = window.getComputedStyle(el);
  if (horizontal) {
    return (
      style.overflowX === 'scroll' ||
      (style.overflowX === 'auto' && el.clientWidth < el.scrollWidth)
    );
  }
  return (
    style.overflowY === 'scroll' ||
    (style.overflowY === 'auto' && el.clientHeight < el.scrollHeight)
  );
}
