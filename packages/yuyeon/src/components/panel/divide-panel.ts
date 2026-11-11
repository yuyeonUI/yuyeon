export function getMinPanelRate(panelCount: number) {
  // Leave room to resize even when there are more than five panels.
  return Math.min(10, 50 / Math.max(1, panelCount));
}

export function getDividerRates(
  contentRate: number | number[],
  panelCount: number,
): number[] {
  const count = Math.max(0, panelCount - 1);
  const minRate = getMinPanelRate(panelCount);
  const values = Array.isArray(contentRate)
    ? contentRate
    : panelCount === 2
      ? [contentRate]
      : [];
  let previous = 0;

  return Array.from({ length: count }, (_, index) => {
    const value = Number.isFinite(values[index])
      ? values[index]
      : ((index + 1) / panelCount) * 100;
    const min = previous + minRate;
    const max = 100 - (count - index) * minRate;
    previous = Math.min(Math.max(min, value), max);
    return previous;
  });
}
