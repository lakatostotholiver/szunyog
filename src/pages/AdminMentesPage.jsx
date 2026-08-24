import { useCallback, useEffect, useState } from 'react';
import AdminShell, { AdminPanel, AdminNotice } from '../components/AdminShell';

function formatDateTime(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminMentesPage() {
  const [trash, setTrash] = useState([]);
  const [retention, setRetention] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trash');
      if (!res.ok) throw new Error('Nem sikerült betölteni a kukát.');
      const data = await res.json();
      setTrash(data.entries ?? []);
      setRetention(data.retentionDays ?? 30);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    setExporting(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('A mentés nem sikerült.');
      const blob = await res.blob();

      // A böngésző mentse fájlba – így az ügyintéző a saját gépén tartja meg.
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `szunyogmonitoring-mentes-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotice('A mentés elkészült és letöltődött.');
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const act = async (entry, method, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(entry.id);
    setError('');
    setNotice('');
    try {
      const res = await fetch(
        `/api/trash?section=${encodeURIComponent(entry.section)}&id=${encodeURIComponent(entry.id)}`,
        { method }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'A művelet nem sikerült.');
      }
      setNotice(method === 'POST' ? 'A bejegyzés visszaállítva.' : 'A bejegyzés véglegesen törölve.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell
      title="Mentés és kuka"
      intro="Biztonsági mentés letöltése, illetve a törölt bejegyzések visszaállítása."
    >
      <AdminPanel
        title="Biztonsági mentés"
        description="Az összes adat egyetlen JSON fájlban. Érdemes időnként letölteni és biztonságos helyen tárolni."
      >
        <p className="admin-hint" style={{ marginTop: 0 }}>
          <strong>Figyelem:</strong> a mentés bizalmas adatokat is tartalmaz – az egyéni
          gócpontok pontos címét, térképi koordinátáját és a kapcsolattartók adatait. Ne küldd
          el e-mailben, és ne tárold megosztott meghajtón.
        </p>

        <AdminNotice tone="error">{error}</AdminNotice>
        <AdminNotice tone="info">{notice}</AdminNotice>

        <div className="form-actions">
          <button type="button" className="btn btn-brand" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Mentés készítése…' : 'Mentés letöltése (JSON)'}
          </button>
        </div>
      </AdminPanel>

      <AdminPanel
        title={`Kuka (${trash.length})`}
        description={`A törölt bejegyzések ${retention} napig visszaállíthatók. A csatolt képek és PDF-ek is megmaradnak, amíg a bejegyzés a kukában van.`}
        actions={
          <button type="button" className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
            {loading ? 'Frissítés…' : 'Frissítés'}
          </button>
        }
      >
        <p className="admin-hint" style={{ marginTop: 0 }}>
          Az imént törölt bejegyzés néhány másodperc múlva jelenik meg itt – ha még nem
          látod, kattints a <strong>Frissítés</strong> gombra.
        </p>

        {loading ? (
          <p className="admin-empty">Betöltés…</p>
        ) : trash.length === 0 ? (
          <p className="admin-empty">A kuka üres – nincs törölt bejegyzés.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Szekció</th>
                  <th>Bejegyzés</th>
                  <th>Törölve</th>
                  <th style={{ textAlign: 'center' }}>Hátralévő</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {trash.map((entry) => (
                  <tr key={`${entry.section}-${entry.id}`}>
                    <td>{entry.sectionLabel}</td>
                    <td>{entry.label}</td>
                    <td>{formatDateTime(entry.deletedAt)}</td>
                    <td className="num">{entry.daysLeft} nap</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => act(entry, 'POST')}
                          disabled={busyId === entry.id}
                        >
                          Visszaállítás
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() =>
                            act(
                              entry,
                              'DELETE',
                              `Végleges törlés: „${entry.label}”.\n\nEz már NEM vonható vissza, és a csatolt fájlok is megszűnnek. Biztos?`
                            )
                          }
                          disabled={busyId === entry.id}
                        >
                          Végleges törlés
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
