const RESEND_ENDPOINT = 'https://api.resend.com/emails';

// Email küldés a Resend REST API-n keresztül. RESEND_API_KEY hiányában
// { skipped: true }-tal tér vissza ahelyett, hogy elhasalna – így a hívó endpoint
// (pl. riport mentése) akkor is sikeresen lefut, ha az email-küldés még nincs
// bekötve, csak logolja, hogy nem ment ki levél.
export async function sendEmail({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY missing – email skipped:', subject);
    return { skipped: true };
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Szúnyogmonitoring <onboarding@resend.dev>';

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend API error (${res.status}): ${detail.slice(0, 500)}`);
  }

  return res.json();
}
