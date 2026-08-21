import { useState, useEffect, type ChangeEvent } from 'react';
import { Database, Download, Upload, AlertTriangle, ShieldCheck, Building, Save, Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SETTINGS_UPDATED_EVENT = 'medilog:settings-updated';

const Settings = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [clinicSettings, setClinicSettings] = useState({
    clinicName: '',
    clinicAddress: '',
    contactNumber: '',
    contactEmail: '',
    doctorName: '',
    profilePicture: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const result = await window.api.settings.getAll();
      if (result.success && result.data) {
        setClinicSettings(prev => ({
          ...prev,
          ...result.data
        }));
      }
    };
    fetchSettings();
  }, []);

  const handleProfilePictureChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setClinicSettings((current) => ({ ...current, profilePicture: result }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setMessage(null);
    try {
      const result = await window.api.backup.create();
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Backup created successfully!' });
      } else if (result.error !== 'Backup cancelled.') {
        setMessage({ type: 'error', text: result.error || 'Failed to create backup' });
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
    setIsBackingUp(false);
  };

  const handleRestore = async () => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast(
        (t) => (
          <span>
            <strong>⚠️ Warning:</strong> This will overwrite all current data and restart the app.
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => { toast.dismiss(t.id); resolve(true); }}
                style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Restore
              </button>
              <button
                onClick={() => { toast.dismiss(t.id); resolve(false); }}
                style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </span>
        ),
        { duration: Infinity, position: 'top-center' }
      );
    });
    if (!confirmed) return;

    setIsRestoring(true);
    setMessage(null);
    try {
      const result = await window.api.backup.restore();
      if (!result.success && result.error !== 'Restore cancelled.') {
        setMessage({ type: 'error', text: result.error || 'Failed to restore backup' });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Restore completed. Restarting the app...' });
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
    setIsRestoring(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setMessage(null);
    try {
      const result = await window.api.settings.update(clinicSettings);
      if (result.success) {
        window.dispatchEvent(new CustomEvent<Record<string, string>>(SETTINGS_UPDATED_EVENT, { detail: result.data || clinicSettings }));
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while saving settings' });
    }
    setIsSavingSettings(false);
  };

  return (
    <div className="page-container" style={{ padding: '32px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage application preferences and data</p>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
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

      {/* Clinic Information Section */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building size={24} color="var(--primary-color)" />
          Clinic Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px', marginBottom: '24px', alignItems: 'start' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Profile Photo</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: clinicSettings.profilePicture ? `url(${clinicSettings.profilePicture}) center/cover no-repeat` : '#e0e7ff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {!clinicSettings.profilePicture && <Camera size={34} />}
              </div>
              <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Upload size={16} />
                Upload Photo
                <input type="file" accept="image/*" onChange={handleProfilePictureChange} style={{ display: 'none' }} />
              </label>
              {clinicSettings.profilePicture && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setClinicSettings((current) => ({ ...current, profilePicture: '' }))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <X size={16} />
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Clinic Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. City General Clinic"
              value={clinicSettings.clinicName}
              onChange={(e) => setClinicSettings({ ...clinicSettings, clinicName: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Clinician Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Primary Clinician"
              value={clinicSettings.doctorName}
              onChange={(e) => setClinicSettings({ ...clinicSettings, doctorName: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contact Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. +1 234 567 8900"
              value={clinicSettings.contactNumber}
              onChange={(e) => setClinicSettings({ ...clinicSettings, contactNumber: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Clinic Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Full address"
              value={clinicSettings.clinicAddress}
              onChange={(e) => setClinicSettings({ ...clinicSettings, clinicAddress: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contact Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="contact@clinic.com"
              value={clinicSettings.contactEmail}
              onChange={(e) => setClinicSettings({ ...clinicSettings, contactEmail: e.target.value })}
            />
          </div>
          </div>
        </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
          <Save size={18} />
          {isSavingSettings ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Database Management Section */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={24} color="var(--primary-color)" />
          Database Management
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Backup Section */}
          <div style={{
            padding: '24px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Create Backup</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Save a secure snapshot of the entire MediLog database to an external location like a USB drive or secure folder.
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
            background: '#fff1f2',
            borderRadius: '12px',
            border: '1px solid #fecdd3'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', color: '#fca5a5' }}>Restore Backup</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Restore the database from a previously saved backup file. <strong style={{ color: '#f87171' }}>Warning: This will overwrite all current data.</strong>
            </p>
            <button
              onClick={handleRestore}
              disabled={isBackingUp || isRestoring}
              className="btn btn-danger"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
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
