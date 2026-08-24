export async function fetchKutatasok() {
  const res = await fetch('/api/kutatasok');
  if (!res.ok) throw new Error('Nem sikerült betölteni az adatokat.');
  const data = await res.json();
  return data.entries ?? [];
}

export async function addKutatas(entry) {
  const res = await fetch('/api/kutatasok', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Nem sikerült elmenteni a bejegyzést.');
  }
}
