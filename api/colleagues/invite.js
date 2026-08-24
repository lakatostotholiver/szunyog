import { randomBytes } from 'node:crypto';
import { getAdminAuth } from '../_lib/firebaseAdmin.js';
import { requireAuth } from '../_lib/verifyAuth.js';
import { sendEmail } from '../_lib/resend.js';

const APP_URL = process.env.PUBLIC_APP_URL || 'https://szunyog-monitoring.vercel.app';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let caller;
  try {
    caller = await requireAuth(req);
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const { email } = req.body || {};
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Érvénytelen email cím' });
  }
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const adminAuth = getAdminAuth();
    let alreadyExisted = false;

    try {
      const throwawayPassword = randomBytes(24).toString('base64');
      await adminAuth.createUser({ email: normalizedEmail, password: throwawayPassword, emailVerified: false });
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        alreadyExisted = true;
      } else {
        throw err;
      }
    }

    const resetLink = await adminAuth.generatePasswordResetLink(normalizedEmail, {
      url: `${APP_URL}/bejelentkezes`,
    });

    const subject = alreadyExisted
      ? 'Jelszó-visszaállítás – Szúnyogmonitoring riportok'
      : 'Meghívó – Szúnyogmonitoring terepi riportok';

    const html = `
      <p>Szia!</p>
      <p>${alreadyExisted
        ? 'Jelszó-visszaállítást kértek a fiókodhoz a Törökbálinti szúnyogmonitoring riport-rendszerben.'
        : `${caller.email} meghívott, hogy a Törökbálinti szúnyogmonitoring program terepi gócpont-riport rendszerébe belépj.`}</p>
      <p>Kattints az alábbi linkre a jelszavad beállításához, utána a <a href="${APP_URL}/bejelentkezes">${APP_URL}/bejelentkezes</a> oldalon tudsz belépni ezzel az email címmel:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>A link egy ideig érvényes. Ha nem te kérted, nyugodtan hagyd figyelmen kívül.</p>
    `;

    let emailSent = false;
    try {
      const result = await sendEmail({ to: normalizedEmail, subject, html });
      emailSent = !result.skipped;
    } catch (err) {
      console.error('Invite email send failed:', err);
    }

    return res.status(200).json({ ok: true, alreadyExisted, emailSent, inviteLink: resetLink });
  } catch (err) {
    console.error('Invite handler error:', err);
    return res.status(500).json({ error: 'Nem sikerült a meghívást elküldeni.', detail: String(err?.message || err) });
  }
}
