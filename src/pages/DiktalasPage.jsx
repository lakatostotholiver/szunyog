import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as logoutDiktalas } from '../lib/diktalasAuth';
import { addKutatas } from '../lib/gocpontKutatas';

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

export default function DiktalasPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

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
      await addKutatas(form);
      setForm({ ...emptyForm, date: form.date });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Nem sikerült elmenteni a bejegyzést. Kérlek próbáld újra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutDiktalas();
    navigate('/diktalas-belepes', { replace: true });
  };

  return (
    <div className="page-header">
      <div className="page-header-inner enter">
        <div className="kicker">Kollégáknak</div>
        <h1>Gócpont-kutatás rögzítése</h1>
      </div>

      <div className="container" style={{ maxWidth: 720, marginTop: '1.5rem' }}>
        <div className="form-actions" style={{ marginBottom: '1.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>Kijelentkezés</button>
        </div>

        <form className="auth-form card" onSubmit={handleSubmit}>
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

          {error && <p className="form-error">{error}</p>}
          {success && (
            <div className="callout callout-info">
              <p>A bejegyzés elmentve, azonnal megjelenik a Mérések oldalon.</p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-brand" disabled={submitting}>
              {submitting ? 'Mentés…' : 'Bejegyzés mentése'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
