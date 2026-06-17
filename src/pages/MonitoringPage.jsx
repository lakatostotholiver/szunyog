import { useState } from 'react';
import { measurements, periodicReport } from '../data/monitoringData';
import MonitoringTable from '../components/MonitoringTable';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function MonitoringPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = measurements[activeIndex];

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
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
          <div className="hero-stats" style={{ marginBottom: '1.75rem', background: 'var(--surface)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem' }}>
            <div className="hero-stat">
              <span className="val">100%</span>
              <span className="lbl">hatékonyság a kezelt pontokon</span>
            </div>
            <div className="hero-stat">
              <span className="val">8</span>
              <span className="lbl">kezelés a 2026-os szezonban</span>
            </div>
            <div className="hero-stat">
              <span className="val">13</span>
              <span className="lbl">monitorozott helyszín</span>
            </div>
            <div className="hero-stat">
              <span className="val">6</span>
              <span className="lbl">bejárás (márc–jún)</span>
            </div>
          </div>

          <div className="method-grid" style={{ marginBottom: '1.75rem' }}>
            <div className="method-card bio">
              <h3>Bti alapú lárvagyérítés</h3>
              <p>
                A <em>Bacillus thuringiensis israelensis</em> (Bti) talajbaktérium fehérjetoxinjait
                juttatják a tenyészőhelyekre. A lárvák táplálkozás közben felveszik a toxinokat,
                amelyek a bélrendszerükben aktiválódnak. Gerincesekre nagyon alacsony kockázatú.
              </p>
            </div>
            <div className="method-card info">
              <h3>Szakértői csapat</h3>
              <p>
                A méréseket és a kezelést akkreditált entomológus szakemberek végzik.
                A mérési jegyzőkönyvek digitális formában elérhetők, és kérésre megtekinthetők.
                (A nálunk rendelkezésre álló példányok digitális másolatok, nem nyomtatott,
                aláírt-pecsételt eredeti dokumentumok.)
              </p>
            </div>
            <div className="method-card warn">
              <h3>Eredmények az élővilágban</h3>
              <p>
                A Duna–Ipoly Nemzeti Park Igazgatóság munkatársai megerősítették, hogy a környező
                településekhez képest jelentősen javult az élővilág állapota. Számos védett faj
                telepedett meg, nőtt a biodiverzitás.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0' }}>
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

          <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            Közzététel: {formatDate(active.publishDate ?? active.reportDate)}
          </p>
        </div>
      </section>

      <section style={{ marginTop: '2.5rem' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-kicker">Szakértői összefoglaló</div>
            <h2 className="section-title">{periodicReport.title}</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Készítette: {periodicReport.period} | NO MOSQUITO Kft.
            </p>
          </div>

          <div className="callout callout-info" style={{ marginTop: '1rem' }}>
            <p><strong>Ökológiai háttér:</strong> {periodicReport.ecologicalSummary}</p>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>Főbb megállapítások</h3>
          <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7, fontSize: '0.92rem' }}>
            {periodicReport.keyFindings.map((f, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>{f}</li>
            ))}
          </ul>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>Azonosított fajok a 2026-os szezonban</h3>
          <div className="method-grid">
            {periodicReport.speciesIdentified.map((s, i) => (
              <div className="method-card bio" key={i}>
                <h3>{s.species}</h3>
                <p><strong>Helyszín:</strong> {s.location}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.note}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>Imágó egyedszám mérés</h3>
          <div className="callout callout-warn">
            <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.7, fontSize: '0.92rem' }}>
              <li>{periodicReport.adultMonitoring.status}</li>
              <li>{periodicReport.adultMonitoring.complaints}</li>
              <li>{periodicReport.adultMonitoring.floodRisk}</li>
            </ul>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>CO₂ csapdázás ütemterve</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            A heti rendszerességű CO₂ csapdázás május 18-tól szeptember 28-ig tart.
            A csapdázás célzottan naplemente körül zajlik, jellemzően néhány órán át –
            a pontos időpont a körülményektől függően változhat. A CO₂ csapdázással
            párhuzamosan humán csípésszámlálás is történik.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {periodicReport.co2TrappingSchedule.map((d, i) => (
              <span key={i} style={{
                background: 'var(--surface)',
                borderRadius: '0.375rem',
                padding: '0.25rem 0.6rem',
                fontSize: '0.78rem',
                border: '1px solid var(--border)',
                fontFamily: 'monospace',
              }}>{d}</span>
            ))}
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>Javaslatok</h3>
          <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7, fontSize: '0.92rem' }}>
            {periodicReport.recommendations.map((r, i) => (
              <li key={i} style={{ marginBottom: '0.4rem' }}>{r}</li>
            ))}
          </ul>

          <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            Forrás: NO MOSQUITO Kft. – Időszakos jelentés, Szeged, 2026. május 31.
          </p>
        </div>
      </section>
    </>
  );
}
