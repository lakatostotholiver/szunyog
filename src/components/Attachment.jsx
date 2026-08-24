import { formatFileSize } from '../lib/image';

function isImage(type, url = '') {
  return type?.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(url);
}

function isPdf(type, url = '') {
  return type === 'application/pdf' || /\.pdf$/i.test(url);
}

const PdfIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
    <path d="M14 2v6h6" strokeLinejoin="round" />
  </svg>
);

/**
 * Csatolt fájl egységes megjelenítése: képnél előnézet, PDF-nél/egyébnél
 * ikonos kártya névvel és mérettel. Új lapon nyílik.
 */
export default function Attachment({ url, name, size, type, onRemove, compact = false }) {
  if (!url) return null;

  const label = name || (isPdf(type, url) ? 'Jelentés (PDF)' : 'Csatolmány');

  if (isImage(type, url)) {
    return (
      <div className={`attachment attachment-image${compact ? ' compact' : ''}`}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={label} loading="lazy" />
        </a>
        <div className="attachment-meta">
          <span className="attachment-name">{label}</span>
          {size ? <span className="attachment-size">{formatFileSize(size)}</span> : null}
          {onRemove && (
            <button type="button" className="btn-link-danger" onClick={onRemove}>
              eltávolítás
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`attachment attachment-file${compact ? ' compact' : ''}`}>
      <a className="attachment-link" href={url} target="_blank" rel="noopener noreferrer">
        <span className="attachment-icon">
          <PdfIcon />
        </span>
        <span className="attachment-text">
          <span className="attachment-name">{label}</span>
          <span className="attachment-size">
            {isPdf(type, url) ? 'PDF' : 'Fájl'}
            {size ? ` · ${formatFileSize(size)}` : ''} · megnyitás új lapon
          </span>
        </span>
      </a>
      {onRemove && (
        <button type="button" className="btn-link-danger" onClick={onRemove}>
          eltávolítás
        </button>
      )}
    </div>
  );
}
