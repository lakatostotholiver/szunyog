import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ERROR_MESSAGES = {
  'auth/invalid-credential': 'Hibás e-mail cím vagy jelszó.',
  'auth/invalid-email': 'Érvénytelen e-mail cím.',
  'auth/user-disabled': 'Ez a fiók le van tiltva.',
  'auth/too-many-requests': 'Túl sok próbálkozás történt, kérlek várj egy kicsit.',
};

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from ?? '/riportok'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from ?? '/riportok', { replace: true });
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] ?? 'Sikertelen bejelentkezés. Kérlek próbáld újra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-header">
      <div className="page-header-inner enter">
        <div className="kicker">Kollégáknak</div>
        <h1>Bejelentkezés</h1>
        <p>A terepi gócpont-riportok felviteléhez jelentkezz be a kapott felhasználói adatokkal.</p>
      </div>

      <div className="container" style={{ maxWidth: 420, marginTop: '1.5rem' }}>
        <form className="auth-form card" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">E-mail cím</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Jelszó</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-brand" disabled={submitting}>
            {submitting ? 'Bejelentkezés…' : 'Bejelentkezés'}
          </button>
        </form>
      </div>
    </div>
  );
}
