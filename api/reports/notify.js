import { requireAuth } from '../_lib/verifyAuth.js';
import { sendEmail } from '../_lib/resend.js';

const APP_URL = process.env.PUBLIC_APP_URL || 'https://szunyog-monitoring.vercel.app';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

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

  if (!ADMIN_EMAIL) {
    console.warn('ADMIN_NOTIFICATION_EMAIL missing – report notification skipped');
    return res.status(200).json({ ok: true, emailSent: false });
  }

  const { description, lat, lng, photoURL } = req.body || {};
  if (typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'Hiányzó leírás' });
  }

  const html = `
    <p>Új gócpont-riportot rögzített: <strong>${caller.email}</strong></p>
    <p><strong>Leírás:</strong> ${description}</p>
    ${typeof lat === 'number' && typeof lng === 'number'
      ? `<p><strong>Helyszín:</strong> ${lat.toFixed(5)}, ${lng.toFixed(5)} (<a href="https://www.google.com/maps?q=${lat},${lng}">térkép</a>)</p>`
      : ''}
    ${photoURL ? `<p><a href="${photoURL}">Fotó megtekintése</a></p>` : ''}
    <p><a href="${APP_URL}/riportok">Összes riport megnyitása</a></p>
  `;

  try {
    const result = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Új gócpont-riport – ${caller.email}`,
      html,
      replyTo: caller.email,
    });
    return res.status(200).json({ ok: true, emailSent: !result.skipped });
  } catch (err) {
    console.error('Report notify email failed:', err);
    // A riport már el lett mentve Firestore-ba – ne buktassuk el a mentést egy email hiba miatt.
    return res.status(200).json({ ok: true, emailSent: false, error: String(err?.message || err) });
  }
}
