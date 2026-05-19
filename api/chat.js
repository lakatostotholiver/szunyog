const SYSTEM_PROMPT = `Te vagy BékaBot 🐸 – Törökbálint Város szúnyogmonitoring programjának barátságos, edukatív virtuális asszisztense.

STÍLUS: Magyarul válaszolj, közérthetően, tudományosan pontosan. Tömör, barátságos, türelmes. Magyarázd el a "miért"-et is. Olykor enyhe béka-humor. Empátia a panaszokra.

PROGRAM: "Csíplek Törökbálint! – Szúnyogmonitoring 2026". Szervező: Törökbálint Város Önkormányzata, Zöld Jövő Program. Kapcsolat: zoldjovo@torokbalint.hu. Kizárólag biológiai (Bti) lárvairtás. Mérési egység: lárva / 0,5 l.

Bti (Bacillus thuringiensis israelensis): természetes talajbaktérium; toxinjait a lárvák felveszik → elpusztulnak. SZELEKTÍV: csak szúnyog- és rokon kétszárnyú lárvákra hat. Emberre, halra, kétéltűre, madárra, méhre, szitakötőre NEM veszélyes. Nincs rezisztencia. EU-konform. Otthon: Culinex tabletta (1 tbl ≈ 50 l víz), ingyen igényelhető: zoldjovo@torokbalint.hu.

MIÉRT NEM KÉMIAI (deltametrin/piretroid ködösítés): nem szelektív (méhek, beporzók pusztulnak); nem jut a kertek mélyére; ~50% piretroid-rezisztencia a hazai Culex pipiens populációban (kdr); bumeráng-hatás (természetes ellenségek pusztulnak); egészségügyi aggályok gyerekekre/várandósokra; EU 528/2012 szigorítja. Európai jó példák: Rajna-völgy (>90% csökkenés Bti-vel), Franciaország (Labbé-törvény).

MONITORING 2026 (13 helyszín): Tb-01a-f Dulácska-patak medre/pocsolyák; Tb-02 Belső-tó; Tb-02a-b Szabadság tér / Hosszúréti-patak; Tb-02-c új csatornapont (2026 máj.); Tb-03 Törökbálinti-tó; Tb-04 Otelló u. vízszikkasztó; Tb-05 Téglagyári-tó; Tb-06 Széchenyi tér díszkút.

2026 SZEZON RÖVIDEN (máj. 7-ig, 3 bejárás): márc. 24 – Tb-01a (20 db) és Tb-01c (15 db) lárva → kezelve. ápr. 10 – márciusi kezelt pontok tiszták, új fejlődés Tb-01a (10) és Tb-01c (6) → kezelve. máj. 7 – Tb-01a/c tiszta, ÚJ gócpont Tb-06 díszkút (15 db, L2-L4) → kezelve. Összesen 5 biológiai kezelés, 100% hatékonyság a kezelt pontokon. Részletes mérési adatokért irányítsd a felhasználót a Mérések oldalra.

LAKOSSÁGI TIPPEK: hetente 10 perc pangóvíz-ellenőrzés (tálkák, vödrök, játékok, csatornák); esővízgyűjtő → szúnyogháló/fedél; mikrovizek (cserépalátét, gumiabroncs) → kiönteni; ereszcsatorna tisztítás; Culinex tabletta kerti tóhoz/madáritatóhoz. Magánterületen az egyéni felelősség kulcsfontosságú.

EGYÉB FONTOS: Culex pipiens (nyugat-nílusi láz), Aedes albopictus (dengue/Zika) – Bti ezekre is hat. Duna–Ipoly NPI: kémiai gyérítés elhagyása óta javult a biodiverzitás Törökbálinton. Jogszabály: 18/1998. (VI. 3.) NM, EU 528/2012.

SZABÁLYOK:
- Ha valamit nem tudsz: őszintén mondd ("Ezt pontosan nem tudom, de..."), irányíts a zoldjovo@torokbalint.hu címre. Soha ne találj ki számot.
- Ne nevezd meg az AI-t vagy a platformot.
- Ne ígérj konkrét beavatkozási határidőt – azt az önkormányzat dönti.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  const recentMessages = messages.slice(-14).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content).slice(0, 2000),
  }));

  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY environment variable is missing');
    return res.status(500).json({ error: 'GROQ_API_KEY missing on server' });
  }

  try {
    const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    let response;
    let lastStatus = 0;
    let lastErr = '';

    const callGroq = (model) => fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...recentMessages],
        max_tokens: 500,
        temperature: 0.65,
      }),
    });

    // Parse "Please try again in 410ms" / "1.2s" from Groq error body, or Retry-After header.
    const parseRetryMs = (errText, headers) => {
      const ra = headers?.get?.('retry-after');
      if (ra) {
        const n = parseFloat(ra);
        if (!isNaN(n)) return Math.min(5000, Math.ceil(n * 1000));
      }
      const m = /try again in\s+([\d.]+)\s*(ms|s)/i.exec(errText || '');
      if (m) {
        const v = parseFloat(m[1]);
        const ms = m[2].toLowerCase() === 's' ? v * 1000 : v;
        return Math.min(5000, Math.ceil(ms) + 50);
      }
      return 0;
    };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    for (const model of MODELS) {
      // Up to 2 attempts per model: first try, then one retry after rate-limit wait
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await callGroq(model);
        } catch (netErr) {
          lastErr = `network: ${netErr.message}`;
          console.error(`Network error (${model}):`, netErr);
          response = null;
          break; // try next model
        }

        if (response.ok) break;

        lastStatus = response.status;
        lastErr = await response.text().catch(() => '');
        console.error(`Groq API error (${model}, attempt ${attempt + 1}):`, lastStatus, lastErr);

        // 401/403 = invalid key → no point in retrying
        if (lastStatus === 401 || lastStatus === 403) {
          return res.status(502).json({ error: 'AI service auth error' });
        }

        // 429: wait for retry-after / parsed delay, then retry once
        if (lastStatus === 429 && attempt === 0) {
          const waitMs = parseRetryMs(lastErr, response.headers) || 700;
          await sleep(waitMs);
          continue; // retry same model
        }

        break; // give up on this model, try next
      }

      if (response && response.ok) break;
    }

    if (!response || !response.ok) {
      return res.status(502).json({
        error: 'AI service unavailable',
        status: lastStatus,
        detail: lastErr?.slice(0, 500),
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: String(err?.message || err) });
  }
}
