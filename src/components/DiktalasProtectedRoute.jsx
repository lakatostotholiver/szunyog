import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkSession } from '../lib/diktalasAuth';

export default function DiktalasProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading');
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    checkSession().then((authed) => {
      if (!cancelled) setStatus(authed ? 'authed' : 'anon');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        Betöltés…
      </div>
    );
  }

  if (status === 'anon') {
    return <Navigate to="/diktalas-belepes" state={{ from: location.pathname }} replace />;
  }

  return children;
}
