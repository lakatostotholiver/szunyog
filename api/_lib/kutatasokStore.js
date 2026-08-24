import { createCollection } from './collection.js';
import { readJson, writeJson } from './storage.js';

const KEY = 'kutatasok.json';

export const kutatasokCollection = createCollection(KEY, { sortBy: 'measuredAt' });

export async function readKutatasok() {
  return kutatasokCollection.list();
}

export async function appendKutatas(entry) {
  // Az id-t a hívó adja (kompatibilitás miatt), ezért közvetlenül írunk.
  const all = await readJson(KEY, []);
  all.push(entry);
  await writeJson(KEY, all);
  return entry;
}

export async function updateKutatas(id, patch) {
  return kutatasokCollection.update(id, patch);
}

export async function deleteKutatas(id) {
  return kutatasokCollection.remove(id);
}
