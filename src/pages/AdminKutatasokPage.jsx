import { useEffect, useState } from 'react';
import AdminShell, { AdminPanel, AdminNotice } from '../components/AdminShell';
import { fetchKutatasok, addKutatas, updateKutatas, deleteKutatas } from '../lib/gocpontKutatas';

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  time: '',
  durationMin: '',
  location: '',
  biteCount: '',
  caughtCount: '',
  biteLoadPerHour: '',
  breedingSites: '',
  treatmentType: '',
  futureActions: '',
  larvaeCollected: 'nem',
  larvaeAmount: '',
  notes: '',
};

function toFormValues(entry) {
  return {
    date: entry.date ?? emptyForm.date,
    time: entry.time && entry.time !== '-' ? entry.time : '',
    durationMin: entry.durationMin ?? '',
    location: entry.location ?? '',
    biteCount: entry.biteCount && entry.biteCount !== '-' ? entry.biteCount : '',
    caughtCount: entry.caughtCount && entry.caughtCount !== '-' ? entry.caughtCount : '',
    biteLoadPerHour: entry.biteLoadPerHour && entry.biteLoadPerHour !== '-' ? entry.biteLoadPerHour : '',
    breedingSites: entry.breedingSites && entry.breedingSites !== '-' ? entry.breedingSites : '',
    treatmentType: entry.treatmentType && entry.treatmentType !== '-' ? entry.treatmentType : '',
    futureActions: entry.futureActions && entry.futureActions !== '-' ? entry.futureActions : '',
    larvaeCollected: entry.larvaeCollected === 'igen' ? 'igen' : 'nem',
    larvaeAmount: entry.larvaeAmount && entry.larvaeAmount !== '-' ? entry.larvaeAmount : '',
    notes: entry.notes && entry.notes !== '-' ? entry.notes : '',
  };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AdminKutatasokPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadEntries = async () => {
    setLoading(true);
    setListError('');
    try {
      const data = await fetchKutatasok();
      setEntries(data);
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

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setForm(toFormValues(entry));
    setError('');
    setSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setSuccess(false);
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Biztosan törlöd a(z) ${formatDate(entry.date)} – ${entry.location} bejegyzést?`)) {
      return;
    }
    setDeletingId(entry.id);
    try {
      await deleteKutatas(entry.id);
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
    setSuccess(false);

    if (!form.date) {
      setError('Kérlek add meg a mérés dátumát.');
      return;
    }
    if (!form.location.trim()) {
      setError('Kérlek add meg a helyszínt.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateKutatas(editingId, form);
        setSuccess(true);
        setEditingId(null);
        setForm(emptyForm);
      } else {
        await addKutatas(form);
        setForm({ ...emptyForm, date: form.date });
        setSuccess(true);
      }
      await loadEntries();
    } catch (err) {
      console.error(err);
      setError(editingId ? 'Nem sikerült frissíteni a bejegyzést. Kérlek próbáld újra.' : 'Nem sikerült elmenteni a bejegyzést. Kérlek próbáld újra.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <AdminShell
      title="Gócpont-kutatások"
      intro="Terepi csípésszámlálásos mérések. A Mérések oldal „Gócpont-kutatások” szekciójában jelennek meg."
    >

        <section className="admin-panel">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Bejegyzés szerkesztése' : 'Új bejegyzés rögzítése'}</h2>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Dátum</label>
              <input id="date" type="date" value={form.date} onChange={update('date')} required />
            </div>
            <div className="form-field">
              <label htmlFor="time">Óra:perc</label>
              <input id="time" type="time" value={form.time} onChange={update('time')} />
            </div>
            <div className="form-field">
              <label htmlFor="durationMin">Mérés ideje (perc)</label>
              <input id="durationMin" type="number" min="0" value={form.durationMin} onChange={update('durationMin')} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="location">Helyszín</label>
            <input id="location" type="text" placeholder="Pl. Séta u. 34/B" value={form.location} onChange={update('location')} required />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="biteCount">Csípés-szám</label>
              <input id="biteCount" type="text" placeholder="Pl. 8 vagy „nem számoltuk”" value={form.biteCount} onChange={update('biteCount')} />
            </div>
            <div className="form-field">
              <label htmlFor="caughtCount">Befogott szúnyog (db)</label>
              <input id="caughtCount" type="text" value={form.caughtCount} onChange={update('caughtCount')} />
            </div>
            <div className="form-field">
              <label htmlFor="biteLoadPerHour">Csípésterhelés (db/óra)</label>
              <input id="biteLoadPerHour" type="text" value={form.biteLoadPerHour} onChange={update('biteLoadPerHour')} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="breedingSites">Szúnyogkeltető helyek (típus, db)</label>
            <textarea id="breedingSites" rows={2} value={form.breedingSites} onChange={update('breedingSites')} />
          </div>

          <div className="form-field">
            <label htmlFor="treatmentType">Kezelés típusa</label>
            <input id="treatmentType" type="text" value={form.treatmentType} onChange={update('treatmentType')} />
          </div>

          <div className="form-field">
            <label htmlFor="futureActions">Jövőbeni intézkedések</label>
            <textarea id="futureActions" rows={2} value={form.futureActions} onChange={update('futureActions')} />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="larvaeCollected">Lárvagyűjtés történt-e</label>
              <select id="larvaeCollected" value={form.larvaeCollected} onChange={update('larvaeCollected')}>
                <option value="nem">Nem</option>
                <option value="igen">Igen</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="larvaeAmount">Lárvagyűjtés mennyisége</label>
              <input id="larvaeAmount" type="text" placeholder="Pl. sok, ~300 db/l" value={form.larvaeAmount} onChange={update('larvaeAmount')} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="notes">Megjegyzés</label>
            <textarea id="notes" rows={3} value={form.notes} onChange={update('notes')} />
          </div>

          <AdminNotice tone="error">{error}</AdminNotice>
          {success && (
            <AdminNotice tone="info">A bejegyzés elmentve, azonnal megjelenik a Mérések oldalon.</AdminNotice>
          )}

          <div className="form-actions">
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={cancelEdit} disabled={submitting}>
                Mégse
              </button>
            )}
            <button type="submit" className="btn btn-brand" disabled={submitting}>
              {submitting ? 'Mentés…' : editingId ? 'Frissítés' : 'Bejegyzés mentése'}
            </button>
          </div>
        </form>
        </section>

        <section className="admin-panel">
        <h2 className="admin-list-heading">Eddigi bejegyzések ({entries.length})</h2>
        <AdminNotice tone="error">{listError}</AdminNotice>
        {loading ? (
          <p>Betöltés…</p>
        ) : entries.length === 0 ? (
          <p>Még nincs rögzített terepi gócpont-kutatás.</p>
        ) : (
          <div className="table-wrapper reveal">
            <table>
              <thead>
                <tr>
                  <th>Dátum</th>
                  <th>Helyszín</th>
                  <th style={{ textAlign: 'center' }}>Csípés-szám</th>
                  <th>Lárvagyűjtés</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className={editingId === entry.id ? 'admin-row-editing' : ''}>
                    <td>{formatDate(entry.date)}</td>
                    <td>{entry.location}</td>
                    <td className="num">{entry.biteCount}</td>
                    <td>{entry.larvaeCollected === 'igen' ? `Igen – ${entry.larvaeAmount}` : 'Nem'}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button type="button" className="btn btn-outline" onClick={() => startEdit(entry)}>
                          Szerkesztés
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
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
        </section>
    </AdminShell>
  );
}
