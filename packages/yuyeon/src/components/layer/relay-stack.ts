interface RelayEntry {
  id: number;
  els: () => (Element | null | undefined)[];
  modal: () => boolean;
  preventCloseBubble: () => boolean;
  maximized?: () => boolean;
  close: () => void;
}

let uid = 0;
const stack: RelayEntry[] = [];
let listening = false;

function handleGlobalClick(e: Event) {
  relayOutsideClick(e);
}

function ensureListener() {
  if (listening) return;
  listening = true;
  document.addEventListener('click', handleGlobalClick, true); // capture
}

function teardownListener() {
  if (!listening) return;
  listening = false;
  document.removeEventListener('click', handleGlobalClick, true);
}

export function registerRelay(entry: Omit<RelayEntry, 'id'>) {
  const id = ++uid;
  stack.push({ id, ...entry });
  ensureListener();
  return {
    id,
    unregister: () => {
      const idx = stack.findIndex((e) => e.id === id);
      if (idx > -1) stack.splice(idx, 1);
      if (stack.length === 0) teardownListener();
    },
  };
}

export function updateRelayEntry(
  id: number,
  updates: Partial<Pick<RelayEntry, 'maximized'>>,
) {
  const entry = stack.find((e) => e.id === id);
  if (entry) Object.assign(entry, updates);
}

export function isTopModal() {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].modal()) return stack[i].id;
  }
  return null;
}

export function hasActiveModal(excludeId?: number) {
  return stack.some((e) => e.modal() && e.id !== excludeId);
}

export function hasMaximizedModal(excludeId?: number) {
  return stack.some(
    (e) => e.modal() && (e.maximized?.() ?? false) && e.id !== excludeId,
  );
}

function isInside(
  target: EventTarget | null,
  els: (Element | null | undefined)[],
) {
  if (!(target instanceof Node)) return false;
  return els.some((el) => el?.contains(target));
}

function relayOutsideClick(e: Event) {
  if (stack.length === 0) return;
  const target = e.target;

  for (let i = stack.length - 1; i >= 0; i--) {
    if (isInside(target, stack[i].els())) {
      closeAbove(i);
      return;
    }
  }

  closeAbove(-1);
}

function closeAbove(index: number) {
  for (let j = stack.length - 1; j > index; j--) {
    const entry = stack[j];
    if (entry.modal()) break;
    entry.close();
    if (entry.preventCloseBubble()) break;
  }
}
