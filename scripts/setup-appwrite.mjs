// One command that makes the shop cloud-sync backend ready:  npm run setup:appwrite
//
//  - creates the DATABASE if it does not exist (uses the existing one if it does)
//  - creates the pos_records COLLECTION + its fields + index (adds only what is missing)
//  - creates the pos_images photo BUCKET (if it already exists it is kept and its settings are corrected)
//  - finishes with a live self-test (writes + deletes one record and one photo)
// Safe to run any number of times. It never deletes your data.
import { readFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

/* ---- read .env if present (does not override variables you already set) ---- */
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const env = (...names) => names.map((n) => process.env[n]).find(Boolean) || '';

const EP = env('APPWRITE_ENDPOINT', 'VITE_APPWRITE_ENDPOINT');
const PROJECT = env('APPWRITE_PROJECT_ID', 'VITE_APPWRITE_PROJECT_ID');
const DB = env('APPWRITE_DATABASE_ID', 'VITE_APPWRITE_DATABASE_ID') || 'bytecores_mall';
const COL = env('APPWRITE_POS_COLLECTION_ID') || 'pos_records';
const BUCKET = env('APPWRITE_POS_BUCKET_ID', 'VITE_APPWRITE_POS_BUCKET_ID') || 'pos_images';
let KEY = env('APPWRITE_API_KEY');   // deliberately NOT VITE_APPWRITE_API_KEY: that one is the leaked, public-style name


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

const fail = (msg) => { console.error('\n✗ ' + msg + '\n'); process.exit(1); };
if (process.env.VITE_APPWRITE_API_KEY) console.warn('! Found VITE_APPWRITE_API_KEY in your environment. It is ignored. Delete it and rotate that key.\n');
if (!EP || !PROJECT) fail('Endpoint / Project ID nahi mile. .env mein VITE_APPWRITE_ENDPOINT aur VITE_APPWRITE_PROJECT_ID hone chahiye (ya APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID set karo).');
if (!KEY) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  KEY = (await rl.question('Nayi Appwrite API key paste karo (sirf is terminal mein, kahin save nahi hoti): ')).trim();
  rl.close();
}
if (!KEY) fail('API key chahiye.');

const base = EP.replace(/\/$/, '');
KEY = KEY.replace(/\s+/g, '');   // a pasted key can pick up spaces / line breaks
async function call(method, path, body, form) {
  const headers = { 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY };
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try { res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : form }); }
  catch (e) { fail(`Appwrite tak pahunch nahi paaye (${base}). Internet / endpoint check karo. (${e.message})`); }
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : {}; } catch { json = { message: text }; }
  return { ok: res.ok, status: res.status, json };
}
const must = (r, what) => { if (!r.ok) fail(`${what} fail hua: ${r.status} ${r.json.message || ''}`); return r; };
const say = (icon, text) => console.log(`  ${icon} ${text}`);

console.log(`\nAppwrite: ${base}\nProject : ${PROJECT}\nDatabase: ${DB}\n`);

/* ---- 0. is the key valid? ---- */
const who = await call('GET', '/databases?queries[]=' + encodeURIComponent('{"method":"limit","values":[1]}'));
if (who.status === 401) fail(explain401(who, { base, project: PROJECT, key: KEY }));
if (who.status === 403) fail('Is key ko "databases.read" scope nahi mila. Key ke scopes check karo.');
must(who, 'Appwrite se connect');

/* ---- 1. database ---- */
const gotDb = await call('GET', `/databases/${DB}`);
if (gotDb.status === 404) { must(await call('POST', '/databases', { databaseId: DB, name: 'Bytecores Mall' }), 'Database banana'); say('+', `database "${DB}" bana diya`); }
else { must(gotDb, 'Database check'); say('=', `database "${DB}" pehle se hai (use kar rahe hain)`); }

/* ---- 2. collection (server-only: no client permissions) ---- */
const gotCol = await call('GET', `/databases/${DB}/collections/${COL}`);
if (gotCol.status === 404) {
  must(await call('POST', `/databases/${DB}/collections`, { collectionId: COL, name: 'POS records', permissions: [], documentSecurity: false }), 'Collection banana');
  say('+', `collection "${COL}" bana diya`);
} else {
  must(gotCol, 'Collection check');
  must(await call('PUT', `/databases/${DB}/collections/${COL}`, { name: gotCol.json.name || 'POS records', permissions: [], documentSecurity: false, enabled: true }), 'Collection permissions theek karna');
  say('=', `collection "${COL}" pehle se hai (permissions server-only kar di)`);
}

/* ---- 3. fields: add only the missing ones ---- */
const WANT = [
  ['string', 'type', { size: 20, required: true }],
  ['string', 'data', { size: 100000, required: true }],
  ['integer', 'updatedAt', { required: true, min: 0, max: 9007199254740991 }],
  ['integer', 'srv', { required: true, min: 0, max: 9007199254740991 }],
  ['boolean', 'deleted', { required: false, default: false }],
  ['string', 'device', { size: 40, required: false, default: '' }],
];
const have = new Map(((await call('GET', `/databases/${DB}/collections/${COL}/attributes`)).json.attributes || []).map((a) => [a.key, a]));
for (const [type, key, opts] of WANT) {
  const cur = have.get(key);
  if (cur) { say(cur.type === type ? '=' : '!', cur.type === type ? `field ${key} pehle se hai` : `field ${key} ka type alag hai (${cur.type}); ise Console mein delete karke dobara chalao`); continue; }
  const r = await call('POST', `/databases/${DB}/collections/${COL}/attributes/${type}`, { key, ...opts });
  if (!r.ok && r.status !== 409) fail(`field ${key} banana fail: ${r.status} ${r.json.message || ''}`);
  say('+', `field ${key} bana diya`);
}
process.stdout.write('  … fields ready hone ka intezaar');
for (let i = 0; i < 90; i++) {
  const list = (await call('GET', `/databases/${DB}/collections/${COL}/attributes`)).json.attributes || [];
  if (WANT.every(([, k]) => list.find((a) => a.key === k)?.status === 'available')) break;
  process.stdout.write('.');
  await new Promise((r) => setTimeout(r, 1000));
}
console.log();

/* ---- 4. index on srv ---- */
const idx = (await call('GET', `/databases/${DB}/collections/${COL}/indexes`)).json.indexes || [];
if (idx.some((i) => (i.attributes || []).includes('srv'))) say('=', 'index srv pehle se hai');
else { const r = await call('POST', `/databases/${DB}/collections/${COL}/indexes`, { key: 'by_srv', type: 'key', attributes: ['srv'], orders: ['ASC'] }); if (!r.ok && r.status !== 409) fail(`index banana fail: ${r.status} ${r.json.message || ''}`); say('+', 'index srv bana diya'); }

/* ---- 5. photo bucket: create, or keep and correct the settings ---- */
const bucketCfg = {
  name: 'POS product photos', permissions: ['read("any")'], fileSecurity: false, enabled: true,
  maximumFileSize: 5_000_000, allowedFileExtensions: ['webp', 'jpeg', 'jpg', 'png'], compression: 'none', encryption: false, antivirus: false,
};
const gotBucket = await call('GET', `/storage/buckets/${BUCKET}`);
if (gotBucket.status === 404) { must(await call('POST', '/storage/buckets', { bucketId: BUCKET, ...bucketCfg }), 'Bucket banana'); say('+', `bucket "${BUCKET}" bana diya`); }
else {
  must(gotBucket, 'Bucket check');
  const perms = Array.from(new Set([...(gotBucket.json.$permissions || []), 'read("any")']));
  await call('PUT', `/storage/buckets/${BUCKET}`, {
    name: gotBucket.json.name || 'BytecoreBucket',
    permissions: perms,
    fileSecurity: false,
    enabled: true,
  });
  say('=', `bucket "${BUCKET}" pehle se hai (usme jo files hain wo safe hain)`);
}

/* ---- 6. live self-test ---- */
process.stdout.write('\n  self-test: ');
const t = `selftest${Date.now().toString(36)}`;
must(await call('POST', `/databases/${DB}/collections/${COL}/documents`, { documentId: t, data: { type: 'products', data: '{}', updatedAt: 1, srv: 1, deleted: false, device: 'setup' } }), 'Test record likhna');
const listed = must(await call('GET', `/databases/${DB}/collections/${COL}/documents?queries[]=${encodeURIComponent(JSON.stringify({ method: 'equal', attribute: 'type', values: ['products'] }))}&queries[]=${encodeURIComponent('{"method":"limit","values":[1]}')}`), 'Record padhna');
await call('DELETE', `/databases/${DB}/collections/${COL}/documents/${t}`);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const form = new FormData(); form.append('fileId', t); form.append('file', new Blob([png], { type: 'image/png' }), 'test.png');
must(await call('POST', `/storage/buckets/${BUCKET}/files`, null, form), 'Test photo upload');
await call('DELETE', `/storage/buckets/${BUCKET}/files/${t}`);
console.log(`record + photo dono kaam kar rahe hain (${listed.json.total ?? '?'} records)`);

console.log(`
✓ Appwrite ready.

Ab Vercel > Settings > Environment Variables mein ye daalo (phir Redeploy):
    APPWRITE_API_KEY            = (wahi nayi key)
    CLERK_SECRET_KEY            = sk_...
    ADMIN_EMAILS                = tumhara admin email
    VITE_APPWRITE_DATABASE_ID   = ${DB}
    VITE_APPWRITE_POS_BUCKET_ID = ${BUCKET}${COL !== 'pos_records' ? `\n    APPWRITE_POS_COLLECTION_ID  = ${COL}` : ''}
Appwrite > Platforms mein apna domain (Web) add karna mat bhoolna.
`);
