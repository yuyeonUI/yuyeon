import type { VNode } from 'vue';
import { Comment } from 'vue';

export function isEventsApplied(
  vnode: VNode | undefined,
  events: Record<string, any>,
) {
  if (!vnode || vnode.type === Comment) return false;
  const vnodeProps = vnode.props ?? {};

  return Object.keys(events).some((key) => {
    const applied = vnodeProps[key];
    if (!applied) return false;
    if (Array.isArray(applied)) return applied.includes(events[key]);
    return applied === events[key];
  });
}
