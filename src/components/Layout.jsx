import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
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
  const mainRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    const els = mainRef.current?.querySelectorAll('.reveal:not(.is-visible)') ?? [];
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span className="top-bar-org">Törökbálint Város Önkormányzata · Zöld Jövő Program</span>
          <a href="mailto:zoldjovo@torokbalint.hu" className="top-bar-contact">zoldjovo@torokbalint.hu</a>
        </div>
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
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Navigáció bezárása' : 'Navigáció megnyitása'}
            aria-expanded={mobileOpen}
          >
            <span className={`hamburger${mobileOpen ? ' is-open' : ''}`}>
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </span>
          </button>
        </div>
      </nav>

      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <div className="mobile-nav-inner">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <main ref={mainRef}>
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
            A mérési jegyzőkönyvek digitális formában elérhetők, és kérésre megtekinthetők.
          </p>
        </div>
      </footer>
      <BekaBot />
    </>
  );
}
