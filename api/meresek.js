import { randomUUID } from 'crypto';
import { isAuthenticated } from './_lib/session.js';
import { readMeresek, appendMeres, updateMeres, deleteMeres } from './_lib/meresekStore.js';

const VALID_STATUS = new Set(['clean', 'treated', 'dry']);
const str = (v) => (typeof v === 'string' ? v.trim() : '');

function buildFields(body) {
  const results = Array.isArray(body.results)
    ? body.results
        .filter((r) => str(r.siteCode))
        .map((r) => ({
          siteCode: str(r.siteCode),
          larvae: Number(r.larvae) || 0,
          stages: Array.isArray(r.stages) ? r.stages.map(str).filter(Boolean) : [],
          status: VALID_STATUS.has(r.status) ? r.status : 'clean',
        }))
    : [];

  return {
    surveyDate: str(body.surveyDate),
    reportDate: str(body.reportDate) || str(body.surveyDate),
    publishDate: str(body.publishDate) || str(body.surveyDate),
    summary: str(body.summary),
    reportFileUrl: str(body.reportFileUrl) || null,
    reportFileName: str(body.reportFileName) || null,
    reportFileSize: Number(body.reportFileSize) || null,
    reportFileType: str(body.reportFileType) || null,
    results,
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
  try {
    return await route(req, res);
  } catch (err) {
    console.error('meresek handler failed:', err);
    return res.status(500).json({ error: err.message || 'Szerverhiba.' });
  }
}

async function route(req, res) {
  if (req.method === 'GET') {
    const entries = (await readMeresek()).sort((a, b) => (a.surveyDate < b.surveyDate ? 1 : -1));
    return res.status(200).json({ entries });
  }

  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
  }

  if (req.method === 'POST') {
    const fields = buildFields(req.body || {});
    if (!fields.surveyDate) {
      return res.status(400).json({ error: 'Hiányzó bejárás dátuma.' });
    }

    const entry = { id: randomUUID(), ...fields, createdAt: new Date().toISOString() };
    await appendMeres(entry);
    return res.status(201).json({ entry });
  }

  if (req.method === 'PATCH') {
    const id = getIdFromUrl(req);
    if (!id) return res.status(400).json({ error: 'Hiányzó azonosító.' });

    const fields = buildFields(req.body || {});
    if (!fields.surveyDate) {
      return res.status(400).json({ error: 'Hiányzó bejárás dátuma.' });
    }

    const updated = await updateMeres(id, fields);
    if (!updated) return res.status(404).json({ error: 'Nem található mérés.' });
    return res.status(200).json({ entry: updated });
  }

  if (req.method === 'DELETE') {
    const id = getIdFromUrl(req);
    if (!id) return res.status(400).json({ error: 'Hiányzó azonosító.' });

    const removed = await deleteMeres(id);
    if (!removed) return res.status(404).json({ error: 'Nem található mérés.' });
    // Kukába kerül – a csatolt jegyzőkönyv csak végleges törléskor szűnik meg.
    return res.status(200).json({ ok: true, trashed: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
