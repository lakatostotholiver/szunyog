import { createCollection, str, num } from './_lib/collection.js';
import { createCrudHandler } from './_lib/crudHandler.js';

const collection = createCollection('egyeni-gocpontok.json', { sortBy: 'date' });

// Törökbálint városrészei – nyilvánosan csak ez a szint jelenik meg.
export const DISTRICTS = [
  'Újtelep',
  'MÁV-telep',
  'Ófalu',
  'Tükörhegy',
  'Annahegy',
  'Rudák-telep',
  'Városközpont',
  'Józsefhegy',
  'Egyéb / nem megadott',
];

export default createCrudHandler({
  collection,
  validate: (body) => {
    if (!str(body.date)) return 'Hiányzó dátum.';
    if (!str(body.district)) return 'Hiányzó városrész.';
    return null;
  },
  buildFields: (body) => ({
    date: str(body.date),
    district: DISTRICTS.includes(str(body.district)) ? str(body.district) : 'Egyéb / nem megadott',

    // ── Csak adminban látható, személyes adat ────────────────────────────
    address: str(body.address),
    contactName: str(body.contactName),
    contactPhone: str(body.contactPhone),
    internalNote: str(body.internalNote),

    // ── Nyilvánosan is megosztható, tanulságos tartalom ──────────────────
    propertyType: str(body.propertyType),
    breedingSiteType: str(body.breedingSiteType),
    larvaeFound: body.larvaeFound === 'igen' ? 'igen' : 'nem',
    larvaeAmount: str(body.larvaeAmount),
    speciesGuess: str(body.speciesGuess),
    treatment: str(body.treatment),
    advice: str(body.advice),
    containerCount: num(body.containerCount),
    photos: Array.isArray(body.photos)
      ? body.photos
          .filter((p) => str(p.url))
          .map((p) => ({ url: str(p.url), caption: str(p.caption) }))
          .slice(0, 8)
      : [],

    // Csak akkor kerül ki bármi a nyilvános oldalra, ha ezt bepipálják.
    shared: body.shared === true,
  }),

  // GDPR: a nyilvános válasz szerveroldalon készül, a pontos cím és a
  // kapcsolattartó adatai el sem hagyják a szervert.
  publicView: (entry) => {
    if (!entry.shared) return null;
    return {
      id: entry.id,
      date: entry.date,
      district: entry.district,
      propertyType: entry.propertyType,
      breedingSiteType: entry.breedingSiteType,
      larvaeFound: entry.larvaeFound,
      larvaeAmount: entry.larvaeAmount,
      speciesGuess: entry.speciesGuess,
      treatment: entry.treatment,
      advice: entry.advice,
      containerCount: entry.containerCount,
      photos: entry.photos,
    };
  },

  filesOf: (entry) => (entry.photos ?? []).map((p) => p.url),
});
