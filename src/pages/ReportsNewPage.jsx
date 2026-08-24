import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/useAuth';
import { storage, db } from '../lib/firebase';
import { compressImage } from '../lib/image';
import LocationPicker from '../components/LocationPicker';

export default function ReportsNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!location) {
      setError('Kérlek add meg a helyszínt a térképen.');
      return;
    }
    if (!description.trim()) {
      setError('Kérlek írj egy rövid leírást.');
      return;
    }
    if (!photo) {
      setError('Kérlek tölts fel egy fotót a gócpontról.');
      return;
    }

    setSubmitting(true);
    try {
      const compressed = await compressImage(photo);
      const photoPath = `reports/${user.uid}/${Date.now()}-${compressed.name}`;
      const storageRef = ref(storage, photoPath);
      await uploadBytes(storageRef, compressed);
      const photoURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'reports'), {
        lat: location.lat,
        lng: location.lng,
        description: description.trim(),
        photoURL,
        photoPath,
        reporterUid: user.uid,
        reporterEmail: user.email,
        reporterName: user.email.split('@')[0],
        createdAt: serverTimestamp(),
      });

      navigate('/riportok', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Nem sikerült elmenteni a riportot. Kérlek próbáld újra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-header">
      <div className="page-header-inner enter">
        <div className="kicker">Terepi riport</div>
        <h1>Új gócpont riport</h1>
        <p>Add meg a helyszínt, tölts fel egy fotót, és írd le röviden, mit találtál.</p>
      </div>

      <div className="container" style={{ maxWidth: 560, marginTop: '1.5rem' }}>
        <form className="auth-form card" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Helyszín</label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          <div className="form-field">
            <label htmlFor="photo">Fotó</label>
            <input id="photo" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
            {photoPreview && (
              <img src={photoPreview} alt="Előnézet" className="photo-preview" />
            )}
          </div>

          <div className="form-field">
            <label htmlFor="description">Leírás</label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pl. pangó víz, mennyi lárva, milyen jellegű terület…"
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <Link to="/riportok" className="btn btn-outline">Mégse</Link>
            <button type="submit" className="btn btn-brand" disabled={submitting}>
              {submitting ? 'Mentés…' : 'Riport mentése'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
