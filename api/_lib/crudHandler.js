import { isAuthenticated } from './session.js';
import { deleteFile } from './storage.js';

function idFromUrl(req) {
  try {
    return new URL(req.url, 'http://localhost').searchParams.get('id');
  } catch {
    return null;
  }
}

/**
 * Közös CRUD végpont a CMS szekciókhoz.
 *
 * `publicView` a legfontosabb elem: a NEM bejelentkezett kérésre ezen keresztül
 * megy ki minden rekord. Itt kell kihagyni a személyes adatokat (pl. pontos cím)
 * és a nem publikált tartalmat – szerveroldalon, hogy a böngészőbe se jusson el.
 * Ha null-t ad vissza, a rekord egyáltalán nem kerül a válaszba.
 */
export function createCrudHandler({ collection, buildFields, validate, publicView, filesOf }) {
  return async function handler(req, res) {
    try {
      const authed = isAuthenticated(req);

      if (req.method === 'GET') {
        const all = await collection.list();
        const entries = authed
          ? all
          : all.map((e) => (publicView ? publicView(e) : e)).filter(Boolean);
        return res.status(200).json({ entries });
      }

      if (!authed) {
        return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
      }

      if (req.method === 'POST' || req.method === 'PATCH') {
        const body = req.body || {};
        const problem = validate ? validate(body) : null;
        if (problem) return res.status(400).json({ error: problem });

        const fields = buildFields(body);

        if (req.method === 'POST') {
          return res.status(201).json({ entry: await collection.create(fields) });
        }

        const id = idFromUrl(req);
        if (!id) return res.status(400).json({ error: 'Hiányzó azonosító.' });
        const updated = await collection.update(id, fields);
        if (!updated) return res.status(404).json({ error: 'Nem található bejegyzés.' });
        return res.status(200).json({ entry: updated });
      }

      if (req.method === 'DELETE') {
        const id = idFromUrl(req);
        if (!id) return res.status(400).json({ error: 'Hiányzó azonosító.' });
        const removed = await collection.remove(id);
        if (!removed) return res.status(404).json({ error: 'Nem található bejegyzés.' });

        // A bejegyzéshez tartozó feltöltött fájlok se maradjanak árván.
        if (filesOf) {
          for (const url of filesOf(removed)) {
            if (url) await deleteFile(url);
          }
        }
        return res.status(200).json({ ok: true });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
      console.error('CRUD handler failed:', err);
      return res.status(500).json({ error: err.message || 'Szerverhiba.' });
    }
  };
}
