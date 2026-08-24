import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function loadCredential() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (!b64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_B64 environment variable is missing');
  }
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

function getAdminApp() {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  return initializeApp({ credential: cert(loadCredential()) });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
