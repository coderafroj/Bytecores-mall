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

## Cloud sync (Appwrite): one-time setup
Everything the counter saves (products, photos, bills, udhaar, expenses, settings) is copied to Appwrite in the background
whenever there is internet. Offline it just queues. The browser never holds an Appwrite key: it talks to `/api/pos-sync`,
which checks the Clerk login (only `ADMIN_EMAILS`) and then uses the server-side key.

1. Appwrite Console > Overview > **API keys** > create a NEW key. Scopes: `databases.read/write`, `collections.read/write`,
   `attributes.read/write`, `indexes.read/write`, `documents.read/write`, `buckets.read/write`, `files.read/write`.
2. Create everything in Appwrite with ONE command (run on your computer, inside this folder):
   ```bash
   npm install
   npm run setup:appwrite
   ```
   It reads endpoint / project / database from your `.env`, asks you to paste the new API key, then: creates the database if it
   does not exist, creates the `pos_records` collection (adds only missing fields), creates the `pos_images` bucket (if a bucket
   with that id already exists it is kept and its settings are corrected), and finishes with a live self-test.
   Safe to re-run; it never deletes data.
3. Vercel > Settings > Environment Variables: `APPWRITE_API_KEY`, `CLERK_SECRET_KEY`, `ADMIN_EMAILS`
   (the `VITE_APPWRITE_*` ones you already have are reused). Redeploy.
4. Open `/admin`, log in with the admin account, then watch the top-bar chip: **Cloud mein safe**.
   New laptop? Log in once; everything downloads automatically.

Rules: one counter device writes at a time (newest edit wins). "Is device ka data mitao" only clears this device; the cloud
copy stays. Local dev: `/api/*` needs `vercel dev` (plain `npm run dev` runs the counter without cloud sync).

### If data is not reaching Appwrite
Open `/pos/settings` > **Cloud check**: it tests internet, admin login, the sync server, the Appwrite collection and the photo
bucket one by one and says which one is broken and how to fix it. **Sab dobara upload karo** re-sends everything on this device.
- `npm run dev` now serves `/api/pos-sync` itself (reads your `.env`), so sync works locally too.
- Browser data is per address: items added on `localhost:5173` are NOT visible on your live domain (and vice versa).
  Either let `localhost` sync to the cloud (then log in on the live site: it downloads everything), or use Settings > Backup
  on one and Restore on the other.

### Start over (wipe + rebuild)
```bash
npm run reset:appwrite                         # deletes ONLY the POS collection + photo bucket, then rebuilds them
npm run reset:appwrite -- --scope=everything   # deletes EVERY database and storage bucket in the project, then rebuilds
npm run reset:appwrite -- --scope=everything --dry-run   # just list what would go
```
It lists what will be deleted (with record/file counts) and makes you type the Project ID first. No undo.
`everything` also deletes the online store's products / orders / feedback / users data; Auth users, Functions and Teams are untouched.

## Sale entries are permanent
Nobody (owner or staff) can delete or cancel a bill, payment or stock-history entry:
- no "cancel bill" / "erase data" buttons; the data layer refuses deletes of `invoices`, `payments`, `stockMoves`;
- the cloud server refuses to mark them deleted;
- "Restore backup" works only on an empty device (it could otherwise hide sales).
Deleting a *product* never touches its old bills. To fix a stock mistake, edit the stock in **Stock** (it is logged as an adjustment).
Staff safety needs PINs: **Settings > Malik PIN first, then Staff PIN**. Without a PIN every user is the owner.

## Data & speed
- Money is integer paise. GST is OFF by default (Settings). Prices are GST-inclusive when ON.
- Photos: 256px WebP/JPEG (~10 KB). Search = one O(n) pass; reports use indexed date ranges.
- **Back up weekly** (Settings -> Backup now). No cloud sync yet: one counter device = one source of truth.

## Layout
`src/pos/domain` pure logic (invoiceCalculator, analytics, money) · `src/pos/data` Dexie DB + repositories · `src/pos/ui` screens.

## Secrets (important)
- Server key lives ONLY in Vercel env vars as `APPWRITE_API_KEY` (no `VITE_` prefix: `VITE_` values are shipped to every visitor's browser).
- `npm run build` runs `scripts/check-secrets.mjs` first and stops if a key is found in any file.
- Never commit `.env`. Use `.env.example` as the template.
