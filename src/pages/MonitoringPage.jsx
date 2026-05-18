import { useState } from 'react';
import { measurements } from '../data/monitoringData';
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
              <span className="val">5</span>
              <span className="lbl">kezelés a 2026-os szezonban</span>
            </div>
            <div className="hero-stat">
              <span className="val">13</span>
              <span className="lbl">monitorozott helyszín</span>
            </div>
            <div className="hero-stat">
              <span className="val">3</span>
              <span className="lbl">bejárás (márc–máj)</span>
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
                A mérési jegyzőkönyvek aláírva, pecséttel ellátva az Önkormányzatnál megtekinthetők.
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
    </>
  );
}
