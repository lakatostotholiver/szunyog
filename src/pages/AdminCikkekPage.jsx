import { useState } from 'react';
import AdminShell, { AdminPanel, AdminNotice } from '../components/AdminShell';
import { cikkek, uploadFile } from '../lib/cms';
import Attachment from '../components/Attachment';
import { useCrudPage } from '../lib/useCrudPage';

const TAGS = ['Tájékoztatás', 'Hír', 'Felhívás', 'Szakmai', 'Lakossági tipp'];

const emptyForm = () => ({
  title: '',
  publishDate: new Date().toISOString().slice(0, 10),
  tag: 'Tájékoztatás',
  lead: '',
  body: '',
  coverUrl: null,
  coverName: null,
  coverSize: null,
  coverType: null,
  published: true,
});

const toFormValues = (entry) => ({
  title: entry.title ?? '',
  publishDate: entry.publishDate ?? '',
  tag: entry.tag ?? 'Tájékoztatás',
  lead: entry.lead ?? '',
  body: entry.body ?? '',
  coverUrl: entry.coverUrl ?? null,
  coverName: entry.coverName ?? null,
  coverSize: entry.coverSize ?? null,
  coverType: entry.coverType ?? null,
  published: entry.published !== false,
});

function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AdminCikkekPage() {
  const crud = useCrudPage(cikkek, emptyForm, toFormValues, {
    successText: {
      created: 'A cikk elmentve.',
      updated: 'A cikk frissítve.',
    },
  });
  const { form, setForm, field } = crud;
  const [uploading, setUploading] = useState(false);

  const handleCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    crud.setError('');
    setUploading(true);
    try {
      const { url, name, size, type } = await uploadFile(file);
      setForm((f) => ({ ...f, coverUrl: url, coverName: name, coverSize: size, coverType: type }));
    } catch (err) {
      crud.setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      crud.setError('A cikknek kell cím.');
      return;
    }
    if (!form.body.trim()) {
      crud.setError('A cikk szövege nem lehet üres.');
      return;
    }
    await crud.save(form);
  };

  const charCount = form.body.length;

  return (
    <AdminShell
      title="Cikkek"
      intro="Tájékoztató cikkek a lakosságnak. A közzétett cikkek megjelennek a Hírek oldalon és a főoldali hírfolyamban is, a dátumuk szerinti helyen."
    >
      <AdminPanel
        title={crud.editingId ? 'Cikk szerkesztése' : 'Új cikk írása'}
        description="A bevezető a listákban és a hírfolyamban látszik, a szöveg pedig a cikk saját oldalán. Üres sorral választhatsz bekezdéseket."
      >
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="title">Cím</label>
            <input
              id="title"
              type="text"
              placeholder="Pl. Így akadályozhatja meg a szúnyogok szaporodását a kertjében"
              value={form.title}
              onChange={field('title')}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="publishDate">Megjelenés dátuma</label>
              <input
                id="publishDate"
                type="date"
                value={form.publishDate}
                onChange={field('publishDate')}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="tag">Címke</label>
              <select id="tag" value={form.tag} onChange={field('tag')}>
                {TAGS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="lead">Bevezető (rövid összefoglaló)</label>
            <textarea
              id="lead"
              rows={2}
              placeholder="Egy-két mondat, ami a listákban és a hírfolyamban megjelenik."
              value={form.lead}
              onChange={field('lead')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="body">A cikk szövege</label>
            <textarea
              id="body"
              rows={12}
              placeholder={'Írd ide a cikket.\n\nÜres sorral válaszd el a bekezdéseket.'}
              value={form.body}
              onChange={field('body')}
              required
            />
            <p className="admin-upload-status">{charCount} karakter</p>
          </div>

          <div className="form-field">
            <label htmlFor="cover">Borítókép (nem kötelező)</label>
            <input id="cover" type="file" accept="image/*" onChange={handleCover} disabled={uploading} />
            {uploading && <p className="admin-upload-status">Kép feltöltése…</p>}
            <Attachment
              url={form.coverUrl}
              name={form.coverName}
              size={form.coverSize}
              type={form.coverType}
              onRemove={() =>
                setForm((f) => ({ ...f, coverUrl: null, coverName: null, coverSize: null, coverType: null }))
              }
            />
          </div>

          <label className="admin-check">
            <input type="checkbox" checked={form.published} onChange={field('published')} />
            <span>
              Közzétéve
              <small>Ha kiveszed a pipát, a cikk piszkozat marad – a lakosság nem látja.</small>
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
            <button type="submit" className="btn btn-brand" disabled={crud.saving || uploading}>
              {crud.saving ? 'Mentés…' : crud.editingId ? 'Módosítás mentése' : 'Cikk mentése'}
            </button>
          </div>
        </form>
      </AdminPanel>

      <AdminPanel title={`Cikkek (${crud.entries.length})`}>
        {crud.loading ? (
          <p className="admin-empty">Betöltés…</p>
        ) : crud.entries.length === 0 ? (
          <p className="admin-empty">Még nincs cikk.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Dátum</th>
                  <th>Cím</th>
                  <th>Címke</th>
                  <th>Állapot</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {crud.entries.map((entry) => (
                  <tr key={entry.id} className={crud.editingId === entry.id ? 'admin-row-editing' : ''}>
                    <td>{formatDate(entry.publishDate)}</td>
                    <td>{entry.title}</td>
                    <td>{entry.tag}</td>
                    <td>
                      <span className={`admin-flag ${entry.published ? 'admin-flag-public' : 'admin-flag-private'}`}>
                        {entry.published ? 'Közzétéve' : 'Piszkozat'}
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
                          onClick={() => crud.remove(entry, `Biztosan törlöd a(z) „${entry.title}” cikket?`)}
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
