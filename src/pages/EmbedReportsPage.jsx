import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../lib/leafletIcons';
import { db } from '../lib/firebase';
import ReportCard from '../components/ReportCard';

const DEFAULT_CENTER = [47.4333, 18.9167];

export default function EmbedReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="embed-page">
      {loading && <p className="embed-empty">Betöltés…</p>}
      {!loading && reports.length === 0 && <p className="embed-empty">Egyelőre nincs rögzített gócpont-riport.</p>}

      {!loading && reports.length > 0 && (
        <>
          <MapContainer center={DEFAULT_CENTER} zoom={13} className="embed-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> közreműködők'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports
              .filter((r) => typeof r.lat === 'number' && typeof r.lng === 'number')
              .map((report) => (
                <Marker key={report.id} position={[report.lat, report.lng]}>
                  <Popup>{report.description}</Popup>
                </Marker>
              ))}
          </MapContainer>

          <div className="report-grid">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
