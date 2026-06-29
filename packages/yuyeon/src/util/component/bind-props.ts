import { isPropEventName } from './props';

const listenerMap = new WeakMap<HTMLElement, Map<string, EventListener>>();

export function bindProps(el: HTMLElement, props: Record<string, any>) {
  if (!listenerMap.has(el)) {
    listenerMap.set(el, new Map());
  }
  const listeners = listenerMap.get(el)!;

  for (const [name, value] of Object.entries(props)) {
    if (isPropEventName(name)) {
      const event = name[2].toLowerCase() + name.slice(3);

      if (listeners.has(event)) {
        el.removeEventListener(event, listeners.get(event)!);
        listeners.delete(event);
      }

      if (value) {
        el.addEventListener(event, value);
        listeners.set(event, value);
      }
    } else {
      el.setAttribute(name, value);
    }
  }
}

export function unbindProps(el: HTMLElement, props: Record<string, any>) {
  const listeners = listenerMap.get(el);

  for (const [name, value] of Object.entries(props)) {
    if (isPropEventName(name)) {
      const event = name[2].toLowerCase() + name.slice(3);

      if (listeners?.has(event)) {
        el.removeEventListener(event, listeners.get(event)!);
        listeners.delete(event);
      }
    } else {
      el.removeAttribute(name);
    }
  }

  if (listeners?.size === 0) {
    listenerMap.delete(el);
  }
}
