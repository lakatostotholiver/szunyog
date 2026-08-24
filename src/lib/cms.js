import { prepareImage, formatFileSize } from './image';

async function fail(res, fallback) {
  const data = await res.json().catch(() => ({}));
  throw new Error(data.error || fallback);
}

// Egységes CRUD kliens a CMS végpontokhoz.
export function createResource(path) {
  return {
    async list() {
      const res = await fetch(path);
      if (!res.ok) await fail(res, 'Nem sikerült betölteni az adatokat.');
      return (await res.json()).entries ?? [];
    },
    async create(entry) {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) await fail(res, 'Nem sikerült elmenteni.');
      return (await res.json()).entry;
    },
    async update(id, entry) {
      const res = await fetch(`${path}?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) await fail(res, 'Nem sikerült frissíteni.');
      return (await res.json()).entry;
    },
    async remove(id) {
      const res = await fetch(`${path}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) await fail(res, 'Nem sikerült törölni.');
    },
  };
}

export const fajazonositas = createResource('/api/fajazonositas');
export const cikkek = createResource('/api/cikkek');
export const egyeniGocpontok = createResource('/api/egyeni-gocpontok');

const MAX_UPLOAD = 10 * 1024 * 1024;

export async function uploadFile(rawFile) {
  // A képeket feltöltés előtt átméretezzük – enélkül egy telefonos fotó
  // több megabájt lenne, ami lassú feltöltés és lassan betöltő oldal.
  const file = await prepareImage(rawFile);

  if (file.size > MAX_UPLOAD) {
    throw new Error(
      `A fájl túl nagy (${formatFileSize(file.size)}). A megengedett legnagyobb méret 10 MB.`
    );
  }
  if (!file.type) {
    throw new Error('Ismeretlen fájltípus. Tölts fel PDF, JPG, PNG vagy WebP fájlt.');
  }

  const res = await fetch(`/api/upload?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) await fail(res, 'A feltöltés nem sikerült.');
  return res.json();
}
