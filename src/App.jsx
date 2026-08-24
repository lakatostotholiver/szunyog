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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="mit-tehetunk" element={<MitTehetunkPage />} />
          <Route path="gyik" element={<GyikPage />} />
          <Route path="admin-belepes" element={<AdminLoginPage />} />
          <Route
            path="admin"
            element={
              <AdminProtectedRoute>
                <AdminPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="admin/gocpont-kutatasok"
            element={
              <AdminProtectedRoute>
                <AdminKutatasokPage />
              </AdminProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
