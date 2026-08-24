import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MonitoringPage from './pages/MonitoringPage';
import MitTehetunkPage from './pages/MitTehetunkPage';
import GyikPage from './pages/GyikPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import AdminKutatasokPage from './pages/AdminKutatasokPage';
import AdminMeresekPage from './pages/AdminMeresekPage';
import { ADMIN_BASE } from './lib/adminRoutes';

// Az admin útvonalak a Route path-hoz relatívak (nincs vezető "/").
const adminPath = ADMIN_BASE.replace(/^\//, '');

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="mit-tehetunk" element={<MitTehetunkPage />} />
          <Route path="gyik" element={<GyikPage />} />

          <Route path={`${adminPath}/belepes`} element={<AdminLoginPage />} />
          <Route
            path={adminPath}
            element={
              <AdminProtectedRoute>
                <AdminPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path={`${adminPath}/gocpont-kutatasok`}
            element={
              <AdminProtectedRoute>
                <AdminKutatasokPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path={`${adminPath}/meresek`}
            element={
              <AdminProtectedRoute>
                <AdminMeresekPage />
              </AdminProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
