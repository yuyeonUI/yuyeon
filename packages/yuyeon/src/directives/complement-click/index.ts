import { DirectiveBinding } from 'vue';

import { documentRoot } from '../../util/dom';

interface ComplementClickDirectiveElementImplanted {
  onClick: EventListener;
  onMousedown: EventListener;
}

declare global {
  interface Element {
    _complementClick?: Record<
      number,
      ComplementClickDirectiveElementImplanted | undefined
    > & { lastMousedownWasOutside: boolean };
  }
}

export interface ComplementClickBindingOptions {
  handler: (mouseEvent: MouseEvent) => void;
  determine?: (event: Event) => boolean;
  include?: () => HTMLElement[];
}

export interface ComplementClickBinding extends DirectiveBinding {
  value: ((mouseEvent: MouseEvent) => void) | ComplementClickBindingOptions;
}

function defaultDetermine() {
  return true;
}

function directive(
  mouseEvent: MouseEvent,
  element: HTMLElement,
  binding: ComplementClickBinding,
) {
  const { value } = binding;
  const handler = typeof value === 'function' ? value : value.handler;
  element._complementClick!.lastMousedownWasOutside &&
    checkEvent(mouseEvent, element, binding) &&
    setTimeout(() => {
      determine(mouseEvent, binding) && handler && handler(mouseEvent);
    }, 0);
}

function checkEvent(
  mouseEvent: MouseEvent,
  element: HTMLElement,
  binding: ComplementClickBinding,
): boolean {
  if (!mouseEvent || determine(mouseEvent, binding) === false) {
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
  const elements = (
    (typeof binding.value === 'object' && binding.value.include) ||
    (() => [])
  )();
  elements.push(element);
  return !elements.some((el) => el?.contains(mouseEvent.target as Node));
}

function determine(
  event: MouseEvent,
  binding: ComplementClickBinding,
): boolean {
  const { value } = binding;
  const determineFn =
    (typeof value === 'object' && value.determine) || defaultDetermine;
  return determineFn && determineFn?.(event);
}

function implant(
  element: HTMLElement,
  callback: (app: HTMLDocument | ShadowRoot | null) => void,
) {
  const root = documentRoot(element);
  callback(document);
  if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
    callback(root);
  }
}

export const ComplementClick = {
  mounted(element: HTMLElement, binding: ComplementClickBinding) {
    const onClick = (event: Event) =>
      directive(event as MouseEvent, element, binding);
    const onMousedown = (event: Event) => {
      element._complementClick!.lastMousedownWasOutside = checkEvent(
        event as MouseEvent,
        element,
        binding,
      );
    };
    implant(element, (app) => {
      app?.addEventListener('click', onClick, true);
      app?.addEventListener('mousedown', onMousedown, true);
    });
    if (!element._complementClick) {
      element._complementClick = {
        lastMousedownWasOutside: true,
      };
    }
    const _uid = binding.instance!.$.uid;
    element._complementClick[_uid] = {
      onClick,
      onMousedown,
    };
  },
  unmounted(element: HTMLElement, binding: ComplementClickBinding) {
    if (!element._complementClick) return;
    const _uid = binding.instance!.$.uid;
    implant(element, (app) => {
      const old = element._complementClick?.[_uid];
      if (old) {
        const { onClick, onMousedown } = old;
        app?.removeEventListener('click', onClick, true);
        app?.removeEventListener('mousedown', onMousedown, true);
      }
    });
    delete element._complementClick[_uid];
  },
};
