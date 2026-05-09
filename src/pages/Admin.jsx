import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, CreditCard, ShieldCheck,
  Search, Check, X, LogOut, RefreshCw, ChevronDown,
  AlertCircle, Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, getDocs, doc, setDoc,
  updateDoc, orderBy, where
} from 'firebase/firestore';
import { db, auth, logout } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const ADMIN_EMAIL = 'admin@debtflow.app';
const SUBSCRIPTION_AMOUNT = 100; // ₹100/month

const Admin = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState({});
  const [loans, setLoans] = useState({});         // userId → count
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  // ── Grant subscription modal ──
  const [grantModal, setGrantModal] = useState(null);  // { userId, userEmail, userName }
  const [grantMonths, setGrantMonths] = useState(1);

  // Guard: only admin can access
  useEffect(() => {
    if (currentUser && currentUser.email !== ADMIN_EMAIL) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch all users from Firestore
      const usersSnap = await getDocs(collection(db, 'users'));
      const userList = [];
      usersSnap.forEach(d => userList.push({ id: d.id, ...d.data() }));

      // Fetch all subscriptions
      const subSnap = await getDocs(collection(db, 'subscriptions'));
      const subMap = {};
      subSnap.forEach(d => { subMap[d.id] = { id: d.id, ...d.data() }; });

      // Fetch loan counts per user
      const loanSnap = await getDocs(collection(db, 'loans'));
      const loanCount = {};
      loanSnap.forEach(d => {
        const uid = d.data().userId;
        loanCount[uid] = (loanCount[uid] || 0) + 1;
      });

      setUsers(userList);
      setSubscriptions(subMap);
      setLoans(loanCount);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const activateSubscription = async (userId, userEmail, userName, months = 1) => {
    setActionLoading(userId + '_activate');
    setGrantModal(null);
    try {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + months);
      await setDoc(doc(db, 'subscriptions', userId), {
        userId, userEmail: userEmail || '', userName: userName || '',
        status: 'active',
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        amount: 0,  // Free grant — no charge
        freeMonthsGranted: months,
        activatedByAdmin: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await fetchAll();
      showToast(`🎁 ${months} month${months > 1 ? 's' : ''} free subscription granted to ${userEmail || userId}`);
    } catch (e) {
      showToast('❌ Failed to grant subscription', 'error');
    }
    setActionLoading(null);
  };

  const cancelSubscription = async (userId, userEmail) => {
    if (!window.confirm(`Cancel subscription for ${userEmail}?`)) return;
    setActionLoading(userId + '_cancel');
    try {
      await updateDoc(doc(db, 'subscriptions', userId), {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
      await fetchAll();
      showToast(`⛔ Subscription cancelled for ${userEmail}`);
    } catch (e) {
      showToast('❌ Failed to cancel', 'error');
    }
    setActionLoading(null);
  };

  const extendSubscription = async (userId, userEmail) => {
    setActionLoading(userId + '_extend');
    try {
      const sub = subscriptions[userId];
      const currentEnd = sub?.endDate ? new Date(sub.endDate) : new Date();
      const newEnd = new Date(currentEnd);
      newEnd.setMonth(newEnd.getMonth() + 1);
      await updateDoc(doc(db, 'subscriptions', userId), {
        status: 'active',
        endDate: newEnd.toISOString(),
        updatedAt: new Date().toISOString()
      });
      await fetchAll();
      showToast(`🔄 Extended by 1 month for ${userEmail}`);
    } catch (e) {
      showToast('❌ Failed to extend', 'error');
    }
    setActionLoading(null);
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const activeCount = Object.values(subscriptions).filter(s => s.status === 'active').length;
  const expiredCount = Object.values(subscriptions).filter(s => s.status === 'cancelled' || s.status === 'expired').length;
  const monthlyRevenue = activeCount * SUBSCRIPTION_AMOUNT;

  // ─── Filter + Search ──────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const sub = subscriptions[u.id];
    const status = sub?.status || 'none';
    const matchesFilter =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? status === 'active' :
      filterStatus === 'expired' ? (status === 'cancelled' || status === 'expired') :
      filterStatus === 'none' ? !sub : true;
    const matchesSearch = !search ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName || u.id).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (userId) => {
    const sub = subscriptions[userId];
    if (!sub) return { label: 'No Sub', color: '#9e9ea5', bg: 'rgba(158,158,165,0.1)' };
    if (sub.status === 'active') {
      const daysLeft = Math.ceil((new Date(sub.endDate) - new Date()) / (1000*60*60*24));
      return { label: daysLeft > 0 ? `Active · ${daysLeft}d left` : 'Expired', color: daysLeft > 0 ? '#a3e635' : '#ef4444', bg: daysLeft > 0 ? 'rgba(163,230,53,0.1)' : 'rgba(239,68,68,0.1)' };
    }
    if (sub.status === 'cancelled') return { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    return { label: sub.status, color: '#9e9ea5', bg: 'rgba(158,158,165,0.1)' };
  };

  if (!currentUser) return null;

  return (
    <div className="admin-page">
      {/* Grant Free Subscription Modal */}
      <AnimatePresence>
        {grantModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setGrantModal(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'fixed',
                top: '50%', left: '16px', right: '16px',
                transform: 'translateY(-50%)',
                background: 'var(--bg-card)', borderRadius: '24px', padding: '24px',
                zIndex: 1001,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                maxWidth: '400px', margin: '0 auto'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Crown size={26} color="white" />
                </div>
                <h3 style={{ color: 'white', fontWeight: '800', fontSize: '18px', marginBottom: '4px' }}>Grant Free Subscription</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', wordBreak: 'break-all' }}>{grantModal.userEmail}</p>
              </div>

              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Duration</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {[1, 2, 3, 6, 12].map(m => (
                  <button key={m} onClick={() => setGrantMonths(m)}
                    style={{
                      flex: '1 1 60px', padding: '11px 8px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                      fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
                      background: grantMonths === m ? 'var(--color-purple)' : 'rgba(255,255,255,0.06)',
                      color: 'white', boxShadow: grantMonths === m ? '0 4px 12px rgba(139,92,246,0.4)' : 'none'
                    }}
                  >{m} mo</button>
                ))}
              </div>

              <div style={{ background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: '14px', padding: '12px 14px', marginBottom: '20px' }}>
                <p style={{ color: '#a3e635', fontSize: '13px', fontWeight: '600' }}>
                  🎁 Free grant — no charge to user<br />
                  <span style={{ fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}>Expires: {(() => { const d = new Date(); d.setMonth(d.getMonth() + grantMonths); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); })()}</span>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setGrantModal(null)}
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                  Cancel
                </button>
                <button
                  onClick={() => activateSubscription(grantModal.userId, grantModal.userEmail, grantModal.userName, grantMonths)}
                  disabled={actionLoading === grantModal.userId + '_activate'}
                  style={{ flex: 2, padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontWeight: '700', fontSize: '14px' }}>
                  {actionLoading === grantModal.userId + '_activate' ? 'Granting...' : `🎁 Grant ${grantMonths} Month${grantMonths > 1 ? 's' : ''} Free`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            style={{
              position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
              background: toast.type === 'error' ? '#ef4444' : '#8b5cf6',
              color: 'white', padding: '12px 24px', borderRadius: '16px',
              fontWeight: '600', fontSize: '14px', zIndex: 9999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
          >{toast.msg}</motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="admin-header">
        <div className="admin-brand">
          <div className="admin-logo"><Crown size={22} color="white" /></div>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '800' }}>DebtFlow Admin</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Subscription Management</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={fetchAll} className="admin-icon-btn" title="Refresh">
            <RefreshCw size={18} color="white" />
          </button>
          <button onClick={async () => { await logout(); navigate('/login'); }} className="admin-icon-btn" title="Logout">
            <LogOut size={18} color="white" />
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats Row */}
        <div className="admin-stats-grid">
          {[
            { icon: <Users size={22} />, label: 'Total Users',       value: totalUsers,       color: '#8b5cf6' },
            { icon: <ShieldCheck size={22} />, label: 'Active Subs', value: activeCount,      color: '#a3e635' },
            { icon: <TrendingUp size={22} />, label: 'Monthly Revenue', value: `₹${monthlyRevenue.toLocaleString()}`, color: '#f97316' },
            { icon: <AlertCircle size={22} />, label: 'Expired/Cancelled', value: expiredCount, color: '#ef4444' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="admin-stat-card"
            >
              <div className="admin-stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
              <p className="admin-stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="admin-stat-label">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="admin-controls">
          <div className="admin-search-bar">
            <Search size={16} color="#9e9ea5" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '14px', flex: 1 }}
            />
          </div>
          <div className="admin-filter-tabs">
            {['all', 'active', 'expired', 'none'].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`admin-filter-tab ${filterStatus === f ? 'active' : ''}`}
              >{f === 'none' ? 'No Sub' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div className="admin-spinner" />
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '16px' }}>Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>No users found</p>
          </div>
        ) : (
          <div className="admin-table">
            {/* No header row — replaced by card layout */}
            {filtered.map((user, i) => {
              const sub = subscriptions[user.id];
              const badge = getStatusBadge(user.id);
              const isActive = sub?.status === 'active' && sub?.endDate && new Date(sub.endDate) > new Date();
              const expiryStr = sub?.endDate
                ? new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                : null;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    background: 'var(--bg-card)', borderRadius: '18px', padding: '16px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', flexDirection: 'column', gap: '12px'
                  }}
                >
                  {/* Top row: avatar + info + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '13px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '800', fontSize: '17px'
                    }}>
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.displayName || 'No name'}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email || user.id}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      background: badge.bg, color: badge.color, whiteSpace: 'nowrap', flexShrink: 0
                    }}>{badge.label}</span>
                  </div>

                  {/* Meta row: loans + expiry */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '10px 12px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Loans</p>
                      <p style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{loans[user.id] || 0}</p>
                    </div>
                    <div style={{ flex: 2, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '10px 12px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Subscription Expires</p>
                      <p style={{ color: expiryStr ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: '700', fontSize: '13px' }}>{expiryStr || 'No active plan'}</p>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setGrantModal({ userId: user.id, userEmail: user.email, userName: user.displayName }); setGrantMonths(1); }}
                      disabled={!!actionLoading}
                      className="admin-action-btn green"
                      style={{ flex: '1 1 auto' }}
                    >
                      <Crown size={13} />
                      Gift Free Sub
                    </button>
                    {isActive && (
                      <>
                        <button
                          onClick={() => extendSubscription(user.id, user.email)}
                          disabled={actionLoading === user.id + '_extend'}
                          className="admin-action-btn purple"
                        >
                          <RefreshCw size={13} />
                          {actionLoading === user.id + '_extend' ? '...' : '+1 Mo'}
                        </button>
                        <button
                          onClick={() => cancelSubscription(user.id, user.email)}
                          disabled={actionLoading === user.id + '_cancel'}
                          className="admin-action-btn red"
                        >
                          <X size={13} />
                          {actionLoading === user.id + '_cancel' ? '...' : 'Revoke'}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Revenue summary */}
        <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(139,92,246,0.08)', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.2)' }}>
          <p style={{ color: 'white', fontWeight: '700', marginBottom: '12px' }}>📊 Revenue Summary</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Subscription Price', value: `₹${SUBSCRIPTION_AMOUNT}/month` },
              { label: 'Active Subscribers', value: activeCount },
              { label: 'Monthly Revenue', value: `₹${monthlyRevenue.toLocaleString()}` },
            ].map((s, i) => (
              <div key={i}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginBottom: '4px' }}>{s.label}</p>
                <p style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
