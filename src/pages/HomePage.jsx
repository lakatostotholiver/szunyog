import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { kpis, periodicReport, adultSpeciesMonitoring } from '../data/monitoringData';
import { useAllMeasurements } from '../lib/useAllMeasurements';
import { cikkek } from '../lib/cms';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
}

// A hírfolyam minden eleme (mérési körök + jelentések + tájékoztatók) egyetlen,
// dátum szerint csökkenő sorrendbe rendezett listába kerül, hogy mindig a
// legfrissebb esemény legyen elöl.
function buildNewsEvents(measurements, articles) {
  const events = measurements.map((m, index) => {
    const treated = m.results.filter((r) => r.status === 'treated').length;
    const clean = m.results.filter((r) => r.status === 'clean').length;
    const larvae = m.results.reduce((sum, r) => sum + r.larvae, 0);
    const isNewest = index === 0;

    return {
      key: `meres-${m.id ?? m.surveyDate}`,
      date: m.surveyDate,
      displayDate: formatDate(m.surveyDate),
      tag: 'Mérési eredmény',
      extraTag: treated > 0 ? 'Kezelés történt' : null,
      highlight: treated > 0,
      title: `Monitoring jelentés – ${formatDate(m.surveyDate)}`,
      body: m.summary,
      // A legfrissebb körnél kiemeljük a számokat, a régebbieknél elég a szöveg.
      stats: isNewest
        ? [
            { val: treated, lbl: 'kezelt helyszín' },
            { val: clean, lbl: 'tiszta helyszín' },
            { val: larvae, lbl: 'lárva összesen (db/0,5 l)' },
          ]
        : null,
      linkTo: '/monitoring',
      linkLabel: isNewest ? 'Részletes mérési adatok' : 'Mérési adatok megtekintése',
    };
  });

  const adultDates = adultSpeciesMonitoring.records.map((r) => r.date).sort();
  const adultLatest = adultDates[adultDates.length - 1];
  const adultSpeciesCount = new Set(
    adultSpeciesMonitoring.records.flatMap((r) => r.species.map((s) => s.name))
  ).size;

  events.push(
    {
      key: 'idoszakos-jelentes',
      date: periodicReport.reportDate,
      displayDate: formatDate(periodicReport.reportDate),
      tag: 'Időszakos jelentés',
      tagStyle: { background: 'var(--accent-light)', color: 'var(--accent)' },
      title: periodicReport.title,
      body:
        'A NO MOSQUITO Kft. elkészítette a 2026-os szezon első időszakos jelentését. ' +
        'Összefoglalja a március 24. és május 31. közötti monitoring eredményeket, ' +
        'a fajbeazonosításokat és az ökológiai paraméterek alakulását.',
      stats: [
        { val: '98–100%', lbl: 'kezelési hatékonyság' },
        { val: periodicReport.speciesIdentified.length, lbl: 'azonosított faj' },
      ],
      linkTo: '/monitoring',
      linkLabel: 'Részletes jelentés megtekintése',
    },
    {
      key: 'fajazonositas',
      date: adultLatest,
      displayDate: formatDate(adultLatest),
      tag: 'Fajazonosítás',
      title: adultSpeciesMonitoring.title,
      body: adultSpeciesMonitoring.description,
      stats: [
        { val: adultSpeciesMonitoring.records.length, lbl: 'befogási esemény' },
        { val: adultSpeciesCount, lbl: 'azonosított faj' },
      ],
      linkTo: '/monitoring',
      linkLabel: 'Fajazonosítási adatok megtekintése',
    },
    {
      key: 'gyik',
      date: '2026-03-31',
      displayDate: '2026. március',
      tag: 'Tájékoztatás',
      title: 'Gyakran ismételt kérdések a biológiai szúnyoggyérítésről',
      body:
        'A kérdőív kapcsán kiderült, hogy a válaszadók egy része nem tudja pontosan, ' +
        'mit jelent a biológiai szúnyoggyérítés. Összeállítottunk egy tájékoztatót ' +
        'a leggyakoribb kérdésekből.',
      linkTo: '/gyik',
      linkLabel: 'Gyakori kérdések',
    }
  );

  // Az admin felületen írt cikkek ugyanebbe a folyamba kerülnek, dátum szerint.
  articles.forEach((article) => {
    events.push({
      key: `cikk-${article.id}`,
      date: article.publishDate,
      displayDate: formatDate(article.publishDate),
      tag: article.tag,
      title: article.title,
      body: article.lead || `${article.body.slice(0, 180)}…`,
      linkTo: `/hirek/${article.slug}`,
      linkLabel: 'Tovább olvasom',
    });
  });

  return events.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default function HomePage() {
  const measurements = useAllMeasurements();
  const [articles, setArticles] = useState([]);
  const latest = measurements[0];
  const cleanCount = latest.results.filter((r) => r.status === 'clean').length;
  const treatmentsSeason = measurements.reduce(
    (sum, m) => sum + m.results.filter((r) => r.status === 'treated').length,
    0
  );

  useEffect(() => {
    let cancelled = false;
    cikkek
      .list()
      .then((list) => {
        if (!cancelled) setArticles(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const newsEvents = buildNewsEvents(measurements, articles);

  return (
    <>
      <div className="hero">
        <div className="hero-inner enter">
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
              <span className="val">{cleanCount}</span>
              <span className="lbl">tiszta helyszín ({formatShortDate(latest.surveyDate)})</span>
            </div>
            <div className="hero-stat">
              <span className="val">{treatmentsSeason}</span>
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

          <div className="news-feed reveal-group">
            {newsEvents.map((event) => (
              <div className="news-card reveal" key={event.key}>
                <div className={`news-card-accent${event.highlight ? ' treated' : ''}`} />
                <div className="news-card-body">
                  <div className="news-card-meta">
                    <span className="news-card-date">{event.displayDate}</span>
                    <span className="news-card-tag" style={event.tagStyle}>{event.tag}</span>
                    {event.extraTag && (
                      <span
                        className="news-card-tag"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                      >
                        {event.extraTag}
                      </span>
                    )}
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.body}</p>
                  {event.stats && (
                    <div className="news-card-stats">
                      {event.stats.map((stat) => (
                        <div className="news-card-stat" key={stat.lbl}>
                          <span className="val">{stat.val}</span>
                          <span className="lbl">{stat.lbl}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link to={event.linkTo} className="news-card-link">
                    {event.linkLabel} →
                  </Link>
                </div>
              </div>
            ))}
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
