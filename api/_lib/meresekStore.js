import { readJson, writeJson } from './storage.js';
import { buildSeedMeresek } from './seed.js';

const KEY = 'meresek.json';
const INIT_KEY = 'meresek.initialized.json';

// Első indításkor feltöltjük a tárolót a kódban rögzített 2026-os körökkel,
// hogy azok is szerkeszthetők legyenek. A külön "initialized" jelző miatt egy
// szándékosan kiürített lista nem töltődik újra.
async function ensureSeeded() {
  const flag = await readJson(INIT_KEY, null);
  if (flag && flag.initialized) return;

  const existing = await readJson(KEY, []);
  if (Array.isArray(existing) && existing.length > 0) {
    await writeJson(INIT_KEY, { initialized: true, at: new Date().toISOString() });
    return;
  }

  await writeJson(KEY, buildSeedMeresek());
  await writeJson(INIT_KEY, { initialized: true, at: new Date().toISOString() });
}

export async function readMeresek() {
  await ensureSeeded();
  const parsed = await readJson(KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function appendMeres(entry) {
  const entries = await readMeresek();
  entries.push(entry);
  await writeJson(KEY, entries);
  return entry;
}

export async function updateMeres(id, patch) {
  const entries = await readMeresek();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  entries[idx] = { ...entries[idx], ...patch, id, updatedAt: new Date().toISOString() };
  await writeJson(KEY, entries);
  return entries[idx];
}

export async function deleteMeres(id) {
  const entries = await readMeresek();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  const [removed] = entries.splice(idx, 1);
  await writeJson(KEY, entries);
  return removed;
}
