import { randomUUID } from 'crypto';
import { readJson, writeJson } from './storage.js';

// Egységes, JSON-fájl/Blob alapú gyűjtemény. Minden CMS szekció ezt használja,
// így a listázás/létrehozás/módosítás/törlés logikája egy helyen él.
export function createCollection(key, { sortBy } = {}) {
  const readAll = async () => {
    const parsed = await readJson(key, []);
    return Array.isArray(parsed) ? parsed : [];
  };

  const sorted = (items) =>
    sortBy ? [...items].sort((a, b) => (String(a[sortBy]) < String(b[sortBy]) ? 1 : -1)) : items;

  return {
    async list() {
      return sorted(await readAll());
    },
    async create(fields) {
      const entry = { id: randomUUID(), ...fields, createdAt: new Date().toISOString() };
      const all = await readAll();
      all.push(entry);
      await writeJson(key, all);
      return entry;
    },
    async update(id, fields) {
      const all = await readAll();
      const idx = all.findIndex((e) => e.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...fields, id, updatedAt: new Date().toISOString() };
      await writeJson(key, all);
      return all[idx];
    },
    async remove(id) {
      const all = await readAll();
      const idx = all.findIndex((e) => e.id === id);
      if (idx === -1) return null;
      const [removed] = all.splice(idx, 1);
      await writeJson(key, all);
      return removed;
    },
  };
}

export const str = (v) => (typeof v === 'string' ? v.trim() : '');
export const num = (v) => (v === '' || v === undefined || v === null ? null : Number(v) || 0);
