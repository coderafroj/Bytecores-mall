// Fails the build if a secret is committed. Run automatically before `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = new Set(['node_modules', 'dist', '.git', '.vercel']);
const RULES = [
  [/standard_[0-9a-f]{40,}/, 'Appwrite API key'],
  [/sk_(live|test)_[A-Za-z0-9]{20,}/, 'Clerk/Stripe secret key'],
  [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, 'private key'],
  [/VITE_[A-Z0-9_]*(API_KEY|SECRET|PRIVATE)[A-Z0-9_]*\s*=\s*\S+/, 'secret stored in a VITE_ variable (VITE_ values are readable by every visitor)'],
];
const SELF = 'scripts/check-secrets.mjs';
const found = [];

(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) { walk(path); continue; }
    if (st.size > 2_000_000 || path.replaceAll('\\', '/') === SELF || name === '.env.example' || /\.(png|jpe?g|webp|gif|ico|woff2?|zip|lock)$/.test(name) || name === 'package-lock.json') continue;
    const text = readFileSync(path, 'utf8');
    for (const [re, label] of RULES) if (re.test(text)) found.push(`${path}: ${label}`);
  }
})('.');

if (process.env.VITE_APPWRITE_API_KEY) {
  console.warn('\n! VITE_APPWRITE_API_KEY is set in your environment. Rename it to APPWRITE_API_KEY (no VITE_ prefix) and delete the old one.\n');
}
if (found.length) {
  console.error('\nSecret check FAILED:\n' + found.map((f) => '  - ' + f).join('\n') +
    '\n\nRotate the key in Appwrite, keep it only in Vercel env vars (APPWRITE_API_KEY), and remove it from the files above.\n');
  process.exit(1);
}
console.log('Secret check passed.');
