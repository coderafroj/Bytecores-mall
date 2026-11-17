// Keeps secrets out of git and out of the browser bundle.
//   node scripts/check-secrets.mjs         source check  (runs before `npm run build`)
//   node scripts/check-secrets.mjs --dist  built-files check (runs after the build)
// A local .env is where secrets are SUPPOSED to live (it is git-ignored), so its values are not flagged.
// What is flagged: a secret in any committed file, a tracked .env, a secret stored under a VITE_ name
// (VITE_ values are shipped to every visitor), and any secret that ended up inside dist/.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const DIST_ONLY = process.argv.includes('--dist');
const SKIP = new Set(['node_modules', '.git', '.vercel', ...(DIST_ONLY ? [] : ['dist'])]);
const KEY_RULES = [
  [/standard_[0-9a-f]{40,}/, 'Appwrite API key'],
  [/sk_(live|test)_[A-Za-z0-9]{20,}/, 'Clerk/Stripe secret key'],
  [/whsec_[A-Za-z0-9+/=]{20,}/, 'webhook signing secret'],
  [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, 'private key'],
];
const VITE_SECRET = [/VITE_[A-Z0-9_]*(API_KEY|SECRET|PRIVATE)[A-Z0-9_]*\s*=\s*\S+/, 'secret stored in a VITE_ variable (VITE_ values are readable by every visitor)'];
const SELF = 'scripts/check-secrets.mjs';
const found = [];

function scan(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) { scan(path); continue; }
    if (st.size > 3_000_000 || path.replaceAll('\\', '/') === SELF || name === '.env.example' || name === 'package-lock.json' || /\.(png|jpe?g|webp|gif|ico|woff2?|zip|lock|map)$/.test(name)) continue;
    const text = readFileSync(path, 'utf8');
    const isEnvFile = /^\.env(\..+)?$/.test(name);
    const rules = isEnvFile ? [VITE_SECRET] : DIST_ONLY ? KEY_RULES : [...KEY_RULES, VITE_SECRET];
    for (const [re, label] of rules) if (re.test(text)) found.push(`${path}: ${label}`);
  }
}

if (DIST_ONLY) {
  try { scan('dist'); } catch { /* no dist yet */ }
} else {
  scan('.');
  try {
    const tracked = execSync('git ls-files', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n');
    for (const f of tracked) if (/(^|\/)\.env(\..+)?$/.test(f) && !f.endsWith('.env.example')) found.push(`${f}: .env file is tracked by git (run: git rm --cached ${f})`);
  } catch { /* not a git checkout (e.g. some CI) */ }
  if (process.env.VITE_APPWRITE_API_KEY) console.warn('\n! VITE_APPWRITE_API_KEY is set in your environment. Rename it to APPWRITE_API_KEY (no VITE_ prefix) and delete the old one.\n');
}

if (found.length) {
  console.error(`\nSecret check FAILED${DIST_ONLY ? ' (found inside the built site!)' : ''}:\n` + found.map((f) => '  - ' + f).join('\n') +
    '\n\nRotate the exposed key in Appwrite/Clerk, keep it only in Vercel env vars (no VITE_ prefix) and your git-ignored .env.\n');
  process.exit(1);
}
console.log(`Secret check passed${DIST_ONLY ? ' (dist is clean)' : ''}.`);
