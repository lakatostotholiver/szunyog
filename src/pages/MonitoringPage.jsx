import { useEffect, useState } from 'react';
import {
  kpis,
  periodicReport,
  adultSpeciesMonitoring,
  monitoringMethodLabels,
} from '../data/monitoringData';
import { useAllMeasurements } from '../lib/useAllMeasurements';
import MonitoringTable from '../components/MonitoringTable';
import GocpontKutatasTable from '../components/GocpontKutatasTable';
import { SwipeIcon } from '../components/Icons';
import { SeasonStatusChart, SeasonLarvaeChart } from '../components/SeasonChart';
import { fetchKutatasok } from '../lib/gocpontKutatas';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

const adultSpeciesRows = adultSpeciesMonitoring.records.flatMap((r) =>
  r.species.map((sp, i) => ({
    key: `${r.date}-${r.location}-${sp.name}`,
    date: r.date,
    method: r.method,
    location: r.location,
    isFirst: i === 0,
    rowSpan: r.species.length,
    speciesName: sp.name,
    count: sp.count,
  }))
);

export default function MonitoringPage() {
  const measurements = useAllMeasurements();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = measurements[Math.min(activeIndex, measurements.length - 1)];
  const treatmentsSeason = measurements.reduce(
    (sum, m) => sum + m.results.filter((r) => r.status === 'treated').length,
    0
  );
  const [kutatasok, setKutatasok] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchKutatasok()
        .then((entries) => { if (!cancelled) setKutatasok(entries); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner enter">
          <div className="kicker">Mérési eredmények</div>
          <h1>Területi monitoring adatok</h1>
          <p>
            A lárvasűrűség mérése egységesen 0,5 literes mintavétellel történik, a fejlettséget az L1–L4
            stádiumokban dokumentáljuk. A monitoring a város valamennyi nyilvántartott vízfelületére kiterjed.
          </p>
        </div>
      </div>

      <section>
        <div className="container">
          <div className="stat-strip">
            <div className="hero-stat">
              <span className="val">{treatmentsSeason}</span>
              <span className="lbl">kezelés a 2026-os szezonban</span>
            </div>
            <div className="hero-stat">
              <span className="val">{kpis.totalSites}</span>
              <span className="lbl">monitorozott helyszín</span>
            </div>
            <div className="hero-stat">
              <span className="val">{measurements.length}</span>
              <span className="lbl">bejárás a szezonban</span>
            </div>
          </div>

          <div className="method-grid reveal-group" style={{ marginBottom: '1.75rem' }}>
            <div className="method-card bio reveal">
              <h3>Bti alapú lárvagyérítés</h3>
              <p>
                A <em>Bacillus thuringiensis israelensis</em> (Bti) talajbaktérium fehérjetoxinjait
                juttatják a tenyészőhelyekre. A lárvák táplálkozás közben felveszik a toxinokat,
                amelyek a bélrendszerükben aktiválódnak. Gerincesekre nagyon alacsony kockázatú.
              </p>
            </div>
            <div className="method-card info reveal">
              <h3>Szakértői csapat</h3>
              <p>
                A méréseket akkreditált entomológus szakemberek végzik.
                A mérési jegyzőkönyvek digitális formában elérhetők, és kérésre megtekinthetők.
                (A nálunk rendelkezésre álló példányok digitális másolatok, nem nyomtatott,
                aláírt-pecsételt eredeti dokumentumok.)
              </p>
            </div>
            <div className="method-card warn reveal">
              <h3>Eredmények az élővilágban</h3>
              <p>
                A Duna–Ipoly Nemzeti Park Igazgatóság munkatársai megerősítették, hogy a környező
                településekhez képest jelentősen javult az élővilág állapota. Számos védett faj
                telepedett meg, nőtt a biodiverzitás.
              </p>
            </div>
          </div>

          <h3 className="subsection-title">Szezon áttekintés</h3>
          <div className="chart-grid reveal-group">
            <SeasonStatusChart measurements={measurements} totalSites={kpis.totalSites} className="reveal" />
            <SeasonLarvaeChart measurements={measurements} className="reveal" />
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-kicker">Fajazonosítás</div>
            <h2 className="section-title">{adultSpeciesMonitoring.title}</h2>
            <p className="section-desc">{adultSpeciesMonitoring.description}</p>
          </div>

          <div className="table-wrapper reveal">
            <table>
              <thead>
                <tr>
                  <th>Dátum</th>
                  <th>Módszer</th>
                  <th>Helyszín</th>
                  <th>Faj</th>
                  <th style={{ textAlign: 'center' }}>Egyedszám</th>
                </tr>
              </thead>
              <tbody>
                {adultSpeciesRows.map((row) => (
                  <tr key={row.key}>
                    {row.isFirst && (
                      <>
                        <td rowSpan={row.rowSpan}>{formatDate(row.date)}</td>
                        <td rowSpan={row.rowSpan}>
                          <span className={`badge-method${row.method === 'H' ? ' human' : ''}`}>
                            {monitoringMethodLabels[row.method]}
                          </span>
                        </td>
                        <td rowSpan={row.rowSpan}>{row.location}</td>
                      </>
                    )}
                    <td>{row.speciesName}</td>
                    <td className="num">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-hint"><SwipeIcon /> Görgessen jobbra a további oszlopokért</p>
          <p className="source-note">Forrás: NO MOSQUITO Kft. – 2026. szezon fajazonosítási nyilvántartása.</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-header">
            <div className="section-kicker">Mérési adatok mérésenként</div>
            <h2 className="section-title">Területi bontás egy adott bejáráshoz</h2>
            <p className="section-desc">Válasszon egy dátumot a részletes, helyszínenkénti eredményekhez.</p>
          </div>

          <div className="date-tabs">
            {measurements.map((m, i) => (
              <button
                key={m.surveyDate}
                className={`btn${i === activeIndex ? ' btn-brand' : ' btn-outline'}`}
                onClick={() => setActiveIndex(i)}
              >
                {formatDate(m.surveyDate)}
              </button>
            ))}
          </div>

          <MonitoringTable results={active.results} />

          <div className="callout callout-info" style={{ marginTop: '1rem' }}>
            <p>
              <strong>Összegzés:</strong> {active.summary}
            </p>
          </div>

          <p className="source-note">
            Közzététel: {formatDate(active.publishDate ?? active.reportDate)}
            {active.reportFileUrl && (
              <>
                {' · '}
                <a href={active.reportFileUrl} target="_blank" rel="noopener noreferrer">
                  {active.reportFileName || 'Jelentés megnyitása'}
                </a>
              </>
            )}
          </p>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-kicker">Terepi napló</div>
            <h2 className="section-title">Gócpont-kutatások</h2>
            <p className="section-desc">
              Kollégáink terepi bejárásai során rögzített gócpont-vizsgálatok, percenként frissülnek.
            </p>
          </div>

          <GocpontKutatasTable entries={kutatasok} />
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-header">
            <div className="section-kicker">Szakértői összefoglaló</div>
            <h2 className="section-title">{periodicReport.title}</h2>
            <p className="section-desc">
              Készítette: {periodicReport.period} · NO MOSQUITO Kft.
            </p>
          </div>

          <div className="callout callout-info" style={{ marginTop: '1rem' }}>
            <p><strong>Ökológiai háttér:</strong> {periodicReport.ecologicalSummary}</p>
          </div>

          <h3 className="subsection-title">Főbb megállapítások</h3>
          <ul className="findings-list findings-list-plain">
            {periodicReport.keyFindings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>

          <h3 className="subsection-title">Azonosított fajok a lárvavizsgálatok alapján</h3>
          <div className="method-grid reveal-group">
            {periodicReport.speciesIdentified.map((s, i) => (
              <div className="method-card bio reveal" key={i}>
                <h3>{s.species}</h3>
                <p><strong>Helyszín:</strong> {s.location}</p>
                <p className="method-card-note">{s.note}</p>
              </div>
            ))}
          </div>

          <h3 className="subsection-title">Imágó egyedszám mérés</h3>
          <div className="callout callout-warn">
            <ul className="findings-list findings-list-plain">
              <li>{periodicReport.adultMonitoring.status}</li>
              <li>{periodicReport.adultMonitoring.complaints}</li>
              <li>{periodicReport.adultMonitoring.floodRisk}</li>
            </ul>
          </div>

          <h3 className="subsection-title">CO₂ csapdázás ütemterve</h3>
          <p className="section-desc" style={{ marginBottom: '0.75rem' }}>
            A heti rendszerességű CO₂ csapdázás május 18-tól szeptember 28-ig tart.
            A csapdázás célzottan naplemente körül zajlik, jellemzően néhány órán át –
            a pontos időpont a körülményektől függően változhat. A CO₂ csapdázással
            párhuzamosan humán csípésszámlálás is történik.
          </p>
          <div className="chip-row">
            {periodicReport.co2TrappingSchedule.map((d, i) => (
              <span key={i} className="chip">{d}</span>
            ))}
          </div>

          <h3 className="subsection-title">Javaslatok</h3>
          <ul className="findings-list findings-list-plain">
            {periodicReport.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <p className="source-note">
            Forrás: NO MOSQUITO Kft. – Időszakos jelentés, Szeged, 2026. május 31.
          </p>
        </div>
      </section>
    </>
  );
}
