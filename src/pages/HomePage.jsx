import { Link } from 'react-router-dom';
import { measurements, kpis, periodicReport } from '../data/monitoringData';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function HomePage() {
  const latest = measurements[0];
  const treatedCount = latest.results.filter((r) => r.status === 'treated').length;
  const cleanCount = latest.results.filter((r) => r.status === 'clean').length;
  const totalLarvae = latest.results.reduce((sum, r) => sum + r.larvae, 0);

  return (
    <>
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-kicker">Átláthatósági riport – 2026. szezon</div>
          <h1>Csíplek Törökbálint! – Szúnyogmonitoring</h1>
          <p className="hero-description">
            Törökbálint Város Önkormányzata a lakossággal és az élővilággal szembeni felelősség jegyében{' '}
            <strong>kizárólag biológiai védekezéssel</strong> lép fel a csípőszúnyogok ellen.
            Ez az oldal a mérési eredményeket, a módszer hátterét és a lakossági visszajelzéseket
            mutatja be.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="val">{kpis.totalSites}</span>
              <span className="lbl">monitorozott helyszín</span>
            </div>
            <div className="hero-stat">
              <span className="val">{kpis.latestTreatedSites}</span>
              <span className="lbl">kezelt terület (jún. 14.)</span>
            </div>
            <div className="hero-stat">
              <span className="val">{kpis.totalTreatmentsSeason}</span>
              <span className="lbl">kezelés a szezonban</span>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="container">
          <div className="section-header">
            <div className="section-kicker">Hírfolyam</div>
            <h2 className="section-title">Legfrissebb események</h2>
          </div>

          <div className="news-feed">
            <div className="news-card">
              <div className="news-card-accent" />
              <div className="news-card-body">
                <div className="news-card-meta">
                  <span className="news-card-date">2026. május 31.</span>
                  <span className="news-card-tag" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Időszakos jelentés</span>
                </div>
                <h3>{periodicReport.title}</h3>
                <p>
                  A NO MOSQUITO Kft. elkészítette a 2026-os szezon első időszakos jelentését.
                  Összefoglalja a március 24. és május 31. közötti monitoring eredményeket,
                  a fajbeazonosításokat és az ökológiai paraméterek alakulását.
                </p>
                <div className="news-card-stats">
                  <div className="news-card-stat">
                    <span className="val">98–100%</span>
                    <span className="lbl">kezelési hatékonyság</span>
                  </div>
                  <div className="news-card-stat">
                    <span className="val">3</span>
                    <span className="lbl">azonosított faj</span>
                  </div>
                  <div className="news-card-stat">
                    <span className="val">6</span>
                    <span className="lbl">kezelés a szezonban</span>
                  </div>
                </div>
                <Link to="/monitoring" className="news-card-link">
                  Részletes jelentés megtekintése →
                </Link>
              </div>
            </div>

            <div className="news-card">
              <div className={`news-card-accent${treatedCount > 0 ? ' treated' : ''}`} />
              <div className="news-card-body">
                <div className="news-card-meta">
                  <span className="news-card-date">{formatDate(latest.surveyDate)}</span>
                  <span className="news-card-tag">Mérési eredmény</span>
                  {treatedCount > 0 && (
                    <span className="news-card-tag" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                      Kezelés történt
                    </span>
                  )}
                </div>
                <h3>Monitoring jelentés – {formatDate(latest.surveyDate)}</h3>
                <p>{latest.summary}</p>
                <div className="news-card-stats">
                  <div className="news-card-stat">
                    <span className="val">{treatedCount}</span>
                    <span className="lbl">kezelt helyszín</span>
                  </div>
                  <div className="news-card-stat">
                    <span className="val">{cleanCount}</span>
                    <span className="lbl">tiszta helyszín</span>
                  </div>
                  <div className="news-card-stat">
                    <span className="val">{totalLarvae}</span>
                    <span className="lbl">lárva összesen (db/0,5 l)</span>
                  </div>
                </div>
                <Link to="/monitoring" className="news-card-link">
                  Részletes mérési adatok →
                </Link>
              </div>
            </div>

            {measurements.slice(1).map((m) => {
              const mTreated = m.results.filter((r) => r.status === 'treated').length;
              return (
                <div className="news-card" key={m.surveyDate}>
                  <div className={`news-card-accent${mTreated > 0 ? ' treated' : ''}`} />
                  <div className="news-card-body">
                    <div className="news-card-meta">
                      <span className="news-card-date">{formatDate(m.surveyDate)}</span>
                      <span className="news-card-tag">Mérési eredmény</span>
                    </div>
                    <h3>Monitoring jelentés – {formatDate(m.surveyDate)}</h3>
                    <p>{m.summary}</p>
                    <Link to="/monitoring" className="news-card-link">
                      Mérési adatok megtekintése →
                    </Link>
                  </div>
                </div>
              );
            })}

            <div className="news-card">
              <div className="news-card-accent" />
              <div className="news-card-body">
                <div className="news-card-meta">
                  <span className="news-card-date">2026. március</span>
                  <span className="news-card-tag">Tájékoztatás</span>
                </div>
                <h3>Gyakran ismételt kérdések a biológiai szúnyoggyérítésről</h3>
                <p>
                  A kérdőív kapcsán kiderült, hogy a válaszadók egy része nem tudja pontosan,
                  mit jelent a biológiai szúnyoggyérítés. Összeállítottunk egy tájékoztatót
                  a leggyakoribb kérdésekből.
                </p>
                <Link to="/gyik" className="news-card-link">
                  Gyakori kérdések →
                </Link>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div className="cta-banner">
              <h2>Segítsen Ön is!</h2>
              <p>
                Ha pangóvízben lárvákat vagy szúnyoggócpontot észlel, jelezze az önkormányzatnak!
                Ingyenes Culinex tabletta is igényelhető az e-mail címen.
              </p>
              <div className="cta-buttons">
                <a href="mailto:zoldjovo@torokbalint.hu" className="btn btn-white">
                  Írjon nekünk
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
