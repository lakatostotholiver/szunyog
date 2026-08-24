import { createCollection } from './collection.js';
import { readJson, writeJson } from './storage.js';
import { buildSeedMeresek } from './seed.js';

const KEY = 'meresek.json';
const INIT_KEY = 'meresek.initialized.json';

export const meresekCollection = createCollection(KEY, { sortBy: 'surveyDate' });

// Első indításkor feltöltjük a tárolót a kódban rögzített 2026-os körökkel,
// hogy azok is szerkeszthetők legyenek. A külön "initialized" jelző miatt egy
// szándékosan kiürített lista nem töltődik újra.
async function ensureSeeded() {
  const flag = await readJson(INIT_KEY, null);
  if (flag && flag.initialized) return;

  const existing = await readJson(KEY, []);
  if (!Array.isArray(existing) || existing.length === 0) {
    await writeJson(KEY, buildSeedMeresek());
  }
  await writeJson(INIT_KEY, { initialized: true, at: new Date().toISOString() });
}

export async function readMeresek() {
  await ensureSeeded();
  return meresekCollection.list();
}

export async function appendMeres(entry) {
  await ensureSeeded();
  // Az id-t a hívó adja (kompatibilitás miatt), ezért közvetlenül írunk.
  const all = await readJson(KEY, []);
  all.push(entry);
  await writeJson(KEY, all);
  return entry;
}

export async function updateMeres(id, patch) {
  await ensureSeeded();
  return meresekCollection.update(id, patch);
}

export async function deleteMeres(id) {
  await ensureSeeded();
  return meresekCollection.remove(id);
}
