import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Root cause of the "page is wider than the phone" bug: a grid track written as `1fr` (= minmax(auto, 1fr))
// grows to fit its widest child (chips row, product photos), so the whole page overflows and phones zoom out.
const css = readFileSync(join(process.cwd(), 'src/pos/ui/pos.css'), 'utf8');

describe('pos.css layout guards', () => {
  it('never uses a bare 1fr track in repeat()', () => {
    expect(css).not.toMatch(/repeat\(\s*\d+\s*,\s*1fr\s*\)/);
  });
  it('the bill layout columns can shrink', () => {
    expect(css).toMatch(/\.bill-wrap\s*\{[^}]*minmax\(0,\s*1fr\)/);
    expect(css).not.toMatch(/\.bill-wrap\s*\{[^}]*grid-template-columns:\s*1fr\b/);
  });
  it('removes the default body margin and paints the page', () => {
    expect(css).toMatch(/html:has\(\.pos\)[^{]*body[^{]*\{[^}]*margin:\s*0/);
  });
  it('product tiles auto-fit instead of fixed breakpoint columns', () => {
    expect(css).toMatch(/\.ptiles\s*\{[^}]*repeat\(auto-fill,\s*minmax\(150px/);
  });
});
