import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, User, Settings, Bell, CreditCard, LogOut, X, ShieldCheck, Crown, Plus, Trash2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, deleteUser, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, writeBatch, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth, db, logout } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission } from '../hooks/usePushNotifications';
import './Profile.css';

const ADMIN_EMAIL = 'admin@debtflow.app';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userSettings, accountCreatedAt, isInFreeTrial } = useAuth();
  const [activeModal, setActiveModal] = useState(null);

  // ── Profile edit ──────────────────────────────────────────────────────────
  const [nameInput, setNameInput] = useState(currentUser?.displayName || '');
  const [photoInput, setPhotoInput] = useState(currentUser?.photoURL || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // ── Password change ───────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── Payment methods ───────────────────────────────────────────────────────
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pmLoading, setPmLoading] = useState(false);
  const [newPmType, setNewPmType] = useState('UPI');
  const [newPmLabel, setNewPmLabel] = useState('');
  const [newPmValue, setNewPmValue] = useState('');
  const [addingPm, setAddingPm] = useState(false);

  // ── Subscription / Pro badge ──────────────────────────────────────────────
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  // ── Delete account ────────────────────────────────────────────────────────
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // ── Load payment methods ──────────────────────────────────────────────────
  const loadPaymentMethods = async () => {
    if (!currentUser) return;
    setPmLoading(true);
    try {
      const q = query(collection(db, 'paymentMethods'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      setPaymentMethods(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setPmLoading(false);
  };

  // ── Load subscription ─────────────────────────────────────────────────────
  const loadSubscription = async () => {
    if (!currentUser) return;
    setSubLoading(true);
    try {
      const snap = await getDoc(doc(db, 'subscriptions', currentUser.uid));
      setSubscription(snap.exists() ? snap.data() : null);
    } catch (e) { console.error(e); }
    setSubLoading(false);
  };

  useEffect(() => {
    loadPaymentMethods();
    loadSubscription();
  }, [currentUser]);

  const isProMember = subscription?.status === 'active' &&
    subscription?.endDate && new Date(subscription.endDate) > new Date();

  const updateSetting = async (key, value) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { [key]: value }, { merge: true });
    } catch (err) { console.error(err); }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true); setProfileMsg('');
    try {
      await updateProfile(auth.currentUser, { displayName: nameInput, photoURL: photoInput });
      // Also update the users doc so admin can see the name
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: nameInput, email: currentUser.email
      }, { merge: true });
      setProfileMsg('✅ Profile updated!');
    } catch (e) { setProfileMsg('❌ Failed to update.'); }
    setIsUpdating(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return setPasswordMsg('All fields are required.');
    if (newPassword !== confirmPassword) return setPasswordMsg('New passwords do not match.');
    if (newPassword.length < 6) return setPasswordMsg('New password must be at least 6 characters.');
    setIsChangingPassword(true); setPasswordMsg('');
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordMsg('✅ Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      if (err.code === 'auth/wrong-password') setPasswordMsg('❌ Current password is incorrect.');
      else if (err.code === 'auth/weak-password') setPasswordMsg('❌ New password is too weak.');
      else setPasswordMsg(`❌ ${err.message}`);
    }
    setIsChangingPassword(false);
  };

  const handleAddPaymentMethod = async () => {
    if (!newPmLabel || !newPmValue) return;
    setAddingPm(true);
    try {
      await addDoc(collection(db, 'paymentMethods'), {
        userId: currentUser.uid,
        type: newPmType,
        label: newPmLabel,
        value: newPmValue,
        createdAt: new Date().toISOString()
      });
      setNewPmLabel(''); setNewPmValue('');
      await loadPaymentMethods();
    } catch (e) { console.error(e); }
    setAddingPm(false);
  };

  const handleDeletePaymentMethod = async (pmId) => {
    if (!window.confirm('Remove this payment method?')) return;
    try {
      await deleteDoc(doc(db, 'paymentMethods', pmId));
      await loadPaymentMethods();
    } catch (e) { console.error(e); }
  };

  const handleNotificationToggle = async (key, currentValue) => {
    const newVal = !currentValue;
    if (key === 'pushNotifications' && newVal) {
      const permission = await requestNotificationPermission();
      if (permission === 'denied') {
        alert('Browser notifications are blocked. Please enable them in your browser settings.');
        return;
      }
      if (permission === 'unsupported') {
        alert('Your browser does not support push notifications.');
        return;
      }
    }
    await updateSetting(key, newVal);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ Delete Account?\n\nThis will permanently delete ALL your loans, transactions, and account data. This cannot be undone.')) return;
    setIsDeletingAccount(true);
    try {
      const batch = writeBatch(db);
      const loansSnap = await getDocs(query(collection(db, 'loans'), where('userId', '==', currentUser.uid)));
      loansSnap.forEach(d => batch.delete(d.ref));
      const txSnap = await getDocs(query(collection(db, 'transactions'), where('userId', '==', currentUser.uid)));
      txSnap.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'users', currentUser.uid));
      await batch.commit();
      await deleteUser(auth.currentUser);
      navigate('/login');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') alert('For security, please log out and log back in before deleting your account.');
      else alert('Failed to delete account. Please try again.');
    }
    setIsDeletingAccount(false);
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); } catch (err) { console.error(err); }
  };

  const inputStyle = { width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '15px', outline: 'none' };

  const renderModalContent = () => {
    switch (activeModal) {

      case 'Personal Information':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Full Name</label>
              <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Profile Picture URL</label>
              <input type="text" value={photoInput} onChange={e => setPhotoInput(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Email Address</label>
              <input type="email" value={currentUser?.email} disabled style={{ ...inputStyle, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)' }} />
            </div>
            {profileMsg && <p style={{ textAlign: 'center', fontSize: '13px', color: profileMsg.startsWith('✅') ? 'var(--color-green)' : '#ef4444' }}>{profileMsg}</p>}
            <button onClick={handleUpdateProfile} disabled={isUpdating}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--color-purple)', color: 'white', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        );

      case 'Manage Subscription': {
        const isProMemberModal = subscription?.status === 'active' && subscription?.endDate && new Date(subscription.endDate) > new Date();
        const daysLeft = accountCreatedAt && isInFreeTrial
          ? Math.max(0, 30 - Math.floor((new Date() - new Date(accountCreatedAt)) / (1000 * 60 * 60 * 24)))
          : 0;
        const subEndDate = subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
        const subDaysLeft = subscription?.endDate ? Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Status card */}
            <div style={{
              background: isProMemberModal
                ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.1))'
                : isInFreeTrial
                ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))'
                : 'rgba(239,68,68,0.08)',
              border: `1px solid ${isProMemberModal ? 'rgba(245,158,11,0.3)' : isInFreeTrial ? 'rgba(139,92,246,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: '20px', padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isProMemberModal ? 'rgba(245,158,11,0.2)' : 'rgba(139,92,246,0.2)'
                }}>
                  {isProMemberModal ? <Crown size={22} color="#f59e0b" /> : <ShieldCheck size={22} color="#8b5cf6" />}
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>
                    {isProMemberModal ? '👑 Pro Member' : isInFreeTrial ? '🎁 Free Trial' : '⚠️ Trial Expired'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    {isProMemberModal
                      ? `Active until ${subEndDate} · ${subDaysLeft} days left`
                      : isInFreeTrial
                      ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in free trial`
                      : 'Subscribe to continue using all features'}
                  </p>
                </div>
              </div>

              {/* Progress bar for trial */}
              {isInFreeTrial && !isProMemberModal && (
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    width: `${((30 - daysLeft) / 30) * 100}%`,
                    background: daysLeft > 7 ? '#8b5cf6' : daysLeft > 3 ? '#f97316' : '#ef4444',
                    transition: 'width 0.5s'
                  }} />
                </div>
              )}
            </div>

            {/* Plan details */}
            <div style={{ background: 'var(--bg-main)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Plan',       value: isProMemberModal ? 'DebtFlow Pro' : 'Free Trial' },
                { label: 'Price',      value: isProMemberModal ? '₹100 / month' : 'Free for 30 days' },
                { label: 'Renews',     value: isProMemberModal ? subEndDate || '—' : '—' },
                { label: 'Payment ID', value: subscription?.razorpayPaymentId ? `...${subscription.razorpayPaymentId.slice(-8)}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>{label}</span>
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {!isProMemberModal && (
              <button
                onClick={() => { setActiveModal(null); navigate('/subscription'); }}
                style={{
                  width: '100%', padding: '16px', borderRadius: '18px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                  color: 'white', fontWeight: '800', fontSize: '15px',
                  boxShadow: '0 6px 20px rgba(139,92,246,0.4)'
                }}
              >
                🔒 Subscribe — ₹100/month
              </button>
            )}

            {isProMemberModal && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setActiveModal(null); navigate('/subscription'); }}
                  style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', fontWeight: '700', fontSize: '14px' }}
                >
                  🔄 Renew Early
                </button>
                <button
                  onClick={() => alert('To cancel, please email support@debtflow.app')}
                  style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: '700', fontSize: '14px' }}
                >
                  Cancel Plan
                </button>
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
              Questions? Contact{' '}
              <a href="mailto:support@debtflow.app" style={{ color: '#8b5cf6' }}>support@debtflow.app</a>
            </p>
          </div>
        );
      }

      case 'Change Password':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Current Password', val: currentPassword, set: setCurrentPassword },
              { label: 'New Password',     val: newPassword,     set: setNewPassword },
              { label: 'Confirm New Password', val: confirmPassword, set: setConfirmPassword }
            ].map(({ label, val, set }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{label}</label>
                <input type="password" value={val} onChange={e => set(e.target.value)} style={inputStyle} />
              </div>
            ))}
            {passwordMsg && <p style={{ fontSize: '13px', textAlign: 'center', color: passwordMsg.startsWith('✅') ? 'var(--color-green)' : '#ef4444' }}>{passwordMsg}</p>}
            <button onClick={handleChangePassword} disabled={isChangingPassword}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--color-purple)', color: 'white', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        );

      case 'Payment Methods':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pmLoading ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>
            ) : paymentMethods.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>No payment methods saved.</p>
            ) : (
              paymentMethods.map(pm => (
                <div key={pm.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-main)', borderRadius: '16px', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CreditCard size={20} color="#8b5cf6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{pm.label}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{pm.type} · {pm.value}</p>
                  </div>
                  <button onClick={() => handleDeletePaymentMethod(pm.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer' }}>
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              ))
            )}

            {/* Add new method */}
            <div style={{ background: 'var(--bg-main)', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px dashed rgba(255,255,255,0.15)' }}>
              <p style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>+ Add Payment Method</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['UPI', 'Card', 'Net Banking', 'Wallet'].map(t => (
                  <button key={t} onClick={() => setNewPmType(t)}
                    style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      background: newPmType === t ? 'var(--color-purple)' : 'rgba(255,255,255,0.08)', color: 'white' }}>
                    {t}
                  </button>
                ))}
              </div>
              <input placeholder={newPmType === 'UPI' ? 'UPI ID label e.g. "Personal UPI"' : 'Label e.g. "HDFC Debit"'}
                value={newPmLabel} onChange={e => setNewPmLabel(e.target.value)} style={{ ...inputStyle, padding: '12px 16px', fontSize: '13px' }} />
              <input placeholder={newPmType === 'UPI' ? 'yourname@upi' : newPmType === 'Card' ? '**** **** **** 1234' : 'Account / ID'}
                value={newPmValue} onChange={e => setNewPmValue(e.target.value)} style={{ ...inputStyle, padding: '12px 16px', fontSize: '13px' }} />
              <button onClick={handleAddPaymentMethod} disabled={addingPm || !newPmLabel || !newPmValue}
                style={{ padding: '12px', borderRadius: '14px', background: 'var(--color-purple)', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                {addingPm ? 'Saving...' : 'Save Method'}
              </button>
            </div>
          </div>
        );

      case 'Notifications & Reminders':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { title: 'Push Notifications', sub: Notification.permission === 'denied' ? '⚠️ Blocked in browser settings' : 'Get alerts for overdue loans', key: 'pushNotifications' },
              { title: 'Email Reminders', sub: 'Receive upcoming due date emails', key: 'emailReminders' },
              { title: 'Marketing Emails', sub: 'Updates and offers', key: 'marketingEmails' }
            ].map((item) => {
              const isActive = userSettings?.[item.key] || false;
              return (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: '500', fontSize: '15px', marginBottom: '2px' }}>{item.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.sub}</p>
                  </div>
                  <div onClick={() => handleNotificationToggle(item.key, isActive)}
                    style={{ width: '50px', height: '28px', borderRadius: '14px', background: isActive ? 'var(--color-purple)' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: 'white', position: 'absolute', top: '2px', left: isActive ? '24px' : '2px', transition: 'all 0.3s' }} />
                  </div>
                </div>
              );
            })}
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.5 }}>
              📧 Email reminders require EmailJS setup in <code>src/hooks/useEmailReminder.js</code>. Add your service ID, template ID, and public key.
            </p>
          </div>
        );

      case 'Account Settings':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px' }}>
              <div>
                <p style={{ color: 'white', fontWeight: '500' }}>Currency</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Used across the app</p>
              </div>
              <select value={userSettings?.currency || 'INR (₹)'}
                onChange={e => updateSetting('currency', e.target.value)}
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', outline: 'none', textAlign: 'right', cursor: 'pointer' }}>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '16px' }}>
              <div>
                <p style={{ color: 'white', fontWeight: '500' }}>Language</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>App display language</p>
              </div>
              <select value={userSettings?.language || 'English'}
                onChange={e => updateSetting('language', e.target.value)}
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', outline: 'none', textAlign: 'right', cursor: 'pointer' }}>
                <option value="English">🇬🇧 English</option>
                <option value="Hindi">🇮🇳 हिंदी</option>
                <option value="Spanish">🇪🇸 Español</option>
              </select>
            </div>
            <button onClick={handleDeleteAccount} disabled={isDeletingAccount}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontWeight: '600', fontSize: '15px', marginTop: '16px', cursor: 'pointer', opacity: isDeletingAccount ? 0.6 : 1 }}>
              {isDeletingAccount ? 'Deleting...' : '🗑 Delete Account'}
            </button>
          </div>
        );

      default: return null;
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
      <div className="top-bar mb-6">
        <button className="icon-btn-dark" onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
        <div className="text-center">
          <p className="header-title text-white font-semibold">Profile</p>
        </div>
        <div style={{ width: 48 }}></div>
      </div>

      {/* Profile Info */}
      <div className="profile-info-section">
        <div className="profile-avatar-large">
          <img src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200'} alt="Profile" />
        </div>
        <h2 className="profile-name">{currentUser?.displayName || 'User'}</h2>
        <p className="profile-email">{currentUser?.email}</p>

        {/* Dynamic Pro / Free badge */}
        <div className="profile-badge" style={{
          background: isProMember ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(139,92,246,0.15)',
          color: isProMember ? 'white' : '#8b5cf6',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          {isProMember ? <><Crown size={13} /> Pro Member</> : <><ShieldCheck size={13} /> Free Plan</>}
        </div>

        {/* Admin link */}
        {currentUser?.email === ADMIN_EMAIL && (
          <button onClick={() => navigate('/admin')}
            style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '20px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            ⚡ Go to Admin Panel
          </button>
        )}
      </div>

      {/* Settings List */}
      <div className="settings-list">
        {[
          { label: 'Personal Information', icon: <User size={20} color="#8b5cf6" />, bg: 'bg-purple-light' },
          { label: 'Change Password', icon: <ShieldCheck size={20} color="#ef4444" />, bg: '', style: { background: 'rgba(239,68,68,0.12)' } },
          { label: 'Manage Subscription', icon: <Crown size={20} color="#f59e0b" />, bg: '', style: { background: 'rgba(245,158,11,0.15)' } },
          { label: 'Payment Methods', icon: <CreditCard size={20} color="#a3e635" />, bg: 'bg-green-light' },
          { label: 'Notifications & Reminders', icon: <Bell size={20} color="#f97316" />, bg: 'bg-orange-light' },
          { label: 'Account Settings', icon: <Settings size={20} color="white" />, bg: 'bg-gray-light' },
        ].map(({ label, icon, bg, style }) => (
          <div key={label} className="setting-item" onClick={() => setActiveModal(label)}>
            <div className={`setting-icon-wrapper ${bg}`} style={style}>{icon}</div>
            <span className="setting-label">{label}</span>
            <ChevronLeft size={16} className="text-muted" style={{ transform: 'rotate(180deg)' }} />
          </div>
        ))}
      </div>

      <button className="logout-btn mt-8" onClick={handleLogout}>
        <LogOut size={20} className="logout-icon" />
        <span>Log Out</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="profile-modal-backdrop" onClick={() => setActiveModal(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="profile-bottom-sheet">
              <div className="profile-modal-handle" />
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{activeModal}</h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                  <X size={20} color="white" />
                </button>
              </div>
              <div style={{ width: '100%', overflowY: 'auto', maxHeight: '60vh' }}>
                {renderModalContent()}
              </div>
              <button onClick={() => setActiveModal(null)}
                style={{ width: '100%', padding: '16px', borderRadius: '20px', backgroundColor: 'var(--color-purple)', color: 'white', border: 'none', fontWeight: '600', fontSize: '15px', marginTop: '24px', cursor: 'pointer' }}>
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
