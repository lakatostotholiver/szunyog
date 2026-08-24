import AdminShell, { AdminPanel, AdminNotice } from '../components/AdminShell';
import { egyeniGocpontok, uploadFile } from '../lib/cms';
import { useCrudPage } from '../lib/useCrudPage';

const DISTRICTS = [
  'Újtelep',
  'MÁV-telep',
  'Ófalu',
  'Tükörhegy',
  'Annahegy',
  'Rudák-telep',
  'Városközpont',
  'Józsefhegy',
  'Egyéb / nem megadott',
];

const PROPERTY_TYPES = ['Családi ház, kert', 'Társasház', 'Nyaraló / hétvégi ház', 'Telek', 'Egyéb'];

const BREEDING_TYPES = [
  'Esővízgyűjtő hordó',
  'Virágcserép alátét',
  'Eldobott gumiabroncs',
  'Eltömődött ereszcsatorna',
  'Letakaratlan medence / dézsa',
  'Vödör, kanna, egyéb tárolóedény',
  'Kerti tó',
  'Egyéb pangó víz',
];

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  district: DISTRICTS[0],
  address: '',
  contactName: '',
  contactPhone: '',
  internalNote: '',
  propertyType: PROPERTY_TYPES[0],
  breedingSiteType: BREEDING_TYPES[0],
  containerCount: '',
  larvaeFound: 'igen',
  larvaeAmount: '',
  speciesGuess: '',
  treatment: '',
  advice: '',
  photos: [],
  shared: false,
});

const toFormValues = (entry) => ({
  date: entry.date ?? '',
  district: entry.district ?? DISTRICTS[0],
  address: entry.address ?? '',
  contactName: entry.contactName ?? '',
  contactPhone: entry.contactPhone ?? '',
  internalNote: entry.internalNote ?? '',
  propertyType: entry.propertyType ?? PROPERTY_TYPES[0],
  breedingSiteType: entry.breedingSiteType ?? BREEDING_TYPES[0],
  containerCount: entry.containerCount ?? '',
  larvaeFound: entry.larvaeFound === 'nem' ? 'nem' : 'igen',
  larvaeAmount: entry.larvaeAmount ?? '',
  speciesGuess: entry.speciesGuess ?? '',
  treatment: entry.treatment ?? '',
  advice: entry.advice ?? '',
  photos: entry.photos ?? [],
  shared: entry.shared === true,
});

function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AdminEgyeniGocpontokPage() {
  const crud = useCrudPage(egyeniGocpontok, emptyForm, toFormValues, {
    successText: {
      created: 'A vizsgálat elmentve.',
      updated: 'A vizsgálat frissítve.',
    },
  });
  const { form, setForm, field } = crud;

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    crud.setError('');
    try {
      const uploaded = [];
      for (const file of files.slice(0, 8 - form.photos.length)) {
        const { url } = await uploadFile(file);
        uploaded.push({ url, caption: '' });
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...uploaded].slice(0, 8) }));
    } catch (err) {
      crud.setError(err.message);
    } finally {
      e.target.value = '';
    }
  };

  const updateCaption = (index, caption) =>
    setForm((f) => ({
      ...f,
      photos: f.photos.map((p, i) => (i === index ? { ...p, caption } : p)),
    }));

  const removePhoto = (index) =>
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.district) {
      crud.setError('Válassz városrészt.');
      return;
    }
    await crud.save({ ...form, shared: form.shared === true });
  };

  return (
    <AdminShell
      title="Egyéni gócpont-vizsgálatok"
      intro="Háztartásoknál végzett helyszíni vizsgálatok fotókkal. A pontos cím és a kapcsolattartó adatai kizárólag itt, az admin felületen láthatók – a nyilvános oldalra soha nem kerülnek ki."
    >
      <AdminPanel
        title={crud.editingId ? 'Vizsgálat szerkesztése' : 'Új vizsgálat rögzítése'}
      >
        <form className="admin-form" onSubmit={handleSubmit}>
          <fieldset className="admin-fieldset">
            <legend>Bizalmas – csak admin</legend>
            <p className="admin-fieldset-note">
              Ez a blokk soha nem hagyja el a szervert: a nyilvános oldal lekérése ezeket a
              mezőket meg sem kapja.
            </p>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="date">Vizsgálat dátuma</label>
                <input id="date" type="date" value={form.date} onChange={field('date')} required />
              </div>
              <div className="form-field">
                <label htmlFor="address">Pontos cím</label>
                <input
                  id="address"
                  type="text"
                  placeholder="Pl. Séta utca 34/B"
                  value={form.address}
                  onChange={field('address')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="contactName">Kapcsolattartó neve</label>
                <input id="contactName" type="text" value={form.contactName} onChange={field('contactName')} />
              </div>
              <div className="form-field">
                <label htmlFor="contactPhone">Telefonszám</label>
                <input id="contactPhone" type="tel" value={form.contactPhone} onChange={field('contactPhone')} />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="internalNote">Belső megjegyzés</label>
              <textarea id="internalNote" rows={2} value={form.internalNote} onChange={field('internalNote')} />
            </div>
          </fieldset>

          <fieldset className="admin-fieldset">
            <legend>Megosztható – ez látszhat a lakóknak</legend>
            <p className="admin-fieldset-note">
              Helyszínből csak a városrész jelenik meg, házszám és név nélkül.
            </p>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="district">Városrész</label>
                <select id="district" value={form.district} onChange={field('district')}>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="propertyType">Ingatlan típusa</label>
                <select id="propertyType" value={form.propertyType} onChange={field('propertyType')}>
                  {PROPERTY_TYPES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="breedingSiteType">Talált gócpont típusa</label>
                <select id="breedingSiteType" value={form.breedingSiteType} onChange={field('breedingSiteType')}>
                  {BREEDING_TYPES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="containerCount">Érintett edények száma</label>
                <input
                  id="containerCount"
                  type="number"
                  min="0"
                  value={form.containerCount}
                  onChange={field('containerCount')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="larvaeFound">Volt-e lárva?</label>
                <select id="larvaeFound" value={form.larvaeFound} onChange={field('larvaeFound')}>
                  <option value="igen">Igen</option>
                  <option value="nem">Nem</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="larvaeAmount">Mennyiség</label>
                <input
                  id="larvaeAmount"
                  type="text"
                  placeholder="Pl. sok, ~200 db/l"
                  value={form.larvaeAmount}
                  onChange={field('larvaeAmount')}
                />
              </div>
              <div className="form-field">
                <label htmlFor="speciesGuess">Faj (ha ismert)</label>
                <input
                  id="speciesGuess"
                  type="text"
                  placeholder="Pl. Aedes koreicus"
                  value={form.speciesGuess}
                  onChange={field('speciesGuess')}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="treatment">Elvégzett kezelés</label>
              <textarea id="treatment" rows={2} value={form.treatment} onChange={field('treatment')} />
            </div>

            <div className="form-field">
              <label htmlFor="advice">Tanulság / tanács a lakóknak</label>
              <textarea
                id="advice"
                rows={3}
                placeholder="Mit tanulhatnak ebből az esetből mások? Pl. a hordót fedéllel kell lezárni…"
                value={form.advice}
                onChange={field('advice')}
              />
            </div>

            <div className="form-field">
              <label htmlFor="photos">Fényképek (max. 8)</label>
              <input id="photos" type="file" accept="image/*" multiple onChange={handlePhotos} />
              <p className="admin-upload-status">
                Ügyelj rá, hogy a képeken ne legyen házszám, rendszám vagy arc.
              </p>
            </div>

            {form.photos.length > 0 && (
              <div className="admin-photo-grid">
                {form.photos.map((photo, i) => (
                  <div className="admin-photo-item" key={photo.url}>
                    <img src={photo.url} alt={photo.caption || `Fénykép ${i + 1}`} />
                    <div className="admin-photo-item-body">
                      <input
                        type="text"
                        placeholder="Képaláírás"
                        value={photo.caption}
                        onChange={(e) => updateCaption(i, e.target.value)}
                      />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removePhoto(i)}>
                        Kép törlése
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          <label className="admin-check">
            <input type="checkbox" checked={form.shared} onChange={field('shared')} />
            <span>
              Megosztás mintaként a lakókkal
              <small>
                Csak ha ezt bepipálod, jelenik meg az eset a nyilvános Gócpont-példák oldalon –
                városrész szinten, cím és név nélkül. Kérj hozzá hozzájárulást a lakótól.
              </small>
            </span>
          </label>

          <AdminNotice tone="error">{crud.error}</AdminNotice>
          <AdminNotice tone="info">{crud.success}</AdminNotice>

          <div className="form-actions">
            {crud.editingId && (
              <button type="button" className="btn btn-outline" onClick={crud.cancelEdit} disabled={crud.saving}>
                Mégse
              </button>
            )}
            <button type="submit" className="btn btn-brand" disabled={crud.saving}>
              {crud.saving ? 'Mentés…' : crud.editingId ? 'Módosítás mentése' : 'Vizsgálat mentése'}
            </button>
          </div>
        </form>
      </AdminPanel>

      <AdminPanel title={`Rögzített vizsgálatok (${crud.entries.length})`}>
        {crud.loading ? (
          <p className="admin-empty">Betöltés…</p>
        ) : crud.entries.length === 0 ? (
          <p className="admin-empty">Még nincs rögzített vizsgálat.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Dátum</th>
                  <th>Városrész</th>
                  <th>Cím (bizalmas)</th>
                  <th>Gócpont</th>
                  <th style={{ textAlign: 'center' }}>Fotó</th>
                  <th>Megosztás</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {crud.entries.map((entry) => (
                  <tr key={entry.id} className={crud.editingId === entry.id ? 'admin-row-editing' : ''}>
                    <td>{formatDate(entry.date)}</td>
                    <td>{entry.district}</td>
                    <td>{entry.address || '–'}</td>
                    <td>{entry.breedingSiteType}</td>
                    <td className="num">{entry.photos?.length ?? 0}</td>
                    <td>
                      <span className={`admin-flag ${entry.shared ? 'admin-flag-public' : 'admin-flag-private'}`}>
                        {entry.shared ? 'Nyilvános minta' : 'Csak belső'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button type="button" className="btn btn-outline" onClick={() => crud.startEdit(entry)}>
                          Szerkesztés
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() =>
                            crud.remove(entry, `Biztosan törlöd a(z) ${formatDate(entry.date)} – ${entry.district} vizsgálatot?`)
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
