import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, User, Settings, Bell, CreditCard, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);

  const handleSectionClick = (sectionName) => {
    setActiveModal(sectionName);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content pb-10"
    >
      {/* Top Bar */}
      <div className="top-bar mb-6">
        <button className="icon-btn-dark" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="header-title text-white font-semibold">Profile</p>
        </div>
        <div style={{ width: 48 }}></div> {/* Spacer */}
      </div>

      {/* Profile Info */}
      <div className="profile-info-section">
        <div className="profile-avatar-large">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200" alt="Profile" />
        </div>
        <h2 className="profile-name">Alex Morrison</h2>
        <p className="profile-email">alex.m@example.com</p>
        <div className="profile-badge">Pro Member</div>
      </div>

      {/* Settings List */}
      <div className="settings-list">
        <div className="setting-item" onClick={() => handleSectionClick('Personal Information')}>
          <div className="setting-icon-wrapper bg-purple-light">
            <User size={20} color="#8b5cf6" />
          </div>
          <span className="setting-label">Personal Information</span>
          <ChevronLeft size={16} className="text-muted" style={{ transform: 'rotate(180deg)' }} />
        </div>

        <div className="setting-item" onClick={() => handleSectionClick('Payment Methods')}>
          <div className="setting-icon-wrapper bg-green-light">
            <CreditCard size={20} color="#a3e635" />
          </div>
          <span className="setting-label">Payment Methods</span>
          <ChevronLeft size={16} className="text-muted" style={{ transform: 'rotate(180deg)' }} />
        </div>

        <div className="setting-item" onClick={() => handleSectionClick('Notifications & Reminders')}>
          <div className="setting-icon-wrapper bg-orange-light">
            <Bell size={20} color="#f97316" />
          </div>
          <span className="setting-label">Notifications & Reminders</span>
          <ChevronLeft size={16} className="text-muted" style={{ transform: 'rotate(180deg)' }} />
        </div>

        <div className="setting-item" onClick={() => handleSectionClick('Account Settings')}>
          <div className="setting-icon-wrapper bg-gray-light">
            <Settings size={20} color="white" />
          </div>
          <span className="setting-label">Account Settings</span>
          <ChevronLeft size={16} className="text-muted" style={{ transform: 'rotate(180deg)' }} />
        </div>
      </div>

      <button className="logout-btn mt-8" onClick={() => navigate('/login')}>
        <LogOut size={20} className="logout-icon" />
        <span>Log Out</span>
      </button>

      {/* Dynamic Profile Modal */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="profile-modal-backdrop"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="profile-bottom-sheet"
            >
              <div className="profile-modal-handle"></div>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{activeModal}</h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={20} color="white" />
                </button>
              </div>
              
              <div style={{ width: '100%', padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '14px' }}>
                  Configuration for <strong>{activeModal}</strong> will appear here.<br/>This feature is coming soon in the next update!
                </p>
              </div>
              
              <button 
                onClick={() => setActiveModal(null)}
                style={{ width: '100%', padding: '16px', borderRadius: '20px', backgroundColor: 'var(--color-purple)', color: 'white', border: 'none', fontWeight: '600', fontSize: '15px', marginTop: '24px', cursor: 'pointer' }}
              >
                Close Menu
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Profile;
