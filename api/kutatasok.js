import { randomUUID } from 'crypto';
import { isAuthenticated } from './_lib/session.js';
import { readKutatasok, appendKutatas } from './_lib/kutatasokStore.js';

const str = (v) => (typeof v === 'string' ? v.trim() : '');

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
    const date = str(body.date);
    const location = str(body.location);
    if (!date || !location) {
      return res.status(400).json({ error: 'Hiányzó dátum vagy helyszín.' });
    }

    const time = str(body.time) || '-';
    const entry = {
      id: randomUUID(),
      date,
      time,
      durationMin: body.durationMin ? Number(body.durationMin) : null,
      location,
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
      createdAt: new Date().toISOString(),
    };

    appendKutatas(entry);
    return res.status(201).json({ entry });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
