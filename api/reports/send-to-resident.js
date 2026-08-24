import { requireAuth } from '../_lib/verifyAuth.js';
import { sendEmail } from '../_lib/resend.js';

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

  const { to, message } = req.body || {};
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'Érvénytelen email cím' });
  }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Hiányzó üzenet' });
  }

  const html = `
    <p>Tisztelt Bejelentő!</p>
    <p>${message.trim().replace(/\n/g, '<br>')}</p>
    <p>Üdvözlettel,<br>Törökbálint Város Önkormányzata – Zöld Jövő Program</p>
  `;

  try {
    const result = await sendEmail({
      to: to.trim(),
      subject: 'Válasz a gócpont-bejelentésére – Törökbálint Zöld Jövő Program',
      html,
      replyTo: caller.email,
    });
    if (result.skipped) {
      return res.status(503).json({ error: 'Az email-küldés nincs beállítva a szerveren (RESEND_API_KEY hiányzik).' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send-to-resident email failed:', err);
    return res.status(502).json({ error: 'Nem sikerült elküldeni a levelet.', detail: String(err?.message || err) });
  }
}
