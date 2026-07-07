import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAppStore } from '@/store/useAppStore';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import CropRecommendation from '@/pages/CropRecommendation';
import Irrigation from '@/pages/Irrigation';
import DiseaseDiagnosis from '@/pages/DiseaseDiagnosis';
import Reports from '@/pages/Reports';
import Profile from '@/pages/Profile';
import Placeholder from '@/pages/Placeholder';
import Features from '@/pages/Features';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

import FieldMapping from '@/pages/FieldMapping';
import SatelliteAnalysis from '@/pages/SatelliteAnalysis';
import CropHealth from '@/pages/CropHealth';
import FieldHistory from '@/pages/FieldHistory';

function App() {
  const { refreshUser } = useAppStore();

  // Refresh user profile from backend on app load
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Placeholder />} />
        </Route>

        {/* Auth pages (standalone, no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard pages */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="field-mapping" element={<FieldMapping />} />
          <Route path="satellite-analysis" element={<SatelliteAnalysis />} />
          <Route path="crop-health" element={<CropHealth />} />
          <Route path="crop" element={<CropRecommendation />} />
          <Route path="irrigation" element={<Irrigation />} />
          <Route path="disease" element={<DiseaseDiagnosis />} />
          <Route path="reports" element={<Reports />} />
          <Route path="field-history" element={<FieldHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
