import { useEffect, useMemo, useState } from 'react';
import { egyeniGocpontok } from '../lib/cms';
import Lightbox from '../components/Lightbox';

function formatMonth(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });
}

export default function GocpontPeldakPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('mind');
  const [viewer, setViewer] = useState({ photos: [], index: null });

  useEffect(() => {
    let cancelled = false;
    egyeniGocpontok
      .list()
      .then((list) => {
        if (!cancelled) setCases(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const types = useMemo(
    () => ['mind', ...new Set(cases.map((c) => c.breedingSiteType).filter(Boolean))],
    [cases]
  );

  const visible = filter === 'mind' ? cases : cases.filter((c) => c.breedingSiteType === filter);

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner enter">
          <div className="kicker">Lakosságnak</div>
          <h1>Gócpont-példák</h1>
          <p>
            Valódi, törökbálinti háztartásoknál talált szúnyoggócpontok – tanulságként. A
            szúnyogok többsége nem a nagy vizekből, hanem az udvarokban álló néhány deciliternyi
            pangó vízből kel ki, ezért ezeken a példákon sok múlik.
          </p>
        </div>
      </div>

      <section>
        <div className="container">
          <div className="callout callout-info" style={{ marginBottom: '1.5rem' }}>
            <p>
              <strong>Adatvédelem:</strong> ezek az esetek a lakók hozzájárulásával, névtelenül
              jelennek meg. Pontos cím és személyes adat nem kerül nyilvánosságra – csak a
              városrész, hogy lássa: ez a környékén is előfordul.
            </p>
          </div>

          {loading ? (
            <p>Betöltés…</p>
          ) : cases.length === 0 ? (
            <p>Jelenleg nincs megosztott eset.</p>
          ) : (
            <>
              {types.length > 2 && (
                <div className="date-tabs">
                  {types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`btn ${filter === t ? 'btn-brand' : 'btn-outline'}`}
                      onClick={() => setFilter(t)}
                    >
                      {t === 'mind' ? 'Mind' : t}
                    </button>
                  ))}
                </div>
              )}

              <div className="case-grid reveal-group">
                {visible.map((item) => (
                  <article className="case-card reveal" key={item.id}>
                    {item.photos?.length > 0 && (
                      <div className="case-card-photos">
                        {item.photos.slice(0, 3).map((photo, i) => (
                          <button
                            type="button"
                            className="case-photo"
                            key={photo.url}
                            onClick={() => setViewer({ photos: item.photos, index: i })}
                            aria-label={`${photo.caption || item.breedingSiteType} – nagyítás`}
                          >
                            <img src={photo.url} alt={photo.caption || item.breedingSiteType} loading="lazy" />
                            {photo.caption && <span className="case-photo-caption">{photo.caption}</span>}
                            {i === 2 && item.photos.length > 3 && (
                              <span className="case-photo-more">+{item.photos.length - 3}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="case-card-body">
                      <div className="case-card-meta">
                        <span className="news-card-tag">{item.district}</span>
                        <span>{formatMonth(item.date)}</span>
                      </div>

                      <h2>{item.breedingSiteType}</h2>
                      {item.propertyType && <p className="case-card-sub">{item.propertyType}</p>}

                      <dl className="case-facts">
                        <div>
                          <dt>Lárva</dt>
                          <dd>
                            {item.larvaeFound === 'igen'
                              ? item.larvaeAmount
                                ? `Igen – ${item.larvaeAmount}`
                                : 'Igen'
                              : 'Nem található'}
                          </dd>
                        </div>
                        {item.containerCount ? (
                          <div>
                            <dt>Érintett edény</dt>
                            <dd>{item.containerCount} db</dd>
                          </div>
                        ) : null}
                        {item.speciesGuess && (
                          <div>
                            <dt>Faj</dt>
                            <dd>{item.speciesGuess}</dd>
                          </div>
                        )}
                      </dl>

                      {item.treatment && (
                        <p className="case-card-text">
                          <strong>Kezelés:</strong> {item.treatment}
                        </p>
                      )}
                      {item.advice && (
                        <p className="case-advice">
                          <strong>Tanulság:</strong> {item.advice}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Lightbox
        photos={viewer.photos}
        index={viewer.index}
        onClose={() => setViewer({ photos: [], index: null })}
        onNavigate={(index) => setViewer((v) => ({ ...v, index }))}
      />
    </>
  );
}
