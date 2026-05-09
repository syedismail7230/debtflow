import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="bottom-nav">
      <div className="nav-items">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={24} />
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
