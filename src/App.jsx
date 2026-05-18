import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MonitoringPage from './pages/MonitoringPage';
import MitTehetunkPage from './pages/MitTehetunkPage';
import GyikPage from './pages/GyikPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="mit-tehetunk" element={<MitTehetunkPage />} />
          <Route path="gyik" element={<GyikPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
