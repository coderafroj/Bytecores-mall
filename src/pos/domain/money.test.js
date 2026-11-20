import { describe, expect, it } from 'vitest';

import { Money as M } from './money';
describe('negative amounts', () => {
  it('put the minus before the rupee sign', () => {
    expect(M.format(-1890000)).toBe('-₹18,900');
    expect(M.format(-99)).toBe('-₹0.99');
    expect(M.format(-1890000, { compact: true })).toBe('-₹18.9k');
    expect(M.format(1890000, { compact: true })).toBe('₹18.9k');
    expect(M.format(0)).toBe('₹0');
  });
});
