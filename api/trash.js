import { isAuthenticated } from './_lib/session.js';
import { SECTIONS } from './_lib/sections.js';
import { deleteFile } from './_lib/storage.js';

const RETENTION_DAYS = 30;

function daysLeft(deletedAt) {
  const elapsed = (Date.now() - new Date(deletedAt).getTime()) / 86400000;
  return Math.max(0, Math.ceil(RETENTION_DAYS - elapsed));
}

/**
 * Kuka: a törölt bejegyzések listája, visszaállítás és végleges törlés.
 * Kizárólag bejelentkezve érhető el.
 */
export default async function handler(req, res) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Bejelentkezés szükséges.' });

  const url = new URL(req.url, 'http://localhost');
  const sectionKey = url.searchParams.get('section');
  const id = url.searchParams.get('id');

  try {
    if (req.method === 'GET') {
      const entries = [];
      for (const [key, section] of Object.entries(SECTIONS)) {
        for (const entry of await section.collection.listDeleted()) {
          entries.push({
            section: key,
            sectionLabel: section.label,
            id: entry.id,
            label: section.describe(entry) || '(névtelen bejegyzés)',
            deletedAt: entry.deletedAt,
            daysLeft: daysLeft(entry.deletedAt),
          });
        }
      }
      entries.sort((a, b) => (a.deletedAt < b.deletedAt ? 1 : -1));
      return res.status(200).json({ entries, retentionDays: RETENTION_DAYS });
    }

    const section = SECTIONS[sectionKey];
    if (!section || !id) {
      return res.status(400).json({ error: 'Hiányzó vagy ismeretlen szekció/azonosító.' });
    }

    if (req.method === 'POST') {
      const restored = await section.collection.restore(id);
      if (!restored) return res.status(404).json({ error: 'Nem található a kukában.' });
      return res.status(200).json({ entry: restored });
    }

    if (req.method === 'DELETE') {
      const purged = await section.collection.purge(id);
      if (!purged) return res.status(404).json({ error: 'Nem található a kukában.' });

      // A hozzá tartozó feltöltött fájlok csak most, a végleges törléskor
      // szűnnek meg – így egy visszaállított bejegyzés képei megmaradnak.
      for (const fileUrl of section.files(purged)) {
        if (fileUrl) await deleteFile(fileUrl);
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Trash handler failed:', err);
    return res.status(500).json({ error: err.message || 'Szerverhiba.' });
  }
}
