import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <header className="top-header glass-panel">
      <div className="page-title">Overview</div>

      <div className="header-actions">
        <button className="user-profile" title="Notifications" style={{ padding: '8px' }}>
          <Bell size={20} color="var(--text-secondary)" />
        </button>

        <div className="user-profile">
          <div className="avatar">{initials}</div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
            {user?.name ?? 'Guest'}
          </span>
        </div>

        <button
          title="Logout"
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            transition: 'all 150ms ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
            (e.currentTarget as HTMLElement).style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
        >
          <LogOut size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
