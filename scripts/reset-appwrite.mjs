// DANGER: deletes Appwrite data, then rebuilds the shop-sync backend from scratch.
//
//   npm run reset:appwrite                      -> POS only: deletes the pos_records collection and pos_images bucket
//   npm run reset:appwrite -- --scope=everything -> deletes EVERY database and EVERY storage bucket in the project
//   add --dry-run to only see what would be deleted
//
// "everything" does NOT touch Auth users, Functions, Teams or Messaging. It does delete your online-store
// products / orders / feedback / users collections and all their documents and files. There is no undo.
import { readFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1];
const flag = (n) => process.argv.includes(`--${n}`);
const env = (...names) => names.map((n) => process.env[n]).find(Boolean) || '';

const SCOPE = arg('scope') || 'pos';
const EP = env('APPWRITE_ENDPOINT', 'VITE_APPWRITE_ENDPOINT');
const PROJECT = env('APPWRITE_PROJECT_ID', 'VITE_APPWRITE_PROJECT_ID');
const DB = env('APPWRITE_DATABASE_ID', 'VITE_APPWRITE_DATABASE_ID') || 'bytecores_mall';
const COL = env('APPWRITE_POS_COLLECTION_ID') || 'pos_records';
const BUCKET = env('APPWRITE_POS_BUCKET_ID', 'VITE_APPWRITE_POS_BUCKET_ID') || 'pos_images';
let KEY = env('APPWRITE_API_KEY');


function explain401(r, ctx) {
  const msg = r.json?.message || '(Appwrite ne message nahi diya)';
  const lines = [`Appwrite ka jawab: ${r.status} ${r.json?.type || ''}`, `  "${msg}"`, '',
    `Endpoint : ${ctx.base}`, `Project  : ${ctx.project}`, `Key      : ${ctx.key.length} akshar (normal key 265 ki hoti hai, "standard_" se shuru)`, ''];
  if (/scope/i.test(msg)) lines.push('=> Key mein upar likha permission (scope) nahi hai. Appwrite > Overview > Integrations > API keys > apni key > Scopes mein wo tick karo.');
  else if (ctx.key.length !== 265) lines.push('=> Key poori paste nahi hui. Is tareeke se do (key screen par nahi dikhegi):\n     read -rs APPWRITE_API_KEY && export APPWRITE_API_KEY\n   phir wahi npm command dobara chalao.');
  else if (/project/i.test(msg)) lines.push('=> Project ID ya endpoint galat hai. Appwrite > Settings mein "Project ID" aur "API Endpoint" dekho aur .env se milao.');
  else lines.push('=> Ya key kisi aur project ki hai, ya delete/expire ho chuki hai, ya Project ID / endpoint galat hai.');
  return lines.join('\n');
}

const fail = (m) => { console.error('\n✗ ' + m + '\n'); process.exit(1); };
if (!['pos', 'everything'].includes(SCOPE)) fail('--scope sirf "pos" ya "everything" ho sakta hai.');
if (!EP || !PROJECT) fail('Endpoint / Project ID nahi mile (.env mein VITE_APPWRITE_ENDPOINT aur VITE_APPWRITE_PROJECT_ID).');
// a fresh prompt per question (created only when needed, so piped input is not consumed early)
const ask = async (text) => { const rl = createInterface({ input: process.stdin, output: process.stdout }); try { return (await rl.question(text)).trim(); } finally { rl.close(); } };
if (!KEY) KEY = await ask('Appwrite API key paste karo: ');
if (!KEY) fail('API key chahiye.');

const base = EP.replace(/\/$/, '');
KEY = KEY.replace(/\s+/g, '');   // a pasted key can pick up spaces / line breaks
async function call(method, path) {
  let res;
  try { res = await fetch(base + path, { method, headers: { 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY } }); }
  catch (e) { fail(`Appwrite tak pahunch nahi paaye: ${e.message}`); }
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
  return { ok: res.ok, status: res.status, json };
}
const q = (o) => 'queries[]=' + encodeURIComponent(JSON.stringify(o));
const total = async (path) => (await call('GET', `${path}${path.includes('?') ? '&' : '?'}${q({ method: 'limit', values: [1] })}`)).json.total ?? '?';

async function listAll(path, key) {
  const out = []; let cursor;
  for (;;) {
    const qs = [q({ method: 'limit', values: [100] }), cursor ? q({ method: 'cursorAfter', values: [cursor] }) : ''].filter(Boolean).join('&');
    const r = await call('GET', `${path}?${qs}`);
    if (r.status === 401) fail(explain401(r, { base, project: PROJECT, key: KEY }));
    if (!r.ok) fail(`List fail (${path}): ${r.status}`);
    const items = r.json[key] || [];
    out.push(...items);
    if (items.length < 100) return out;
    cursor = items[items.length - 1].$id;
  }
}

/* ---------- 1. work out exactly what would be deleted ---------- */
const plan = { dbs: [], collections: [], buckets: [] };
if (SCOPE === 'everything') {
  for (const d of await listAll('/databases', 'databases')) {
    const cols = await listAll(`/databases/${d.$id}/collections`, 'collections');
    const detail = [];
    for (const c of cols) detail.push(`${c.name || c.$id} (${await total(`/databases/${d.$id}/collections/${c.$id}/documents`)} records)`);
    plan.dbs.push({ id: d.$id, name: d.name, detail });
  }
  for (const b of await listAll('/storage/buckets', 'buckets')) plan.buckets.push({ id: b.$id, name: b.name, files: await total(`/storage/buckets/${b.$id}/files`) });
} else {
  if ((await call('GET', `/databases/${DB}/collections/${COL}`)).ok) plan.collections.push({ id: COL, n: await total(`/databases/${DB}/collections/${COL}/documents`) });
  if ((await call('GET', `/storage/buckets/${BUCKET}`)).ok) plan.buckets.push({ id: BUCKET, files: await total(`/storage/buckets/${BUCKET}/files`) });
}

console.log(`\nProject: ${PROJECT}   Scope: ${SCOPE.toUpperCase()}\n\nYe sab DELETE hoga:`);
for (const d of plan.dbs) console.log(`  DATABASE ${d.id} "${d.name}"${d.detail.length ? '\n      ' + d.detail.join('\n      ') : '  (khaali)'}`);
for (const c of plan.collections) console.log(`  COLLECTION ${COL} in ${DB}  (${c.n} records)`);
for (const b of plan.buckets) console.log(`  BUCKET ${b.id}${b.name ? ` "${b.name}"` : ''}  (${b.files} files)`);
const nothing = !plan.dbs.length && !plan.collections.length && !plan.buckets.length;
if (nothing) console.log('  (kuch bhi nahi mila, seedha naya bana denge)');
if (SCOPE === 'everything') console.log('\n! Online store ke products / orders / feedback / users ka data bhi isme hai. Auth users, Functions, Teams ko haath nahi lagega.');
console.log('! Undo nahi hota.\n');

if (flag('dry-run')) { console.log('Dry run: kuch delete nahi kiya.'); process.exit(0); }

/* ---------- 2. explicit confirmation ---------- */
if (!nothing) {
  const typed = arg('confirm') ?? (await ask(`Pakka? Confirm karne ke liye Project ID type karo (${PROJECT}): `));
  if (typed !== PROJECT) fail('Project ID match nahi hua. Kuch delete nahi kiya.');
}

/* ---------- 3. delete ---------- */
const del = async (label, path) => { const r = await call('DELETE', path); if (!r.ok && r.status !== 404) fail(`${label} delete fail: ${r.status}`); console.log(`  - ${label} delete`); };
for (const d of plan.dbs) await del(`database ${d.id}`, `/databases/${d.id}`);
for (const c of plan.collections) await del(`collection ${c.id}`, `/databases/${DB}/collections/${c.id}`);
for (const b of plan.buckets) await del(`bucket ${b.id}`, `/storage/buckets/${b.id}`);
if (!nothing) await new Promise((r) => setTimeout(r, 1500));   // let Appwrite finish dropping before recreating the same ids

/* ---------- 4. rebuild (same script as the normal setup) ---------- */
console.log('\nAb naya bana rahe hain…');
process.env.APPWRITE_API_KEY = KEY;
await import('./setup-appwrite.mjs');
