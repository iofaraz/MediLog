import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Settings, Activity } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Patients', path: '/patients', icon: <Users size={20} /> },
    { name: 'Visits', path: '/visits', icon: <CalendarDays size={20} /> },
    { name: 'Audit Logs', path: '/audit', icon: <Activity size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar" style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
      <div className="sidebar-header">
        <div className="logo-icon">
          <Activity color="white" size={20} />
        </div>
        <div className="logo-text" style={{ color: '#0f172a' }}>MediLog</div>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
