async function parseError(res, fallback) {
  const data = await res.json().catch(() => ({}));
  throw new Error(data.error || fallback);
}

export async function fetchMeresek() {
  const res = await fetch('/api/meresek');
  if (!res.ok) throw new Error('Nem sikerült betölteni a méréseket.');
  const data = await res.json();
  return data.entries ?? [];
}

export async function addMeres(entry) {
  const res = await fetch('/api/meresek', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) await parseError(res, 'Nem sikerült elmenteni a mérést.');
  return (await res.json()).entry;
}

export async function updateMeres(id, entry) {
  const res = await fetch(`/api/meresek?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) await parseError(res, 'Nem sikerült frissíteni a mérést.');
  return (await res.json()).entry;
}

export async function deleteMeres(id) {
  const res = await fetch(`/api/meresek?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) await parseError(res, 'Nem sikerült törölni a mérést.');
}

export async function uploadFile(file) {
  const res = await fetch(`/api/upload?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) await parseError(res, 'A feltöltés nem sikerült.');
  return res.json();
}
