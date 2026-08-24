import { randomUUID } from 'crypto';
import { isAuthenticated } from './_lib/session.js';
import { readKutatasok, appendKutatas, updateKutatas, deleteKutatas } from './_lib/kutatasokStore.js';

const str = (v) => (typeof v === 'string' ? v.trim() : '');

function buildFields(body) {
  const date = str(body.date);
  const time = str(body.time) || '-';
  return {
    date,
    time,
    durationMin: body.durationMin !== undefined && body.durationMin !== '' ? Number(body.durationMin) : null,
    location: str(body.location),
    biteCount: str(body.biteCount) || '-',
    caughtCount: str(body.caughtCount) || '-',
    biteLoadPerHour: str(body.biteLoadPerHour) || '-',
    breedingSites: str(body.breedingSites) || '-',
    treatmentType: str(body.treatmentType) || '-',
    futureActions: str(body.futureActions) || '-',
    larvaeCollected: body.larvaeCollected === 'igen' ? 'igen' : 'nem',
    larvaeAmount: str(body.larvaeAmount) || '-',
    notes: str(body.notes) || '-',
    measuredAt: `${date}T${time !== '-' ? time : '00:00'}`,
  };
}

function getIdFromUrl(req) {
  try {
    return new URL(req.url, 'http://localhost').searchParams.get('id');
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const entries = readKutatasok().sort((a, b) => (a.measuredAt < b.measuredAt ? 1 : -1));
    return res.status(200).json({ entries });
  }

  if (req.method === 'POST') {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
    }

    const body = req.body || {};
    if (!str(body.date) || !str(body.location)) {
      return res.status(400).json({ error: 'Hiányzó dátum vagy helyszín.' });
    }

    const entry = { id: randomUUID(), ...buildFields(body), createdAt: new Date().toISOString() };
    appendKutatas(entry);
    return res.status(201).json({ entry });
  }

  if (req.method === 'PATCH') {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
    }

    const id = getIdFromUrl(req);
    if (!id) return res.status(400).json({ error: 'Hiányzó azonosító.' });

    const body = req.body || {};
    if (!str(body.date) || !str(body.location)) {
      return res.status(400).json({ error: 'Hiányzó dátum vagy helyszín.' });
    }

    const updated = updateKutatas(id, buildFields(body));
    if (!updated) return res.status(404).json({ error: 'Nem található bejegyzés.' });
    return res.status(200).json({ entry: updated });
  }

  if (req.method === 'DELETE') {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
    }

    const id = getIdFromUrl(req);
    if (!id) return res.status(400).json({ error: 'Hiányzó azonosító.' });

    const ok = deleteKutatas(id);
    if (!ok) return res.status(404).json({ error: 'Nem található bejegyzés.' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
