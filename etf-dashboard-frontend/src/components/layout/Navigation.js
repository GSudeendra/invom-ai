import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    path: '/',
    label: 'Basic Dashboard',
    description: 'Simple ETF listing',
    icon: '📊'
  },
  {
    path: '/enhanced',
    label: 'Enhanced Dashboard',
    description: 'Advanced features & analytics',
    icon: '🚀'
  },
  {
    path: '/intelligent',
    label: 'Intelligent Dashboard',
    description: 'Smart categorization & AI insights',
    icon: '🧠'
  },
  {
    path: '/swing-trading',
    label: 'Swing Trading',
    description: 'Technical analysis & signals',
    icon: '📈'
  }
];

const Navigation = () => {
  const location = useLocation();
  return (
    <aside className="sidebar-nav">
      <div className="sidebar-title">ETF Dashboard</div>
      <nav className="sidebar-links">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link${isActive ? ' active' : ''}`}
              title={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Navigation; 