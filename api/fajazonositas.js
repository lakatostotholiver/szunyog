import { createCollection, str } from './_lib/collection.js';
import { createCrudHandler } from './_lib/crudHandler.js';

const collection = createCollection('fajazonositas.json', { sortBy: 'date' });
const METHODS = new Set(['CO2', 'H']);

// Befogott egyedszám: nem lehet negatív és nem lehet tört szám.
const count = (v) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export default createCrudHandler({
  collection,
  validate: (body) => {
    if (!str(body.date)) return 'Hiányzó dátum.';
    if (!str(body.location)) return 'Hiányzó helyszín.';
    return null;
  },
  buildFields: (body) => {
    const species = Array.isArray(body.species)
      ? body.species
          .filter((s) => str(s.name))
          .map((s) => ({ name: str(s.name), count: count(s.count) }))
      : [];

    return {
      date: str(body.date),
      method: METHODS.has(str(body.method)) ? str(body.method) : 'CO2',
      location: str(body.location),
      note: str(body.note),
      species,
      total: species.reduce((sum, s) => sum + (s.count || 0), 0),
    };
  },
});
