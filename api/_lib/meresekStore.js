import { readJson, writeJson } from './storage.js';

const KEY = 'meresek.json';

export async function readMeresek() {
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
