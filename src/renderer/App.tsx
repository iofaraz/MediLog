import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          {/* Add more routes here later */}
          <Route path="patients" element={<div style={{ padding: '24px' }}>Patients Page (Coming Soon)</div>} />
          <Route path="visits" element={<div style={{ padding: '24px' }}>Visits Page (Coming Soon)</div>} />
          <Route path="medications" element={<div style={{ padding: '24px' }}>Medications Page (Coming Soon)</div>} />
          <Route path="settings" element={<div style={{ padding: '24px' }}>Settings Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
