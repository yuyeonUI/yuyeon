const IS_BROWSER = typeof window !== 'undefined';
const Environments = {
  isBrowser: IS_BROWSER,
  canUseIntersectionObserver: IS_BROWSER && 'IntersectionObserver' in window,
  canUseResizeObserver: IS_BROWSER && 'ResizeObserver' in window,
};

export default Environments;
