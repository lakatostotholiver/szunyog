import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DiktalasProtectedRoute from './components/DiktalasProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MonitoringPage from './pages/MonitoringPage';
import MitTehetunkPage from './pages/MitTehetunkPage';
import GyikPage from './pages/GyikPage';
import LoginPage from './pages/LoginPage';
import ReportsListPage from './pages/ReportsListPage';
import ReportsNewPage from './pages/ReportsNewPage';
import EmbedReportsPage from './pages/EmbedReportsPage';
import DiktalasPage from './pages/DiktalasPage';
import DiktalasLoginPage from './pages/DiktalasLoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="mit-tehetunk" element={<MitTehetunkPage />} />
            <Route path="gyik" element={<GyikPage />} />
            <Route path="bejelentkezes" element={<LoginPage />} />
            <Route
              path="riportok"
              element={
                <ProtectedRoute>
                  <ReportsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="riportok/uj"
              element={
                <ProtectedRoute>
                  <ReportsNewPage />
                </ProtectedRoute>
              }
            />
            <Route path="diktalas-belepes" element={<DiktalasLoginPage />} />
            <Route
              path="diktalas"
              element={
                <DiktalasProtectedRoute>
                  <DiktalasPage />
                </DiktalasProtectedRoute>
              }
            />
          </Route>
          <Route path="embed/gocpontok" element={<EmbedReportsPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
