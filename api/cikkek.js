import { createCollection, str } from './_lib/collection.js';
import { createCrudHandler } from './_lib/crudHandler.js';

const collection = createCollection('cikkek.json', { sortBy: 'publishDate' });

// Egyszerű, ékezet-tűrő URL-barát azonosító a cikk címéből.
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default createCrudHandler({
  collection,
  validate: (body) => {
    if (!str(body.title)) return 'Hiányzó cím.';
    if (!str(body.publishDate)) return 'Hiányzó megjelenési dátum.';
    return null;
  },
  buildFields: (body) => {
    const title = str(body.title);
    return {
      title,
      slug: str(body.slug) || slugify(title),
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
  filesOf: (entry) => [entry.coverUrl],
});
