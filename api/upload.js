import { randomUUID } from 'crypto';
import { isAuthenticated } from './_lib/session.js';
import { putFile } from './_lib/storage.js';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// A body-t nyersen olvassuk (a JSON body-parsert kikapcsoltuk), a fájl nevét és
// típusát query paraméterben kapjuk – így nincs szükség multipart parser függőségre.
export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  // Express (server.js) az express.raw middleware-rel már beolvasta a streamet.
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > MAX_BYTES) return Promise.reject(new Error('too-large'));
    return Promise.resolve(req.body);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BYTES) {
        reject(new Error('too-large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Bejelentkezés szükséges.' });
  }

  const url = new URL(req.url, 'http://localhost');
  const contentType = (req.headers['content-type'] || '').split(';')[0].trim();
  const ext = ALLOWED[contentType];
  if (!ext) {
    return res.status(400).json({ error: 'Csak PDF, JPG, PNG vagy WebP tölthető fel.' });
  }

  // A megadott nevet csak megjelenítésre használjuk; a tárolt kulcsot mi generáljuk,
  // hogy a felhasználói input ne befolyásolhassa a tárolási útvonalat.
  const displayName = (url.searchParams.get('name') || `feltoltes.${ext}`).slice(0, 120);
  const key = `uploads/${randomUUID()}.${ext}`;

  let buffer;
  try {
    buffer = await readRawBody(req);
  } catch (err) {
    if (err.message === 'too-large') {
      return res.status(413).json({ error: 'A fájl túl nagy (max. 10 MB).' });
    }
    return res.status(400).json({ error: 'Nem sikerült beolvasni a fájlt.' });
  }

  if (buffer.length === 0) {
    return res.status(400).json({ error: 'Üres fájl.' });
  }

  try {
    const fileUrl = await putFile(key, buffer, contentType);
    return res.status(201).json({
      url: fileUrl,
      name: displayName,
      size: buffer.length,
      type: contentType,
    });
  } catch (err) {
    console.error('Upload failed:', err);
    return res.status(500).json({ error: 'A feltöltés nem sikerült.' });
  }
}
