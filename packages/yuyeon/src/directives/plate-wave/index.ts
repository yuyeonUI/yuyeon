import type { DirectiveBinding } from 'vue';

import './plate-wave.scss';

export interface PlateWaveBinding
  extends Omit<DirectiveBinding, 'modifiers' | 'value'> {
  value?: boolean;
  modifiers: { stop?: boolean };
}

const CLASS_NAME = 'y-plate-wave__animation';

function showAnimation(el: HTMLElement | null) {
  if (!el) return;
  const animation = document.createElement('span');
  animation.className = CLASS_NAME;
  el.appendChild(animation);
  animation.dataset.activated = String(performance.now());
}

function hideAnimation(el: HTMLElement | null) {
  if (!el) {
    return;
  }
  const animations = el.getElementsByClassName(CLASS_NAME);
  if (animations.length === 0) return;
  const animation = animations[animations.length - 1] as HTMLElement;
  if (animation.dataset.isHiding) return;
  animation.dataset.isHiding = 'true';
  const diff = performance.now() - Number(animation.dataset.activated);
  const delay = Math.max(250 - diff, 0);
  setTimeout(() => {
    if (animation) {
      el.removeChild(animation);
    }
  }, delay + 300);
}

/*
 * Event
 * */

let keyboardEventFlag = false;

function spawn(event: Event) {
  showAnimation(event.currentTarget as HTMLElement);
}

function clean(event: Event) {
  hideAnimation(event.currentTarget as HTMLElement);
}

function stop(event: Event) {
  //
}

function keyboardSpawn(event: KeyboardEvent) {
  if (!keyboardEventFlag && (event.key === 'Enter' || event.key === 'Space')) {
    keyboardEventFlag = true;
    showAnimation(event.currentTarget as HTMLElement);
  }
}

function keyboardClean(event: KeyboardEvent) {
  keyboardEventFlag = false;
  hideAnimation(event.currentTarget as HTMLElement);
}

function destroyListeners(el: HTMLElement) {
  el.removeEventListener('mousedown', spawn);
  el.removeEventListener('mouseup', clean);
  el.removeEventListener('mouseleave', clean);
  el.removeEventListener('keydown', keyboardSpawn);
  el.removeEventListener('keyup', keyboardClean);
}

function attachWave(el: HTMLElement, binding: PlateWaveBinding, init = false) {
  const { value, modifiers } = binding;
  const enabled = !!value;
  if (!enabled) hideAnimation(el);

  if (enabled && init) {
    if (modifiers.stop) {
      el.addEventListener('mousedown', stop);
      return;
    }

    el.addEventListener('mousedown', spawn);
    el.addEventListener('mouseup', clean);
    el.addEventListener('mouseleave', clean);
    el.addEventListener('keydown', keyboardSpawn);
    el.addEventListener('keyup', keyboardClean);
    el.addEventListener('blur', clean);
  } else if (!enabled && !init) {
    destroyListeners(el);
  }
}

export const PlateWave = {
  mounted(el: HTMLElement, binding: PlateWaveBinding) {
    attachWave(el, binding, true);
  },
  updated(el: HTMLElement, binding: PlateWaveBinding) {
    if (binding.value === binding.oldValue) {
      return;
    }
    attachWave(el, binding);
  },
  unmount(el: HTMLElement) {
    destroyListeners(el);
  },
};

export default PlateWave;
