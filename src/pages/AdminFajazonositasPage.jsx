import AdminShell, { AdminPanel, AdminNotice } from '../components/AdminShell';
import { fajazonositas } from '../lib/cms';
import { useCrudPage } from '../lib/useCrudPage';

const METHOD_LABEL = { CO2: 'CO₂-csapda', H: 'Csípésszámlálás' };

// Gyakran előforduló fajok – gépelés helyett választható, de szabadon írható is.
const COMMON_SPECIES = [
  'Culex pipiens (Házi szúnyog)',
  'Aedes koreicus (Koreai szúnyog)',
  'Aedes japonicus (Japán szúnyog)',
  'Aedes koreicus / japonicus',
  'Ochlerotatus sp. (Erdei szúnyog)',
  'Anopheles sp.',
];

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  method: 'CO2',
  location: '',
  note: '',
  species: [{ name: '', count: '' }],
});

const toFormValues = (entry) => ({
  date: entry.date ?? '',
  method: entry.method ?? 'CO2',
  location: entry.location ?? '',
  note: entry.note ?? '',
  species: entry.species?.length
    ? entry.species.map((s) => ({ name: s.name, count: String(s.count ?? '') }))
    : [{ name: '', count: '' }],
});

function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AdminFajazonositasPage() {
  const crud = useCrudPage(fajazonositas, emptyForm, toFormValues, {
    successText: {
      created: 'A befogási adat elmentve – megjelenik a Mérések oldalon.',
      updated: 'A befogási adat frissítve.',
    },
  });
  const { form, setForm, field } = crud;

  const updateSpecies = (index, patch) =>
    setForm((f) => ({
      ...f,
      species: f.species.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));

  const addSpecies = () =>
    setForm((f) => ({ ...f, species: [...f.species, { name: '', count: '' }] }));

  const removeSpecies = (index) =>
    setForm((f) => ({
      ...f,
      species: f.species.length > 1 ? f.species.filter((_, i) => i !== index) : f.species,
    }));

  const total = form.species.reduce((sum, s) => sum + (Number(s.count) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location.trim()) {
      crud.setError('Kérlek add meg a helyszínt.');
      return;
    }
    if (!form.species.some((s) => s.name.trim())) {
      crud.setError('Legalább egy fajt meg kell adni.');
      return;
    }
    await crud.save({
      ...form,
      species: form.species.filter((s) => s.name.trim()),
    });
  };

  return (
    <AdminShell
      title="Fajazonosítás"
      intro="A CO₂-csapdázás és a csípésszámlálásos befogás eredményei. Ami itt elmentesz, az a Mérések oldal „Imágó fajazonosítás” táblázatában jelenik meg."
    >
      <AdminPanel
        title={crud.editingId ? 'Befogás szerkesztése' : 'Új befogás rögzítése'}
        description="Egy befogási eseményhez több faj is tartozhat – az összes egyedszám automatikusan összeadódik."
      >
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Dátum</label>
              <input id="date" type="date" value={form.date} onChange={field('date')} required />
            </div>
            <div className="form-field">
              <label htmlFor="method">Módszer</label>
              <select id="method" value={form.method} onChange={field('method')}>
                <option value="CO2">CO₂-csapda</option>
                <option value="H">Csípésszámlálás</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="location">Helyszín</label>
              <input
                id="location"
                type="text"
                placeholder="Pl. Katona József utca"
                value={form.location}
                onChange={field('location')}
                required
              />
            </div>
          </div>

          <fieldset className="admin-fieldset">
            <legend>Befogott fajok</legend>
            <datalist id="common-species">
              {COMMON_SPECIES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>

            {form.species.map((sp, i) => (
              <div className="admin-repeat-row" key={i}>
                <div className="form-field admin-repeat-grow">
                  <label htmlFor={`sp-name-${i}`}>Faj neve</label>
                  <input
                    id={`sp-name-${i}`}
                    type="text"
                    list="common-species"
                    placeholder="Kezdj gépelni, vagy válassz"
                    value={sp.name}
                    onChange={(e) => updateSpecies(i, { name: e.target.value })}
                  />
                </div>
                <div className="form-field admin-repeat-narrow">
                  <label htmlFor={`sp-count-${i}`}>Egyedszám</label>
                  <input
                    id={`sp-count-${i}`}
                    type="number"
                    min="0"
                    value={sp.count}
                    onChange={(e) => updateSpecies(i, { count: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: '1.6rem' }}
                  onClick={() => removeSpecies(i)}
                  disabled={form.species.length === 1}
                >
                  Sor törlése
                </button>
              </div>
            ))}

            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={addSpecies}>
                + További faj
              </button>
              <span className="admin-hint">Összesen: <strong>{total}</strong> egyed</span>
            </div>
          </fieldset>

          <div className="form-field">
            <label htmlFor="note">Megjegyzés (nem kötelező)</label>
            <textarea id="note" rows={2} value={form.note} onChange={field('note')} />
          </div>

          <AdminNotice tone="error">{crud.error}</AdminNotice>
          <AdminNotice tone="info">{crud.success}</AdminNotice>

          <div className="form-actions">
            {crud.editingId && (
              <button type="button" className="btn btn-outline" onClick={crud.cancelEdit} disabled={crud.saving}>
                Mégse
              </button>
            )}
            <button type="submit" className="btn btn-brand" disabled={crud.saving}>
              {crud.saving ? 'Mentés…' : crud.editingId ? 'Módosítás mentése' : 'Befogás mentése'}
            </button>
          </div>
        </form>
      </AdminPanel>

      <AdminPanel title={`Rögzített befogások (${crud.entries.length})`}>
        {crud.loading ? (
          <p className="admin-empty">Betöltés…</p>
        ) : crud.entries.length === 0 ? (
          <p className="admin-empty">Még nincs rögzített befogás.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Dátum</th>
                  <th>Módszer</th>
                  <th>Helyszín</th>
                  <th>Fajok</th>
                  <th style={{ textAlign: 'center' }}>Összes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {crud.entries.map((entry) => (
                  <tr key={entry.id} className={crud.editingId === entry.id ? 'admin-row-editing' : ''}>
                    <td>{formatDate(entry.date)}</td>
                    <td>{METHOD_LABEL[entry.method] ?? entry.method}</td>
                    <td>{entry.location}</td>
                    <td>
                      {entry.species.map((s) => (
                        <div key={s.name}>
                          {s.name} <strong>{s.count}</strong>
                        </div>
                      ))}
                    </td>
                    <td className="num">{entry.total}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button type="button" className="btn btn-outline" onClick={() => crud.startEdit(entry)}>
                          Szerkesztés
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() =>
                            crud.remove(entry, `Biztosan törlöd a(z) ${formatDate(entry.date)} – ${entry.location} befogást?`)
                          }
                          disabled={crud.deletingId === entry.id}
                        >
                          {crud.deletingId === entry.id ? 'Törlés…' : 'Törlés'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </AdminShell>
  );
}
