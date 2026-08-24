import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../lib/adminAuth';
import { ADMIN_ROUTES } from '../lib/adminRoutes';
import { fetchMeresek, addMeres, updateMeres, deleteMeres, uploadFile } from '../lib/meresek';
import { monitoringSites, statusLabels } from '../data/monitoringData';

const STAGE_OPTIONS = ['L1', 'L2', 'L3', 'L4'];

const blankResults = () =>
  monitoringSites.map((site) => ({ siteCode: site.code, larvae: 0, stages: [], status: 'clean' }));

const emptyForm = () => ({
  surveyDate: new Date().toISOString().slice(0, 10),
  reportDate: '',
  publishDate: '',
  summary: '',
  reportFileUrl: null,
  reportFileName: null,
  results: blankResults(),
});

function toFormValues(entry) {
  const byCode = new Map((entry.results ?? []).map((r) => [r.siteCode, r]));
  return {
    surveyDate: entry.surveyDate ?? '',
    reportDate: entry.reportDate ?? '',
    publishDate: entry.publishDate ?? '',
    summary: entry.summary ?? '',
    reportFileUrl: entry.reportFileUrl ?? null,
    reportFileName: entry.reportFileName ?? null,
    results: monitoringSites.map((site) => {
      const existing = byCode.get(site.code);
      return existing
        ? {
            siteCode: site.code,
            larvae: existing.larvae ?? 0,
            stages: existing.stages ?? [],
            status: existing.status ?? 'clean',
          }
        : { siteCode: site.code, larvae: 0, stages: [], status: 'clean' };
    }),
  };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AdminMeresekPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadEntries = async () => {
    setLoading(true);
    setListError('');
    try {
      setEntries(await fetchMeresek());
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateResult = (siteCode, patch) =>
    setForm((f) => ({
      ...f,
      results: f.results.map((r) => (r.siteCode === siteCode ? { ...r, ...patch } : r)),
    }));

  const toggleStage = (siteCode, stage) =>
    setForm((f) => ({
      ...f,
      results: f.results.map((r) => {
        if (r.siteCode !== siteCode) return r;
        const stages = r.stages.includes(stage)
          ? r.stages.filter((s) => s !== stage)
          : [...r.stages, stage].sort();
        return { ...r, stages };
      }),
    }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url, name } = await uploadFile(file);
      setForm((f) => ({ ...f, reportFileUrl: url, reportFileName: name }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setForm(toFormValues(entry));
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
    setSuccess('');
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Biztosan törlöd a(z) ${formatDate(entry.surveyDate)} mérési kört?`)) return;
    setDeletingId(entry.id);
    try {
      await deleteMeres(entry.id);
      if (editingId === entry.id) cancelEdit();
      await loadEntries();
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.surveyDate) {
      setError('Kérlek add meg a bejárás dátumát.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateMeres(editingId, form);
        setSuccess('A mérési kör frissítve – azonnal látszik a Főoldalon és a Mérések oldalon.');
        setEditingId(null);
      } else {
        await addMeres(form);
        setSuccess('A mérési kör elmentve – azonnal látszik a Főoldalon és a Mérések oldalon.');
      }
      setForm(emptyForm());
      await loadEntries();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ADMIN_ROUTES.login, { replace: true });
  };

  return (
    <div className="page-header">
      <div className="page-header-inner enter">
        <div className="kicker">Kollégáknak</div>
        <h1>Mérési körök kezelése</h1>
        <p>
          Itt vihetsz fel egy új bejárást a NO MOSQUITO jelentés alapján. Ami itt elmentesz, az
          azonnal megjelenik a Főoldalon és a Mérések oldalon – nem kell hozzá fejlesztő.
        </p>
      </div>

      <div className="container" style={{ maxWidth: 960, marginTop: '1.5rem' }}>
        <div className="form-actions" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
          <Link to={ADMIN_ROUTES.base} className="btn btn-outline">&larr; Admin felület</Link>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>Kijelentkezés</button>
        </div>

        <form className="auth-form card" onSubmit={handleSubmit}>
          <h2 style={{ marginTop: 0 }}>{editingId ? 'Mérési kör szerkesztése' : 'Új mérési kör'}</h2>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="surveyDate">Bejárás dátuma</label>
              <input id="surveyDate" type="date" value={form.surveyDate} onChange={update('surveyDate')} required />
            </div>
            <div className="form-field">
              <label htmlFor="reportDate">Jelentés dátuma</label>
              <input id="reportDate" type="date" value={form.reportDate} onChange={update('reportDate')} />
            </div>
            <div className="form-field">
              <label htmlFor="publishDate">Közzététel dátuma</label>
              <input id="publishDate" type="date" value={form.publishDate} onChange={update('publishDate')} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="summary">Összefoglaló szöveg</label>
            <textarea
              id="summary"
              rows={4}
              placeholder="Pl. Az augusztus 18-i monitoring eredmények alapján…"
              value={form.summary}
              onChange={update('summary')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reportFile">Jelentés fájl (PDF vagy kép, max. 10 MB)</label>
            <input id="reportFile" type="file" accept=".pdf,image/*" onChange={handleFileChange} disabled={uploading} />
            {uploading && <p className="admin-upload-status">Feltöltés folyamatban…</p>}
            {form.reportFileUrl && (
              <p className="admin-upload-status">
                Csatolva:{' '}
                <a href={form.reportFileUrl} target="_blank" rel="noopener noreferrer">
                  {form.reportFileName || 'megnyitás'}
                </a>{' '}
                <button
                  type="button"
                  className="btn-link-danger"
                  onClick={() => setForm((f) => ({ ...f, reportFileUrl: null, reportFileName: null }))}
                >
                  eltávolítás
                </button>
              </p>
            )}
          </div>

          <h3 style={{ marginBottom: 0 }}>Helyszínenkénti eredmények</h3>
          <div className="table-wrapper">
            <table className="admin-results-table">
              <thead>
                <tr>
                  <th>Helyszín</th>
                  <th style={{ textAlign: 'center' }}>Lárva (db/0,5 l)</th>
                  <th>Állapot</th>
                  <th>Fejlettség</th>
                </tr>
              </thead>
              <tbody>
                {form.results.map((result) => {
                  const site = monitoringSites.find((s) => s.code === result.siteCode);
                  return (
                    <tr key={result.siteCode}>
                      <td>
                        <strong>{result.siteCode}</strong>
                        <br />
                        <span className="admin-site-name">{site?.name}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="admin-narrow-input"
                          value={result.larvae}
                          onChange={(e) => updateResult(result.siteCode, { larvae: e.target.value })}
                          aria-label={`${result.siteCode} lárvaszám`}
                        />
                      </td>
                      <td>
                        <select
                          value={result.status}
                          onChange={(e) => updateResult(result.siteCode, { status: e.target.value })}
                          aria-label={`${result.siteCode} állapot`}
                        >
                          {Object.entries(statusLabels).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="admin-stage-toggles">
                          {STAGE_OPTIONS.map((stage) => (
                            <label key={stage} className="admin-stage-toggle">
                              <input
                                type="checkbox"
                                checked={result.stages.includes(stage)}
                                onChange={() => toggleStage(result.siteCode, stage)}
                              />
                              {stage}
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && (
            <div className="callout callout-info">
              <p>{success}</p>
            </div>
          )}

          <div className="form-actions">
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={cancelEdit} disabled={submitting}>
                Mégse
              </button>
            )}
            <button type="submit" className="btn btn-brand" disabled={submitting || uploading}>
              {submitting ? 'Mentés…' : editingId ? 'Frissítés' : 'Mérési kör mentése'}
            </button>
          </div>
        </form>

        <h2 style={{ marginTop: '2.5rem' }}>Felvitt mérési körök ({entries.length})</h2>
        <p className="admin-hint">
          A 2026-os szezon korábbi, kódban rögzített bejárásai külön jelennek meg az oldalon – itt
          csak az admin felületen felvitt körök szerkeszthetők.
        </p>
        {listError && <p className="form-error">{listError}</p>}
        {loading ? (
          <p>Betöltés…</p>
        ) : entries.length === 0 ? (
          <p>Még nincs admin felületen felvitt mérési kör.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Bejárás</th>
                  <th style={{ textAlign: 'center' }}>Kezelt helyszín</th>
                  <th>Jelentés</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className={editingId === entry.id ? 'admin-row-editing' : ''}>
                    <td>{formatDate(entry.surveyDate)}</td>
                    <td className="num">
                      {(entry.results ?? []).filter((r) => r.status === 'treated').length}
                    </td>
                    <td>
                      {entry.reportFileUrl ? (
                        <a href={entry.reportFileUrl} target="_blank" rel="noopener noreferrer">
                          {entry.reportFileName || 'megnyitás'}
                        </a>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button type="button" className="btn btn-outline" onClick={() => startEdit(entry)}>
                          Szerkesztés
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleDelete(entry)}
                          disabled={deletingId === entry.id}
                        >
                          {deletingId === entry.id ? 'Törlés…' : 'Törlés'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
