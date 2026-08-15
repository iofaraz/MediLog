import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="top-header glass-panel">
      <div className="page-title">
        {/* We can make this dynamic later based on route */}
        Overview
      </div>
      
      <div className="header-actions">
        <button className="user-profile" title="Notifications">
          <Bell size={20} color="var(--text-secondary)" />
        </button>
        <button className="user-profile" title="Search">
          <Search size={20} color="var(--text-secondary)" />
        </button>
        <div className="user-profile" title="Dr. Admin">
          <div className="avatar">D</div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
            Dr. Admin
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
