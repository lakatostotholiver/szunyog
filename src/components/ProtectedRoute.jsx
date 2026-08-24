import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        Betöltés…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/bejelentkezes" state={{ from: location.pathname }} replace />;
  }

  return children;
}
