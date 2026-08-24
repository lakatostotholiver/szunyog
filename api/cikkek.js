import { createCollection, str } from './_lib/collection.js';
import { createCrudHandler } from './_lib/crudHandler.js';

const collection = createCollection('cikkek.json', { sortBy: 'publishDate' });

// URL-barát azonosító a cikk címéből.
// Explicit ékezet-tábla, nem kombináló-jeles regex: az utóbbi a forrásban
// láthatatlan karakterekké válik, és némán elromlik (emiatt lett korábban a
// "Szúnyogirtás" címből "sz-nyogirt-s").
const ACCENTS = {
  'á': 'a', 'é': 'e', 'í': 'i',
  'ó': 'o', 'ö': 'o', 'ő': 'o',
  'ú': 'u', 'ü': 'u', 'ű': 'u',
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/./g, (ch) => ACCENTS[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Egyedi, nem üres slug. Két azonos című cikk így sem üti egymást, és egy
 * csupa írásjelből álló cím sem eredményez használhatatlan üres URL-t.
 */
async function uniqueSlug(desired, selfId) {
  const base = desired || 'cikk';
  const existing = new Set(
    (await collection.list()).filter((e) => e.id !== selfId).map((e) => e.slug)
  );
  if (!existing.has(base)) return base;

  for (let i = 2; i < 500; i += 1) {
    const candidate = `${base}-${i}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export default createCrudHandler({
  collection,
  validate: (body) => {
    if (!str(body.title)) return 'Hiányzó cím.';
    if (!str(body.publishDate)) return 'Hiányzó megjelenési dátum.';
    return null;
  },
  buildFields: async (body, { id } = {}) => {
    const title = str(body.title);
    const slug = await uniqueSlug(slugify(str(body.slug) || title), id);

    return {
      title,
      slug,
      publishDate: str(body.publishDate),
      lead: str(body.lead),
      body: str(body.body),
      tag: str(body.tag) || 'Tájékoztatás',
      coverUrl: str(body.coverUrl) || null,
      coverName: str(body.coverName) || null,
      coverSize: Number(body.coverSize) || null,
      coverType: str(body.coverType) || null,
      published: body.published !== false,
    };
  },
  // Piszkozat nem kerül ki a nyilvános oldalra.
  publicView: (entry) => (entry.published ? entry : null),
});
