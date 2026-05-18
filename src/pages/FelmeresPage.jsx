import { surveyData } from '../data/monitoringData';

function BarChart({ items, valueKey = 'pct', labelKey = 'name', maxValue = 100, suffix = '%' }) {
  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div className="bar-row" key={item[labelKey]}>
          <span className="bar-label">{item[labelKey]}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
            />
          </div>
          <span className="bar-value">
            {typeof item[valueKey] === 'number' && item[valueKey] % 1 !== 0
              ? item[valueKey].toFixed(1)
              : item[valueKey]}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

function LikertBar({ item }) {
  return (
    <div className="likert-item">
      <div className="likert-label">{item.label}</div>
      <div className="likert-bar">
        <div className="likert-disagree" style={{ width: `${item.disagree}%` }}>
          {item.disagree >= 10 && `${item.disagree}%`}
        </div>
        <div className="likert-neutral" style={{ width: `${item.neutral}%` }}>
          {item.neutral >= 8 && `${item.neutral}%`}
        </div>
        <div className="likert-agree" style={{ width: `${item.agree}%` }}>
          {item.agree >= 10 && `${item.agree}%`}
        </div>
      </div>
      <div className="likert-avg">Átlag: {item.avg.toFixed(2)}</div>
    </div>
  );
}

export default function FelmeresPage() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div className="kicker">Korábbi felmérés</div>
          <h1>Szúnyoggyérítési lakossági felmérés eredményei</h1>
          <p>
            {surveyData.period} – {surveyData.respondents} kitöltő. A felmérés célja a lakosság
            szúnyogproblémával kapcsolatos tapasztalatainak és véleményének feltérképezése volt.
          </p>
        </div>
      </div>

      <section>
        <div className="container">
          <h2>Legfontosabb számok</h2>
          <div className="findings-grid">
            <div className="finding-card">
              <span className="finding-number">{surveyData.respondents}</span>
              <span className="finding-text">kitöltő</span>
            </div>
            <div className="finding-card">
              <span className="finding-number">76,2%</span>
              <span className="finding-text">szerint nem elég a háztartási védekezés</span>
            </div>
            <div className="finding-card">
              <span className="finding-number">60,2%</span>
              <span className="finding-text">használna kedvezményes Bti-tablettát</span>
            </div>
            <div className="finding-card">
              <span className="finding-number">55,3%</span>
              <span className="finding-text">a kertjében tapasztalja a legtöbb csípést</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <h2>Részletes eredmények</h2>
          <div className="survey-grid">
            <div className="survey-card">
              <h3>Legproblémásabb területek</h3>
              <BarChart items={surveyData.problematicAreas} />
            </div>
            <div className="survey-card">
              <h3>Csípések napszak szerint</h3>
              <BarChart items={surveyData.biteTimes} labelKey="time" />
            </div>
            <div className="survey-card">
              <h3>Havi átlagos intenzitás (1–6 skála)</h3>
              <BarChart
                items={surveyData.monthlyIntensity}
                labelKey="month"
                valueKey="avg"
                maxValue={6}
                suffix=""
              />
            </div>
            <div className="survey-card">
              <h3>Csípések helyszíne</h3>
              <BarChart items={surveyData.biteLocations} labelKey="place" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>Vélemények (Likert-skála)</h2>
          <p style={{ marginBottom: '1.25rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
            1 = egyáltalán nem ért egyet &middot; 5 = teljes mértékben egyetért
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.85rem', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent)', borderRadius: 2 }} />
              Nem ért egyet
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#d97706', borderRadius: 2 }} />
              Semleges
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--brand-mid)', borderRadius: 2 }} />
              Egyetért
            </span>
          </div>
          {surveyData.likertItems.map((item, i) => (
            <LikertBar key={i} item={item} />
          ))}
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <h2>Kiemelt megállapítások</h2>
          <ol className="findings-list">
            {surveyData.keyFindings.map((finding, i) => (
              <li key={i}>{finding}</li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>Javasolt intézkedési terv</h2>
          <div className="action-plan">
            {surveyData.actionPlan.map((item, i) => (
              <div className="action-card" key={i}>
                <h3>
                  {i + 1}. {item.title}
                </h3>
                <p>
                  <strong>Probléma:</strong> {item.problem}
                </p>
                <p>
                  <strong>Intézkedés:</strong> {item.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="callout">
            <h3>Módszertani megjegyzés</h3>
            <p>
              A felmérés {surveyData.period}-ben készült, {surveyData.respondents} kitöltővel, online kérdőíves
              formában. A válaszok szubjektív lakossági tapasztalatokat tükröznek, nem mért entomológiai adatokat.
              A részletes elemzés szerzője: {surveyData.author}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
