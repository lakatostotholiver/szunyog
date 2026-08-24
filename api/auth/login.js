import { checkPassword, createSessionCookie } from '../_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.DIKTALAS_PASSWORD) {
    console.error('DIKTALAS_PASSWORD environment variable is missing');
    return res.status(500).json({ error: 'A szerver nincs beállítva (DIKTALAS_PASSWORD hiányzik).' });
  }

  const { password } = req.body || {};
  if (!checkPassword(password)) {
    return res.status(401).json({ error: 'Hibás jelszó.' });
  }

  res.setHeader('Set-Cookie', createSessionCookie(req));
  return res.status(200).json({ ok: true });
}
