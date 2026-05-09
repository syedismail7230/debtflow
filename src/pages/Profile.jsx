import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, User, Settings, Bell, CreditCard, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, logout } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userSettings } = useAuth();
  const [activeModal, setActiveModal] = useState(null);

  const handleSectionClick = (sectionName) => {
    setActiveModal(sectionName);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const [nameInput, setNameInput] = useState(currentUser?.displayName || '');
  const [photoInput, setPhotoInput] = useState(currentUser?.photoURL || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateProfile(auth.currentUser, { displayName: nameInput, photoURL: photoInput });
      alert('Profile updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to update profile.');
    }
    setIsUpdating(false);
  };

  const updateSetting = async (key, value) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { [key]: value }, { merge: true });
    } catch (err) {
      console.error("Error updating setting:", err);
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Personal Information':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Full Name</label>
              <input 
                type="text" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '15px', outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Profile Picture URL</label>
              <input 
                type="text" 
                value={photoInput} 
                onChange={(e) => setPhotoInput(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '15px', outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Email Address</label>
              <input 
                type="email" 
                value={currentUser?.email} 
                disabled 
                style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '15px' }} 
              />
            </div>
            <button 
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--color-purple)', color: 'white', border: 'none', fontWeight: '600', fontSize: '15px', marginTop: '8px', cursor: 'pointer' }}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        );
      case 'Payment Methods':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--color-purple)' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16px' }}>
                 <CreditCard size={20} color="#8b5cf6" />
               </div>
               <div style={{ flex: 1 }}>
                 <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>Chase Sapphire</p>
                 <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>**** **** **** 4242</p>
               </div>
             </div>
             <button style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px dashed rgba(255,255,255,0.2)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
               + Add Payment Method
             </button>
          </div>
        );
      case 'Notifications & Reminders':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {[
               { title: 'Push Notifications', sub: 'Get alerts on your phone', key: 'pushNotifications' },
               { title: 'Email Reminders', sub: 'Receive upcoming due dates', key: 'emailReminders' },
               { title: 'Marketing Emails', sub: 'Updates and offers', key: 'marketingEmails' }
             ].map((item, i) => {
               const isActive = userSettings?.[item.key] || false;
               return (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <p style={{ color: 'white', fontWeight: '500', fontSize: '15px', marginBottom: '2px' }}>{item.title}</p>
                     <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.sub}</p>
                   </div>
                   <div 
                     onClick={() => updateSetting(item.key, !isActive)}
                     style={{ width: '50px', height: '28px', borderRadius: '14px', background: isActive ? 'var(--color-purple)' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}
                   >
                     <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: 'white', position: 'absolute', top: '2px', left: isActive ? '24px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                   </div>
                 </div>
               );
             })}
          </div>
        );
      case 'Account Settings':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px' }}>
               <p style={{ color: 'white', fontWeight: '500' }}>Currency</p>
               <select 
                 value={userSettings?.currency || 'USD ($)'} 
                 onChange={(e) => updateSetting('currency', e.target.value)}
                 style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', outline: 'none', textAlign: 'right', cursor: 'pointer' }}
               >
                 <option value="USD ($)">USD ($)</option>
                 <option value="EUR (€)">EUR (€)</option>
                 <option value="GBP (£)">GBP (£)</option>
                 <option value="INR (₹)">INR (₹)</option>
               </select>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px' }}>
               <p style={{ color: 'white', fontWeight: '500' }}>Language</p>
               <select 
                 value={userSettings?.language || 'English'} 
                 onChange={(e) => updateSetting('language', e.target.value)}
                 style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', outline: 'none', textAlign: 'right', cursor: 'pointer' }}
               >
                 <option value="English">English</option>
                 <option value="Spanish">Spanish</option>
                 <option value="French">French</option>
               </select>
             </div>
             <button style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '600', fontSize: '15px', marginTop: '16px', cursor: 'pointer' }}>
               Delete Account
             </button>
          </div>
        );
      default:
        return null;
    }
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
        <div style={{ width: 48 }}></div>
      </div>

      {/* Profile Info */}
      <div className="profile-info-section">
        <div className="profile-avatar-large">
          <img src={currentUser?.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200"} alt="Profile" />
        </div>
        <h2 className="profile-name">{currentUser?.displayName || 'User'}</h2>
        <p className="profile-email">{currentUser?.email}</p>
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

      <button className="logout-btn mt-8" onClick={handleLogout}>
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
              
              <div style={{ width: '100%' }}>
                {renderModalContent()}
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
