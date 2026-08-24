import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MonitoringPage from './pages/MonitoringPage';
import MitTehetunkPage from './pages/MitTehetunkPage';
import GyikPage from './pages/GyikPage';
import HirekPage from './pages/HirekPage';
import CikkPage from './pages/CikkPage';
import GocpontPeldakPage from './pages/GocpontPeldakPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import AdminKutatasokPage from './pages/AdminKutatasokPage';
import AdminMeresekPage from './pages/AdminMeresekPage';
import AdminFajazonositasPage from './pages/AdminFajazonositasPage';
import AdminCikkekPage from './pages/AdminCikkekPage';
import AdminEgyeniGocpontokPage from './pages/AdminEgyeniGocpontokPage';
import AdminMentesPage from './pages/AdminMentesPage';
import { ADMIN_BASE } from './lib/adminRoutes';

// Az admin útvonalak a Route path-hoz relatívak (nincs vezető "/").
const adminPath = ADMIN_BASE.replace(/^\//, '');

function Protected({ children }) {
  return <AdminProtectedRoute>{children}</AdminProtectedRoute>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="hirek" element={<HirekPage />} />
          <Route path="hirek/:slug" element={<CikkPage />} />
          <Route path="gocpont-peldak" element={<GocpontPeldakPage />} />
          <Route path="mit-tehetunk" element={<MitTehetunkPage />} />
          <Route path="gyik" element={<GyikPage />} />
        </Route>

        {/* Az admin saját keretet használ, ezért a publikus Layout-on kívül él. */}
        <Route path={`${adminPath}/belepes`} element={<AdminLoginPage />} />
        <Route path={adminPath} element={<Protected><AdminPage /></Protected>} />
        <Route path={`${adminPath}/meresek`} element={<Protected><AdminMeresekPage /></Protected>} />
        <Route
          path={`${adminPath}/gocpont-kutatasok`}
          element={<Protected><AdminKutatasokPage /></Protected>}
        />
        <Route
          path={`${adminPath}/egyeni-gocpontok`}
          element={<Protected><AdminEgyeniGocpontokPage /></Protected>}
        />
        <Route
          path={`${adminPath}/fajazonositas`}
          element={<Protected><AdminFajazonositasPage /></Protected>}
        />
        <Route path={`${adminPath}/cikkek`} element={<Protected><AdminCikkekPage /></Protected>} />
        <Route path={`${adminPath}/mentes`} element={<Protected><AdminMentesPage /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}
