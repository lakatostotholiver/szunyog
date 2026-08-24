import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../lib/adminAuth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(password);
      navigate(location.state?.from ?? '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-header">
      <div className="page-header-inner enter">
        <div className="kicker">Kollégáknak</div>
        <h1>Admin bejelentkezés</h1>
        <p>Az admin felülethez add meg a közös jelszót.</p>
      </div>

      <div className="container" style={{ maxWidth: 420, marginTop: '1.5rem' }}>
        <form className="auth-form card" onSubmit={handleSubmit}>
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
