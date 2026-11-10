# Bytecores Mall: Offline Billing Counter (POS)

Photo-first billing for a physical shop. Works with **no internet**. Data stays on the device (IndexedDB).

## Run
```bash
cp .env.example .env     # fill your own values (storefront only; the POS needs none)
npm install
npm run dev              # http://localhost:5173/pos
npm test                 # 23 tests
npm run build            # production + PWA (installable, offline)
```
Deploy: `dist/` on Vercel as before. Open `https://<your-domain>/pos`, then Install / Add to Home screen.

## Screens (`/pos/*`, code in `src/pos/ui`)
| Route | What |
|---|---|
| `/pos/bill` | Counter: photo tiles, search/scan, bill, pay (cash/UPI/card/udhaar), print/WhatsApp |
| `/pos/stock` | Add/edit products with photo, restock, CSV import/export |
| `/pos` | Owner dashboard |
| `/pos/reports` | Sales, profit, net profit, peak hours, categories, dead stock, reorder, ABC, GST |
| `/pos/bills` `/customers` `/expenses` `/settings` | Reprint/cancel, udhaar, expenses, GST switch + PIN + backup |

Admin panel -> **Billing Counter** opens it as owner.

## Roles
Settings -> set **Malik PIN** first, then **Staff PIN**. Staff sees only the counter (no cost, profit, rate edit, discount).
The admin-panel launch and the PIN are conveniences on a device you control, not server security.

## Data & speed
- Money is integer paise. GST is OFF by default (Settings). Prices are GST-inclusive when ON.
- Photos: 256px WebP/JPEG (~10 KB). Search = one O(n) pass; reports use indexed date ranges.
- **Back up weekly** (Settings -> Backup now). No cloud sync yet: one counter device = one source of truth.

## Layout
`src/pos/domain` pure logic (invoiceCalculator, analytics, money) · `src/pos/data` Dexie DB + repositories · `src/pos/ui` screens.
