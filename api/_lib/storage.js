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
      const res = await fetch(match.url, { cache: 'no-store' });
      if (!res.ok) return fallback;
      return await res.json();
    } catch {
      return fallback;
    }
  }

  const file = ensureLocal(key, fallback);
  try {
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

  ensureLocal(key, value);
  writeFileSync(localFilePath(key), JSON.stringify(value, null, 2), 'utf8');
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
