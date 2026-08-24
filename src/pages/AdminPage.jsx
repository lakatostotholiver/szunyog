import { Link } from 'react-router-dom';
import AdminShell, { AdminPanel } from '../components/AdminShell';
import { ADMIN_NAV } from '../lib/adminRoutes';

export default function AdminPage() {
  return (
    <AdminShell
      title="Szerkesztőfelület"
      intro="Innen tartható karban a nyilvános oldal tartalma. Amit itt mentesz, az azonnal megjelenik a lakosság felé – nem kell hozzá fejlesztő."
    >
      <AdminPanel title="Szekciók">
        <div className="admin-section-grid">
          {ADMIN_NAV.map((item) => (
            <Link key={item.to} to={item.to} className="admin-section-card">
              <h2>{item.label}</h2>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
