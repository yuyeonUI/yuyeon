export function animate(el: Element, keyframes: any, options?: any) {
  if (typeof el.animate === 'undefined') return Promise.resolve();

  let animation: Animation;
  try {
    animation = el.animate(keyframes, options);
  } catch (e) {
    return Promise.resolve();
  }

  const promise = new Promise<any>((resolve) => {
    animation.onfinish = () => {
      resolve(animation)
    };
  }) as any;
  Object.assign(promise, { animation });

  return promise;
}
