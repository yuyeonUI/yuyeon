import { expect, test } from 'vitest';

import { simpleBraceParse } from './string';

test('simpleBraceParse', () => {
  const parsed = simpleBraceParse('test {0}');
  console.log(parsed);
  expect(Array.isArray(parsed)).toBe(true);

  const noVars = simpleBraceParse('test 0');
  console.log(noVars);
});
