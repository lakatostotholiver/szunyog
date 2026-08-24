import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useAuth } from '../context/useAuth';
import { db } from '../lib/firebase';
import ReportCard from '../components/ReportCard';

export default function ReportsListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    await logout();
    navigate('/bejelentkezes', { replace: true });
  };

  return (
    <div className="page-header">
      <div className="page-header-inner enter">
        <div className="kicker">Kollégáknak</div>
        <h1>Terepi riportok</h1>
        <p>Bejelentkezve: {user?.email}</p>
      </div>

      <div className="container" style={{ marginTop: '1.5rem' }}>
        <div className="form-actions" style={{ marginBottom: '1.5rem' }}>
          <Link to="/riportok/uj" className="btn btn-brand">+ Új riport</Link>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>Kijelentkezés</button>
        </div>

        {loading && <p>Betöltés…</p>}
        {!loading && reports.length === 0 && <p>Még nincs egy riport sem.</p>}

        <div className="report-grid">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
}
