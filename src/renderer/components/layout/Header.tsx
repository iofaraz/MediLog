import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

const SETTINGS_UPDATED_EVENT = 'medilog:settings-updated';

const Header = () => {
  const [clinicName, setClinicName] = useState('MediLog');
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const result = await window.api.settings.getAll();
      if (result.success && result.data) {
        setClinicName(result.data.clinicName || 'MediLog');
        setProfilePicture(result.data.profilePicture || '');
      }
    };

    loadSettings();

    const handleSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<Record<string, string>>;
      if (customEvent.detail) {
        setClinicName(customEvent.detail.clinicName || 'MediLog');
        setProfilePicture(customEvent.detail.profilePicture || '');
      }
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdated);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdated);
    };
  }, []);

  const initials = clinicName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'M';

  return (
    <header className="top-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 0 rgba(15, 23, 42, 0.02)' }}>
      <div className="page-title" style={{ color: '#0f172a' }}>Overview</div>

      <div className="header-actions">
        <button className="user-profile" title="Notifications" style={{ padding: '8px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <Bell size={20} color="var(--text-tertiary)" />
        </button>

        <div className="user-profile" style={{ border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div
            className="avatar"
            style={
              profilePicture
                ? {
                    backgroundImage: `url(${profilePicture})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            {!profilePicture && initials}
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
            {clinicName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
