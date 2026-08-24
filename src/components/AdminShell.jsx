import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../lib/adminAuth';
import { ADMIN_ROUTES, ADMIN_NAV } from '../lib/adminRoutes';

// Közös admin keret: saját fejléc, navigáció és tipográfia. Szándékosan más a
// karaktere, mint a publikus oldalé – ez egy munkaeszköz, nem kirakat.
export default function AdminShell({ title, intro, children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ADMIN_ROUTES.login, { replace: true });
  };

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar-inner">
          <Link to={ADMIN_ROUTES.base} className="admin-brand">
            <span className="admin-brand-mark">SZ</span>
            <span>
              <strong>Szerkesztőfelület</strong>
              <em>Szúnyogmonitoring · Törökbálint</em>
            </span>
          </Link>
          <div className="admin-bar-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Oldal megtekintése
            </a>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Kijelentkezés
            </button>
          </div>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-inner">
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className="admin-nav-link">
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="admin-main">
        <div className="admin-head">
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}

/** Űrlap- és listaszekció egységes kerettel. */
export function AdminPanel({ title, description, actions, children }) {
  return (
    <section className="admin-panel">
      {(title || actions) && (
        <div className="admin-panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Egységes visszajelzés – siker/hiba mindig ugyanott, ugyanúgy néz ki. */
export function AdminNotice({ tone = 'info', children }) {
  if (!children) return null;
  return <p className={`admin-notice admin-notice-${tone}`}>{children}</p>;
}
