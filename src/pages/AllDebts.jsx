import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, X, Flag, ArrowUp, ArrowDown, Minus as MinusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './AllDebts.css';

const PRIORITY_OPTIONS = [
  { label: 'High', value: 'high', color: '#ef4444', icon: <ArrowUp size={14} /> },
  { label: 'Medium', value: 'medium', color: '#f97316', icon: <MinusIcon size={14} /> },
  { label: 'Low', value: 'low', color: '#a3e635', icon: <ArrowDown size={14} /> },
  { label: 'None', value: null, color: 'rgba(255,255,255,0.2)', icon: <X size={14} /> },
];

const AllDebts = () => {
  const navigate = useNavigate();
  const { currentUser, currencySymbol } = useAuth();
  const [debts, setDebts] = useState([]);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [totalLent, setTotalLent] = useState(0);
  const [prioritySheet, setPrioritySheet] = useState(null); // holds the debt being prioritized

  const fetchDebts = async () => {
    if (!currentUser) return;
    const q = query(collection(db, 'loans'), where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    const fetched = [];
    let borrowed = 0;
    let lent = 0;
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.amount > 0) {
        fetched.push({ id: docSnap.id, ...data });
        if (data.type === 'borrowed') borrowed += data.amount;
        if (data.type === 'lent') lent += data.amount;
      }
    });
    // Sort: high → medium → low → none/null/undefined
    const priorityRank = (p) => p === 'high' ? 0 : p === 'medium' ? 1 : p === 'low' ? 2 : 3;
    fetched.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
    setDebts(fetched);
    setTotalBorrowed(borrowed);
    setTotalLent(lent);
  };

  useEffect(() => { fetchDebts(); }, [currentUser]);

  const handleSetPriority = async (debtId, priorityValue) => {
    try {
      await updateDoc(doc(db, 'loans', debtId), { priority: priorityValue });
      setPrioritySheet(null);
      await fetchDebts();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadge = (priority) => {
    const opt = PRIORITY_OPTIONS.find(o => o.value === priority);
    return opt && opt.value ? opt : null;
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
        <button className="icon-btn-dark" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="header-title text-white font-semibold">All Debts</p>
        </div>
        <button className="icon-btn-dark" onClick={() => navigate('/calculator')}>
          <Plus size={24} />
        </button>
      </div>

      <div className="stats-row mb-8">
        <div className="stat-card bg-purple-glass text-center">
          <p className="stat-label text-white opacity-80">Total Borrowed</p>
          <p className="stat-value text-purple-light">{currencySymbol}{totalBorrowed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card bg-green-glass text-center">
          <p className="stat-label text-white opacity-80">Total Lent</p>
          <p className="stat-value text-green-light">{currencySymbol}{totalLent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="all-debts-list">
        {debts.length === 0 ? (
          <p className="text-muted text-center py-4">No debts found. Click the + button to add one.</p>
        ) : (
          debts.map(debt => {
            const badge = getPriorityBadge(debt.priority);
            return (
              <div 
                key={debt.id} 
                className={`all-debt-item ${debt.type === 'borrowed' ? 'card-purple' : 'card-green'}`}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {/* Priority flag button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setPrioritySheet(debt); }}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: badge ? badge.color : 'rgba(255,255,255,0.15)',
                    border: 'none', borderRadius: '8px',
                    padding: '4px 8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    color: 'white', fontSize: '11px', fontWeight: '700'
                  }}
                >
                  <Flag size={12} />
                  {badge ? badge.label : 'Priority'}
                </button>

                <div onClick={() => navigate(`/loan/${debt.id}`)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingRight: '70px' }}>
                  <div>
                    <p className="all-debt-title">{debt.title}</p>
                    <p className="all-debt-sub">{debt.group || 'Personal'}</p>
                  </div>
                  <div className="text-right">
                    <p className="all-debt-amount">{currencySymbol}{debt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="all-debt-sub">{debt.dateOfPayment || 'No due date'}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Priority bottom sheet */}
      <AnimatePresence>
        {prioritySheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
              onClick={() => setPrioritySheet(null)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                maxWidth: '480px', margin: '0 auto',
                background: 'var(--bg-card)', borderRadius: '32px 32px 0 0',
                padding: '12px 24px 48px', zIndex: 50
              }}
            >
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>Set Priority</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{prioritySheet.title}</p>
                </div>
                <button onClick={() => setPrioritySheet(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                  <X size={18} color="white" />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {PRIORITY_OPTIONS.map(opt => {
                  const isActive = prioritySheet.priority === opt.value;
                  return (
                    <button
                      key={opt.value ?? 'none'}
                      onClick={() => handleSetPriority(prioritySheet.id, opt.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '16px', borderRadius: '16px',
                        background: isActive ? `${opt.color}22` : 'var(--bg-main)',
                        border: `2px solid ${isActive ? opt.color : 'transparent'}`,
                        cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        {opt.icon}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{opt.label} Priority</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          {opt.value === 'high' ? 'Clear this first — most urgent' :
                           opt.value === 'medium' ? 'Important but not critical' :
                           opt.value === 'low' ? 'Can wait, less urgent' : 'Remove priority tag'}
                        </p>
                      </div>
                      {isActive && <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: opt.color }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AllDebts;
