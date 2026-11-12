import { verifyToken, createClerkClient } from '@clerk/backend';
import { createPosServer } from '../src/pos/sync/serverCore.js';
import { createAppwriteRest } from '../src/pos/sync/appwriteRest.js';

/**
 * Secure sync endpoint for the shop counter.
 *  - the browser sends its Clerk session token; only ADMIN_EMAILS may call this
 *  - Appwrite credentials exist only here (Vercel env vars), never in the browser bundle
 */
const env = (k, fallback) => process.env[k] || (fallback && process.env[fallback]) || '';
const emailCache = new Map();

async function adminEmail(sub, secretKey) {
  const hit = emailCache.get(sub);
  if (hit && hit.exp > Date.now()) return hit.email;
  const user = await createClerkClient({ secretKey }).users.getUser(sub);
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) || user.emailAddresses[0];
  const email = (primary?.emailAddress || '').toLowerCase();
  emailCache.set(sub, { email, exp: Date.now() + 10 * 60_000 });
  return email;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const cfg = {
    endpoint: env('APPWRITE_ENDPOINT', 'VITE_APPWRITE_ENDPOINT'),
    project: env('APPWRITE_PROJECT_ID', 'VITE_APPWRITE_PROJECT_ID'),
    key: env('APPWRITE_API_KEY'),
    databaseId: env('APPWRITE_DATABASE_ID', 'VITE_APPWRITE_DATABASE_ID'),
    collectionId: env('APPWRITE_POS_COLLECTION_ID') || 'pos_records',
    bucketId: env('APPWRITE_POS_BUCKET_ID') || 'pos_images',
  };
  const secretKey = env('CLERK_SECRET_KEY');
  const admins = (env('ADMIN_EMAILS') || 'coderafroj@gmail.com').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
  const missing = [['APPWRITE_API_KEY', cfg.key], ['CLERK_SECRET_KEY', secretKey], ['APPWRITE_ENDPOINT', cfg.endpoint], ['APPWRITE_PROJECT_ID', cfg.project], ['APPWRITE_DATABASE_ID', cfg.databaseId]].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return res.status(503).json({ error: 'not_configured', missing });

  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'login_required' });
    const claims = await verifyToken(token, { secretKey });
    const email = await adminEmail(claims.sub, secretKey);
    if (!admins.includes(email)) return res.status(403).json({ error: 'not_admin' });
  } catch {
    return res.status(401).json({ error: 'login_required' });
  }

  const out = await createPosServer({ api: createAppwriteRest(cfg) }).handle(req.body);
  return res.status(out.status).json(out.json);
}
