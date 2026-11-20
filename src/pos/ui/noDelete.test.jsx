import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { db, DEFAULT_SETTINGS } from '../data/db';
import { ProductRepo, InvoiceRepo, wipeAllData } from '../data/repositories';
import Bills from './Bills';
import Settings from './Settings';

beforeEach(async () => { cleanup(); await wipeAllData(); });

describe('no way to delete a sale from the screens', () => {
  it('a bill opens with Print / Share only: no cancel, return or delete', async () => {
    const id = await ProductRepo.save({ name: 'Cable', sellPrice: 10000, costPrice: 6000, stock: 5 });
    await InvoiceRepo.createSale({ lines: [{ productId: id, name: 'Cable', qty: 1, unitPrice: 10000, costPrice: 6000, gstRate: 0 }], discount: null, payments: [{ method: 'CASH', amount: 10000 }], customer: null, settings: { ...DEFAULT_SETTINGS, roundOff: false } });
    render(<Bills settings={DEFAULT_SETTINGS} />);
    fireEvent.click(await screen.findByText('BM-00001'));
    await screen.findByText(/Print/);
    expect(screen.queryByText(/cancel/i, { selector: 'button' })).toBeNull();
    expect(screen.queryByText(/return bill/i)).toBeNull();
    expect(screen.queryByText(/delete/i, { selector: 'button' })).toBeNull();
    expect(screen.getByText(/delete ya cancel nahi/)).toBeTruthy();
  });

  it('Settings has no erase button', async () => {
    render(<Settings settings={DEFAULT_SETTINGS} />);
    await screen.findByText(/Cloud sync/);
    expect(screen.queryByText(/mitao/i)).toBeNull();
    expect(screen.queryByText(/danger zone/i)).toBeNull();
  });
});
