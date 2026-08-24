import { createCollection } from './collection.js';
import { meresekCollection } from './meresekStore.js';
import { kutatasokCollection } from './kutatasokStore.js';

// A CMS szekciói egy helyen – ezt használja a mentés (export) és a kuka.
// A `label` a felületen jelenik meg, a `describe` pedig egy rövid, felismerhető
// megnevezést ad egy-egy bejegyzésnek a kuka listájában.
export const SECTIONS = {
  meresek: {
    label: 'Mérési körök',
    collection: meresekCollection,
    describe: (e) => `${e.surveyDate} – bejárás`,
    files: (e) => [e.reportFileUrl],
  },
  kutatasok: {
    label: 'Gócpont-kutatások',
    collection: kutatasokCollection,
    describe: (e) => `${e.date} – ${e.location}`,
    files: () => [],
  },
  'egyeni-gocpontok': {
    label: 'Egyéni gócpontok',
    collection: createCollection('egyeni-gocpontok.json', { sortBy: 'date' }),
    describe: (e) => `${e.date} – ${e.district}`,
    files: (e) => (e.photos ?? []).map((p) => p.url),
  },
  fajazonositas: {
    label: 'Fajazonosítás',
    collection: createCollection('fajazonositas.json', { sortBy: 'date' }),
    describe: (e) => `${e.date} – ${e.location}`,
    files: () => [],
  },
  cikkek: {
    label: 'Cikkek',
    collection: createCollection('cikkek.json', { sortBy: 'publishDate' }),
    describe: (e) => e.title,
    files: (e) => [e.coverUrl],
  },
};
