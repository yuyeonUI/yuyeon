interface RelayEntry {
  id: number;
  els: () => (Element | null | undefined)[]; // base$ + content$
  modal: () => boolean;
  preventCloseBubble: () => boolean;
  close: () => void;
}

let uid = 0;
const stack: RelayEntry[] = [];

export function registerRelay(entry: Omit<RelayEntry, 'id'>) {
  const id = ++uid;
  stack.push({ id, ...entry });
  return {
    id,
    unregister: () => {
      const idx = stack.findIndex((e) => e.id === id);
      if (idx > -1) stack.splice(idx, 1);
    },
  };
}

export function isTopRelay(id: number) {
  return stack.length > 0 && stack[stack.length - 1].id === id;
}

function isInside(
  target: EventTarget | null,
  els: (Element | null | undefined)[],
) {
  if (!(target instanceof Node)) return false;
  return els.some((el) => el?.contains(target));
}

/**
 * 컨텍스트메뉴 방식 outside-click 판단
 * - 클릭이 스택 i번째 레이어 영역 안 → i보다 깊은(나중에 열린) 것들만 닫음
 * - 어디에도 속하지 않음 → 전부 닫되 modal 경계에서 정지
 */
export function relayOutsideClick(e: Event) {
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

    if (entry.modal()) break; // modal 만나면 그 즉시 정지 (자신도 닫지 않음)

    entry.close();

    if (entry.preventCloseBubble()) break; // 자신은 닫되, 더 위(root쪽)로는 전파 안 함
  }
}
