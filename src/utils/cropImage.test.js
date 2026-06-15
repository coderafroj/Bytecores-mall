import { describe, it, expect } from 'vitest';
import { getRadianAngle } from './cropImage';

describe('cropImage utils', () => {
  it('converts degrees to radians correctly', () => {
    expect(getRadianAngle(0)).toBe(0);
    expect(getRadianAngle(180)).toBe(Math.PI);
    expect(getRadianAngle(360)).toBe(2 * Math.PI);
  });
});
