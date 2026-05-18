import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BekaBot from './BekaBot';

const MosquitoIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" style={{ color: '#fff' }}>
    <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <line x1="10" y1="3" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="10" y1="14" x2="7.5" y2="18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="10" y1="14" x2="12.5" y2="18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

const navItems = [
  { to: '/', label: 'Hírek', end: true },
  { to: '/monitoring', label: 'Mérések' },
  { to: '/mit-tehetunk', label: 'Mit tehetünk?' },
  { to: '/gyik', label: 'GYIK' },
];

export default function Layout() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="top-bar">
        Törökbálint Város Önkormányzata · Zöld Jövő Program ·{' '}
        <a href="mailto:zoldjovo@torokbalint.hu">zoldjovo@torokbalint.hu</a>
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo">
              <MosquitoIcon />
            </div>
            <div>
              <div className="navbar-title">Szúnyogmonitoring</div>
              <div className="navbar-subtitle">Törökbálint &middot; 2026</div>
            </div>
          </Link>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
          <button
            className="nav-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Navigáció megnyitása"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {item.label}
          </NavLink>
        ))}
      </div>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <p className="footer-org">Törökbálint Város Önkormányzata</p>
              <p>2045 Törökbálint, Munkácsy Mihály u. 79.</p>
              <p>
                Tel.: <a href="tel:+3623335021">+36 23 335 021</a>
              </p>
              <p>
                E-mail: <a href="mailto:hivatal@torokbalint.hu">hivatal@torokbalint.hu</a>
              </p>
              <p>
                Web: <a href="https://www.torokbalint.hu" target="_blank" rel="noopener noreferrer">www.torokbalint.hu</a>
              </p>
            </div>
            <div className="footer-col">
              <p className="footer-section-title">Általános ügyfélfogadás</p>
              <table className="footer-hours">
                <tbody>
                  <tr><td>Hétfő</td><td>13:00 – 18:00</td></tr>
                  <tr><td>Kedd</td><td>–</td></tr>
                  <tr><td>Szerda</td><td>08:00 – 12:00, 13:00 – 16:00</td></tr>
                  <tr><td>Csütörtök</td><td>–</td></tr>
                  <tr><td>Péntek</td><td>–</td></tr>
                </tbody>
              </table>
            </div>
            <div className="footer-col">
              <p className="footer-section-title">Ügyfélszolgálat a portán</p>
              <table className="footer-hours">
                <tbody>
                  <tr><td>Hétfő</td><td>08:00 – 12:00, 13:00 – 18:00</td></tr>
                  <tr><td>Kedd</td><td>08:00 – 12:00, 13:00 – 16:00</td></tr>
                  <tr><td>Szerda</td><td>08:00 – 12:00, 13:00 – 16:00</td></tr>
                  <tr><td>Csütörtök</td><td>08:00 – 12:00, 13:00 – 16:00</td></tr>
                  <tr><td>Péntek</td><td>–</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="footer-note">
            Az eredeti mérési jegyzőkönyvek aláírva, pecséttel ellátva az Önkormányzatnál megtekinthetők.
          </p>
        </div>
      </footer>
      <BekaBot />
    </>
  );
}
