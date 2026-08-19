import React, { useState } from 'react';
import { Database, Download, Upload, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setMessage(null);
    try {
      const result = await window.api.backup.create(user?.id || 'unknown');
      if (result.success) {
        setMessage({ type: 'success', text: 'Backup created successfully!' });
      } else if (result.error !== 'Backup cancelled.') {
        setMessage({ type: 'error', text: result.error || 'Failed to create backup' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
    setIsBackingUp(false);
  };

  const handleRestore = async () => {
    if (!window.confirm('WARNING: Restoring a backup will OVERWRITE all current data and restart the application. Are you sure you want to proceed?')) {
      return;
    }

    setIsRestoring(true);
    setMessage(null);
    try {
      const result = await window.api.backup.restore(user?.id || 'unknown');
      if (!result.success && result.error !== 'Restore cancelled.') {
        setMessage({ type: 'error', text: result.error || 'Failed to restore backup' });
      }
      // Note: If successful, the app restarts instantly, so we won't see a success message.
    } catch (error: any) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
    setIsRestoring(false);
  };

  return (
    <div className="page-container" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage application preferences and data</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={24} color="var(--primary-color)" />
          Database Management
        </h2>
        
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            color: message.type === 'success' ? '#34d399' : '#f87171'
          }}>
            {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Backup Section */}
          <div style={{ 
            padding: '24px', 
            background: 'rgba(15, 17, 23, 0.4)', 
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Create Backup</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Save a secure snapshot of the entire MediLog database to an external location like a USB drive or secure folder. You can continue using the app while backing up.
            </p>
            <button 
              onClick={handleBackup}
              disabled={isBackingUp || isRestoring}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <Download size={18} />
              {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
            </button>
          </div>

          {/* Restore Section */}
          <div style={{ 
            padding: '24px', 
            background: 'rgba(239, 68, 68, 0.05)', 
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: '#fca5a5' }}>Restore Backup</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Restore the database from a previously saved backup file. <strong style={{ color: '#f87171' }}>Warning: This will overwrite all current data and immediately restart the application.</strong>
            </p>
            <button 
              onClick={handleRestore}
              disabled={isBackingUp || isRestoring}
              style={{ 
                width: '100%', 
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                background: '#ef4444',
                color: 'white',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
            >
              <Upload size={18} />
              {isRestoring ? 'Restoring...' : 'Restore Backup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
