import { useEffect, useCallback } from 'react';

/**
 * Egyszerű képnagyító: teljes képernyős nézet, nyilakkal és Escape-pel.
 * A háttér görgetése zárolva van, amíg nyitva van.
 */
export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const open = index !== null && index >= 0 && photos.length > 0;

  const go = useCallback(
    (delta) => {
      if (!open) return;
      onNavigate((index + delta + photos.length) % photos.length);
    },
    [open, index, photos.length, onNavigate]
  );

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };

    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, go]);

  if (!open) return null;
  const photo = photos[index];

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Kép nagyban" onClick={onClose}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Bezárás">
        ×
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          className="lightbox-nav prev"
          aria-label="Előző kép"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
        >
          ‹
        </button>
      )}

      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <img src={photo.url} alt={photo.caption || 'Fénykép'} />
        <figcaption>
          {photo.caption}
          {photos.length > 1 && (
            <span className="lightbox-counter">
              {index + 1} / {photos.length}
            </span>
          )}
        </figcaption>
      </figure>

      {photos.length > 1 && (
        <button
          type="button"
          className="lightbox-nav next"
          aria-label="Következő kép"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}
