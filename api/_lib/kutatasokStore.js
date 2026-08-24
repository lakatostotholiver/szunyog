import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// Alapértelmezés a repó mappáján KÍVÜL (a szülőmappában), hogy egy friss
// GitHub-klónozásos redeploy se törölje el a korábban rögzített adatokat.
// Felülírható a DIKTALAS_DATA_DIR env változóval.
function resolveDataDir() {
  if (process.env.DIKTALAS_DATA_DIR) return process.env.DIKTALAS_DATA_DIR;
  return path.resolve(PROJECT_ROOT, '..', 'szunyog-diktalas-data');
}

function dataFilePath() {
  return path.join(resolveDataDir(), 'kutatasok.json');
}

function ensureStore() {
  const dir = resolveDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const file = dataFilePath();
  if (!existsSync(file)) writeFileSync(file, '[]', 'utf8');
  return file;
}

export function readKutatasok() {
  const file = ensureStore();
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendKutatas(entry) {
  const file = ensureStore();
  const entries = readKutatasok();
  entries.push(entry);
  writeFileSync(file, JSON.stringify(entries, null, 2), 'utf8');
  return entry;
}
