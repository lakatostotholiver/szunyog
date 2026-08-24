import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { put, list, del } from '@vercel/blob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// Vercel serverless függvényeken a fájlrendszer nem tartós (minden hívás után
// elveszhet), ezért ha van Blob token, a Vercel Blob store-t használjuk.
// Saját szerveren (VPS, node server.js) token nélkül a lokális JSON fájl a tároló.
const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function resolveDataDir() {
  if (process.env.DIKTALAS_DATA_DIR) return process.env.DIKTALAS_DATA_DIR;
  // Vercelen a projekt mappája csak olvasható; egyedül a /tmp írható (efemer,
  // ezért ott a Blob store a támogatott megoldás – lásd README).
  if (process.env.VERCEL) return '/tmp/szunyog-adatok';
  return path.resolve(PROJECT_ROOT, '..', 'szunyog-diktalas-data');
}

function localFilePath(key) {
  return path.join(resolveDataDir(), key);
}

function ensureLocal(key, fallback) {
  const dir = resolveDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const file = localFilePath(key);
  if (!existsSync(file)) writeFileSync(file, JSON.stringify(fallback), 'utf8');
  return file;
}

export async function readJson(key, fallback = []) {
  if (blobEnabled()) {
    try {
      const { blobs } = await list({ prefix: key, limit: 1 });
      const match = blobs.find((b) => b.pathname === key);
      if (!match) return fallback;

      // A Blob publikus URL-je CDN mögött van, és a `cache: 'no-store'`
      // önmagában nem elég: közvetlenül írás után még a RÉGI tartalmat adta
      // vissza. Emiatt egy frissen létrehozott bejegyzés törlése/szerkesztése
      // "nem található" hibára futott, és egy gyors második mentés felül tudta
      // írni az elsőt. Egyedi lekérdezési paraméterrel megkerüljük a gyorsítótárat.
      const bustUrl = `${match.url}${match.url.includes('?') ? '&' : '?'}_=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await fetch(bustUrl, { cache: 'no-store' });
      if (!res.ok) return fallback;
      return await res.json();
    } catch {
      return fallback;
    }
  }

  // Olvasásnál egy írhatatlan/hiányzó tároló nem hiba: üres listát adunk vissza,
  // hogy a publikus oldal akkor is betöltsön, ha a tárolás még nincs beállítva.
  try {
    const file = ensureLocal(key, fallback);
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export async function writeJson(key, value) {
  if (blobEnabled()) {
    await put(key, JSON.stringify(value, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    return value;
  }

  try {
    ensureLocal(key, value);
    writeFileSync(localFilePath(key), JSON.stringify(value, null, 2), 'utf8');
  } catch (err) {
    throw new Error(
      `Nem sikerült menteni az adatokat (${err.code || err.message}). ` +
        'Vercelen csatolj egy Blob store-t (BLOB_READ_WRITE_TOKEN), saját szerveren ' +
        'pedig állítsd a DIKTALAS_DATA_DIR-t egy írható mappára.'
    );
  }
  return value;
}

// Feltöltött fájlok (PDF jelentések, képek). Blob nélkül a data dir uploads/
// almappájába ír, amit a self-hosted szerver statikusan kiszolgál.
export async function putFile(key, buffer, contentType) {
  if (blobEnabled()) {
    const blob = await put(key, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }

  const dir = path.join(resolveDataDir(), 'uploads');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const safeName = path.basename(key);
  writeFileSync(path.join(dir, safeName), buffer);
  return `/uploads/${safeName}`;
}

export async function deleteFile(keyOrUrl) {
  if (blobEnabled()) {
    try {
      await del(keyOrUrl);
    } catch {
      // már törölve vagy sosem létezett – nem hiba
    }
    return;
  }
  // Self-hosted esetben a fájl a data dir uploads/ mappájában marad,
  // szándékosan nem törlünk lemezről pusztán egy CMS-bejegyzés törlésekor.
}

export function uploadsDir() {
  return path.join(resolveDataDir(), 'uploads');
}
