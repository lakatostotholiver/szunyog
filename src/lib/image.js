const MAX_EDGE = 1800; // a leghosszabb oldal képpontban
const QUALITY = 0.82;

/**
 * Telefonos fényképek 3–8 MB-osak, ami feleslegesen lassú feltöltés és lassan
 * betöltő oldal. Feltöltés előtt átméretezzük és JPEG-be tömörítjük.
 * Nem képekre (PDF) és apró képekre változatlanul visszaadja az eredetit.
 */
export async function prepareImage(file) {
  if (!file.type.startsWith('image/')) return file;

  // A GIF animált lehet – azt nem bántjuk, mert a canvas elveszítené.
  if (file.type === 'image/gif') return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // ha a böngésző nem tudja dekódolni, menjen az eredeti
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const alreadySmall = scale === 1 && file.size < 900 * 1024;
  if (alreadySmall) {
    bitmap.close?.();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob || blob.size >= file.size) return file; // ha nem nyertünk vele, marad az eredeti

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
