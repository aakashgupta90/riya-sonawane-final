import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Story from './pages/Story';
import YearGallery from './pages/YearGallery';
import FinalPage from './pages/FinalPage';
import AdminDashboard from './pages/AdminDashboard';
import { useUnlockTime } from './hooks/useUnlockTime';
import { CmsProvider } from './hooks/useCms';

// Components
import Navbar from './components/Navbar';
import AudioPlayer from './components/AudioPlayer';

// Handle Scroll on Navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Route Protector based on Timer
const LockedRoute = ({ children }) => {
  const isUnlocked = useUnlockTime();
  if (!isUnlocked) return <Navigate to="/" replace />;
  return children;
};

// Layout Wrapper
const Layout = ({ children }) => (
  <div className="relative min-h-screen bg-black text-white selection:bg-accent selection:text-white overflow-hidden">
    <Navbar />
    {children}
    <AudioPlayer />
  </div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            
            {/* Protected Timer Routes */}
            <Route path="/story" element={<LockedRoute><Story /></LockedRoute>} />
            <Route path="/year/:year" element={<LockedRoute><YearGallery /></LockedRoute>} />
            <Route path="/final" element={<LockedRoute><FinalPage /></LockedRoute>} />
            
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <CmsProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </CmsProvider>
  );
}

export default App;
