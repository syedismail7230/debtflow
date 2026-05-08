import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, User } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="bottom-nav">
      <div className="nav-items">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
          <span className="nav-label">Home</span>
        </NavLink>
        
        <NavLink to="/calculator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-primary">
            <Calculator size={28} />
          </div>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={24} />
          <span className="nav-label">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
