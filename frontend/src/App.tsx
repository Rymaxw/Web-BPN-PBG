import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ManajemenSurat from './pages/ManajemenSurat';
import AnalisisDokumen from './pages/AnalisisDokumen';
import ArsipDigital from './pages/ArsipDigital';
import Pengaturan from './pages/Pengaturan';
import Login from './pages/Login';
import './App.css';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="surat" element={<ManajemenSurat />} />
          <Route path="dokumen" element={<AnalisisDokumen />} />
          <Route path="arsip" element={<ArsipDigital />} />
          <Route path="pengaturan" element={<Pengaturan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
