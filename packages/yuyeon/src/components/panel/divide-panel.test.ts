import { describe, expect, it } from 'vitest';

import { getDividerRates, getMinPanelRate } from './divide-panel';

describe('divide panel positions', () => {
  it('does not create dividers for zero or one panel', () => {
    expect(getDividerRates(50, 0)).toEqual([]);
    expect(getDividerRates(50, 1)).toEqual([]);
  });

  it('uses a numeric position for two panels', () => {
    expect(getDividerRates(35, 2)).toEqual([35]);
  });

  it('distributes multiple panels evenly when positions are omitted', () => {
    expect(getDividerRates(50, 4)).toEqual([25, 50, 75]);
    expect(getDividerRates([], 4)).toEqual([25, 50, 75]);
  });

  it('preserves supplied positions without changing the model array', () => {
    const model = [20, 70];
    Object.freeze(model);
    expect(getDividerRates(model, 3)).toEqual([20, 70]);
    expect(model).toEqual([20, 70]);
  });

  it('fills missing positions and ignores extra positions', () => {
    expect(getDividerRates([20], 4)).toEqual([20, 50, 75]);
    expect(getDividerRates([20, 70, 80], 3)).toEqual([20, 70]);
  });

  it('keeps every panel within the container with a minimum size', () => {
    expect(getDividerRates([-10, 200], 3)).toEqual([10, 90]);
    expect(getDividerRates([80, 20], 3)).toEqual([80, 90]);
    expect(getDividerRates([NaN, Infinity], 4)).toEqual([25, 50, 75]);
    expect(getDividerRates([95], 4)).toEqual([70, 80, 90]);
  });

  it('allows more than ten panels while leaving space to resize', () => {
    const rates = [0, ...getDividerRates([], 12), 100];
    const minRate = getMinPanelRate(12);
    expect(minRate).toBeLessThan(100 / 12);
    for (let index = 1; index < rates.length; index++) {
      expect(rates[index] - rates[index - 1]).toBeGreaterThan(minRate);
    }
  });
});
