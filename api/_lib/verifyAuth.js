import { getAdminAuth } from './firebaseAdmin.js';

// Kollégák-only endpointokhoz: az "Authorization: Bearer <idToken>" fejlécet
// ellenőrzi a Firebase Admin SDK-val. Visszaadja a bejelentkezett Firebase user rekordot.
export async function requireAuth(req) {
  const header = req.headers.authorization || '';
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) {
    const err = new Error('Missing bearer token');
    err.status = 401;
    throw err;
  }
  try {
    return await getAdminAuth().verifyIdToken(match[1]);
  } catch {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    throw err;
  }
}
