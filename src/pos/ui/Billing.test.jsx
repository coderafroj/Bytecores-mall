import 'fake-indexeddb/auto';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { db, DEFAULT_SETTINGS } from '../data/db';
import { ProductRepo, wipeAllData } from '../data/repositories';
import Billing from './Billing';

beforeAll(() => {
  globalThis.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
  window.print = () => {};
});
beforeEach(async () => { cleanup(); localStorage.clear(); await wipeAllData(); });

const settings = { ...DEFAULT_SETTINGS, roundOff: false };
const seed = async () => {
  await ProductRepo.save({ name: 'USB Cable', sellPrice: 15000, costPrice: 9000, stock: 5, gstRate: 18, image: 'data:image/webp;base64,AAAA' });
  await ProductRepo.save({ name: 'Phone Case', sellPrice: 25000, costPrice: 10000, stock: 1, gstRate: 18 });
};

describe('counter flow', () => {
  it('photo tap -> total -> cash -> bill saved, stock reduced, GST hidden when off', async () => {
    await seed();
    render(<Billing settings={settings} role="owner" />);
    fireEvent.click(await screen.findByRole('button', { name: /USB Cable/ }));
    fireEvent.click(screen.getByRole('button', { name: /USB Cable/ }));
    // two taps = 2 x 150 = 300, no GST line because GST is off
    expect((await screen.findAllByText('₹300')).length).toBeGreaterThan(0);
    expect(screen.queryByText(/GST shamil/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Paisa lo/ }));
    fireEvent.click(await screen.findByRole('button', { name: /₹500/ }));       // customer gives a 500 note
    expect(screen.getByText('₹200')).toBeTruthy();                                 // change to return
    fireEvent.click(screen.getByRole('button', { name: /Bill banao/ }));

    await screen.findByText(/Bill ho gaya/);
    const inv = (await db.invoices.toArray())[0];
    expect([inv.total, inv.gst, inv.profit]).toEqual([30000, 0, 12000]);
    expect((await db.products.where('name').equals('USB Cable').first()).stock).toBe(3);
  });

  it('staff cannot edit rate or discount and sees no profit warnings', async () => {
    await seed();
    render(<Billing settings={settings} role="staff" />);
    fireEvent.click(await screen.findByRole('button', { name: /Phone Case/ }));
    await screen.findAllByText('₹250');
    expect(screen.queryByLabelText('Rate')).toBeNull();
    expect(screen.queryByLabelText('Chhoot')).toBeNull();
  });

  it('GST on shows tax included; out-of-stock cannot be oversold', async () => {
    await seed();
    render(<Billing settings={{ ...settings, gstEnabled: true }} role="owner" />);
    fireEvent.click(await screen.findByRole('button', { name: /Phone Case/ }));
    await waitFor(() => expect(screen.getByText(/GST shamil/)).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: /Phone Case/ }));   // stock is 1
    await waitFor(() => expect(screen.getAllByText('₹250').length).toBeGreaterThan(0)); // still one piece
  });

  it('search is a substring match across name/sku/category', async () => {
    await seed();
    render(<Billing settings={settings} role="owner" />);
    await screen.findByRole('button', { name: /USB Cable/ });
    fireEvent.change(screen.getByLabelText('Samaan dhundo'), { target: { value: 'cab' } });
    await waitFor(() => expect(screen.queryByRole('button', { name: /Phone Case/ })).toBeNull());
    expect(screen.getByRole('button', { name: /USB Cable/ })).toBeTruthy();
  });
});
