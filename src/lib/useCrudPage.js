import { useCallback, useEffect, useState } from 'react';

/**
 * Az admin CRUD oldalak közös állapotkezelése: lista betöltése, szerkesztés
 * indítása/megszakítása, mentés és törlés, egységes hiba- és sikerüzenettel.
 */
export function useCrudPage(resource, makeEmptyForm, toFormValues, { successText } = {}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(makeEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await resource.list());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    reload();
  }, [reload]);

  const field = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
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
    setForm(makeEmptyForm());
    setError('');
    setSuccess('');
  };

  const save = async (payload) => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      if (editingId) {
        await resource.update(editingId, payload);
        setSuccess(successText?.updated ?? 'A módosítás elmentve.');
        setEditingId(null);
      } else {
        await resource.create(payload);
        setSuccess(successText?.created ?? 'Az új bejegyzés elmentve.');
      }
      setForm(makeEmptyForm());
      await reload();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry, confirmText) => {
    if (!window.confirm(confirmText)) return;
    setDeletingId(entry.id);
    try {
      await resource.remove(entry.id);
      if (editingId === entry.id) cancelEdit();
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return {
    entries,
    loading,
    form,
    setForm,
    field,
    editingId,
    error,
    setError,
    success,
    saving,
    deletingId,
    startEdit,
    cancelEdit,
    save,
    remove,
    reload,
  };
}
