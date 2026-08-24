import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../lib/adminAuth';
import { ADMIN_ROUTES } from '../lib/adminRoutes';

const sections = [
  {
    to: ADMIN_ROUTES.meresek,
    title: 'Mérési körök',
    description:
      'Új bejárás felvitele a NO MOSQUITO jelentés alapján: helyszínenkénti lárvaszám, állapot, összefoglaló és PDF csatolása. Azonnal megjelenik a Főoldalon és a Mérések oldalon.',
  },
  {
    to: ADMIN_ROUTES.kutatasok,
    title: 'Gócpont-kutatások',
    description: 'Terepi csípésszámlálásos mérések rögzítése, szerkesztése és törlése – a Mérések oldalon jelenik meg.',
  },
];

export default function AdminPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ADMIN_ROUTES.login, { replace: true });
  };

  return (
    <div className="page-header">
      <div className="page-header-inner enter">
        <div className="kicker">Kollégáknak</div>
        <h1>Admin felület</h1>
      </div>

      <div className="container" style={{ maxWidth: 720, marginTop: '1.5rem' }}>
        <div className="form-actions" style={{ marginBottom: '1.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>Kijelentkezés</button>
        </div>

        <div className="admin-section-grid">
          {sections.map((section) => (
            <Link key={section.to} to={section.to} className="card admin-section-card">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
