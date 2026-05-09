import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, ArrowDownLeft, ArrowUpRight, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const AllTransactions = () => {
  const navigate = useNavigate();
  const { currentUser, currencySymbol } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState({});         // id → title map
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLoan, setFilterLoan] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        // Fetch all loans for loan name lookup
        const lq = query(collection(db, 'loans'), where('userId', '==', currentUser.uid));
        const lqs = await getDocs(lq);
        const loanMap = {};
        lqs.forEach(d => { loanMap[d.id] = d.data().title; });
        setLoans(loanMap);

        // Fetch all transactions
        const tq = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
        const tqs = await getDocs(tq);
        const txs = [];
        tqs.forEach(d => txs.push({ id: d.id, ...d.data() }));

        // Sort newest first
        txs.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
          const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
          return bTime - aTime;
        });

        setTransactions(txs);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetch();
  }, [currentUser]);

  const loanOptions = [
    { value: 'all', label: 'All Loans' },
    ...Object.entries(loans).map(([id, title]) => ({ value: id, label: title }))
  ];

  const filtered = transactions.filter(tx => {
    const matchesLoan = filterLoan === 'all' || tx.loanId === filterLoan;
    const matchesType = filterType === 'all' || tx.type === filterType;
    const loanTitle = loans[tx.loanId] || '';
    const matchesSearch = !searchQuery ||
      loanTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.note || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLoan && matchesType && matchesSearch;
  });

  // Group by date
  const grouped = filtered.reduce((acc, tx) => {
    const date = tx.date ||
      (tx.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) ?? 'Unknown Date');
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});

  const totalPaid = filtered
    .filter(t => t.type === 'repay')
    .reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content"
      style={{ paddingBottom: '120px' }}
    >
      {/* Header */}
      <div className="top-bar mb-6">
        <button className="icon-btn-dark" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="header-title text-white font-semibold">All Transactions</p>
        </div>
        <button
          className="icon-btn-dark"
          onClick={() => setShowFilter(f => !f)}
          style={{ background: showFilter ? 'var(--color-purple)' : undefined }}
        >
          <Filter size={20} color="white" />
        </button>
      </div>

      {/* Summary card */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: '24px',
        padding: '20px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Total Repaid (filtered)</p>
          <p style={{ color: 'white', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-1px' }}>
            {currencySymbol}{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Transactions</p>
          <p style={{ color: 'white', fontSize: '1.6rem', fontWeight: '800' }}>{filtered.length}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'var(--bg-card)', borderRadius: '16px',
        padding: '14px 16px', marginBottom: '16px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <Search size={18} color="#9e9ea5" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by loan or note..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: 'white', fontSize: '14px', flex: 1
          }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <X size={16} color="#9e9ea5" />
          </button>
        )}
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '16px' }}
          >
            <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Loan</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {loanOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterLoan(opt.value)}
                      style={{
                        padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                        background: filterLoan === opt.value ? 'var(--color-purple)' : 'rgba(255,255,255,0.08)',
                        color: 'white', transition: 'background 0.2s'
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Type</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[['all', 'All'], ['repay', 'Repayments'], ['borrow', 'Borrowed']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setFilterType(val)}
                      style={{
                        padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                        background: filterType === val ? 'var(--color-purple)' : 'rgba(255,255,255,0.08)',
                        color: 'white', transition: 'background 0.2s'
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: 'var(--color-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ color: 'white', fontWeight: '600', fontSize: '1rem', marginBottom: '8px' }}>No transactions yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Make a payment on any loan to see it here</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, txList]) => (
          <div key={date} style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>{date}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {txList.map(tx => (
                <div
                  key={tx.id}
                  onClick={() => tx.loanId && navigate(`/loan/${tx.loanId}`)}
                  style={{
                    background: 'var(--bg-card)', borderRadius: '18px',
                    padding: '14px 16px', cursor: tx.loanId ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    border: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                    background: tx.type === 'repay' ? 'rgba(139,92,246,0.15)' : 'rgba(249,115,22,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {tx.type === 'repay'
                      ? <ArrowUpRight size={20} color="#8b5cf6" />
                      : <ArrowDownLeft size={20} color="#f97316" />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {loans[tx.loanId] || 'Unknown Loan'}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {tx.type === 'repay' ? 'Repayment' : 'Borrowed'}
                      {tx.note ? ` · ${tx.note}` : ''}
                    </p>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{
                      fontWeight: '700', fontSize: '1rem',
                      color: tx.type === 'repay' ? '#8b5cf6' : '#f97316'
                    }}>
                      {tx.type === 'repay' ? '-' : '+'}{currencySymbol}{(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default AllTransactions;
