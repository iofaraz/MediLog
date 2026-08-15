import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Welcome to MediLog</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '1rem' }}>Total Patients</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>1,248</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '1rem' }}>Today's Visits</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>12</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '1rem' }}>Pending Follow-ups</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>5</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
