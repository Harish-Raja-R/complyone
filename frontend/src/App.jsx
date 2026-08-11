import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Regulations from './pages/Regulations';
import Requirements from './pages/Requirements';
import Controls from './pages/Controls';
import Tasks from './pages/Tasks';
import Evidence from './pages/Evidence';
import Login from './pages/Login';
import Risks from './pages/Risks';
import Audits from './pages/Audits';
import Policies from './pages/Policies';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { PixelLiquidBg } from '@/components/unlumen-ui/pixel-liquid-bg';
import './App.css';

const APP_DARK_PALETTE = ['#020617', '#0f766e', '#155e75', '#4f46e5', '#d97706'];
const APP_LIGHT_PALETTE = ['#f8fafc', '#dbeafe', '#a7f3d0', '#fde68a', '#f0abfc'];

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontWeight: 500, fontSize: '16px' }}>Loading ComplyOne...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard globalSearch={globalSearch} />;
      case 'regulations':
        return <Regulations globalSearch={globalSearch} />;
      case 'requirements':
        return <Requirements globalSearch={globalSearch} />;
      case 'controls':
        return <Controls globalSearch={globalSearch} />;
      case 'tasks':
        return <Tasks globalSearch={globalSearch} />;
      case 'evidence':
        return <Evidence globalSearch={globalSearch} />;
      case 'risks':
        return <Risks globalSearch={globalSearch} />;
      case 'audits':
        return <Audits globalSearch={globalSearch} />;
      case 'policies':
        return <Policies globalSearch={globalSearch} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard globalSearch={globalSearch} />;
    }
  };

  return (
    <PixelLiquidBg
      className="app-shell-bg"
      darkPalette={APP_DARK_PALETTE}
      lightPalette={APP_LIGHT_PALETTE}
      pixelSize={18}
      resolution={0.28}
      mouseForce={5}
      cursorSize={120}
    >
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-layout">
        <Navbar onSearchChange={setGlobalSearch} />
        <main className="content-container">
          {renderPage()}
        </main>
      </div>
    </div>
    </PixelLiquidBg>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
