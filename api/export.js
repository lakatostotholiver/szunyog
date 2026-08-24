import { isAuthenticated } from './_lib/session.js';
import { SECTIONS } from './_lib/sections.js';

/**
 * Teljes adatmentés egyetlen JSON fájlban.
 *
 * Ez BIZALMAS: tartalmazza az egyéni gócpontok pontos címét, koordinátáját és
 * kapcsolattartói adatait is, hiszen mentésnek készül. Ezért kizárólag
 * bejelentkezve érhető el, és a letöltött fájlt ennek megfelelően kell kezelni.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Bejelentkezés szükséges.' });

  try {
    const data = {};
    let total = 0;

    for (const [key, section] of Object.entries(SECTIONS)) {
      const [items, deleted] = await Promise.all([
        section.collection.list(),
        section.collection.listDeleted(),
      ]);
      data[key] = { label: section.label, items, deleted };
      total += items.length;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="szunyogmonitoring-mentes-${stamp}.json"`);

    return res.status(200).json({
      exportedAt: new Date().toISOString(),
      totalEntries: total,
      note: 'Bizalmas mentés – személyes adatokat (cím, koordináta, kapcsolattartó) is tartalmaz.',
      data,
    });
  } catch (err) {
    console.error('Export failed:', err);
    return res.status(500).json({ error: err.message || 'A mentés nem sikerült.' });
  }
}
