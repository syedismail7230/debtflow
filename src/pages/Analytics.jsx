import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowUpRight, Menu, Home, Briefcase, Download, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const { currentUser, currencySymbol } = useAuth();
  
  const [totalDebt, setTotalDebt] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('Transactions');
  const [allLoans, setAllLoans] = useState([]);
  const [showPrioritySheet, setShowPrioritySheet] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser) return;
      
      const q = query(collection(db, 'loans'), where('userId', '==', currentUser.uid));
      const qs = await getDocs(q);
      let total = 0;
      const fetchedLoans = [];
      
      qs.forEach(d => {
        const data = d.data();
        fetchedLoans.push({ id: d.id, ...data });
        if (data.type === 'borrowed') {
          total += data.amount;
        }
      });
      setTotalDebt(total);
      setAllLoans(fetchedLoans);

      const txQ = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
      const txQs = await getDocs(txQ);
      const txs = [];
      txQs.forEach(d => txs.push({ id: d.id, ...d.data() }));
      txs.sort((a, b) => b.createdAt - a.createdAt);
      
      // Generate real-time chart data from loans and transactions
      let dynamicChartData = [];
      if (fetchedLoans.length > 0) {
        let runningBal = 0;
        const timeline = [...fetchedLoans].sort((a,b) => a.createdAt - b.createdAt);
        dynamicChartData = timeline.map((item, i) => {
          runningBal += item.amount;
          return { name: item.title.substring(0, 8), amount: runningBal };
        });
        
        // Pad for visual effect if too few data points
        if (dynamicChartData.length < 4) {
          dynamicChartData = [
            { name: 'Start', amount: 0 },
            { name: 'Prev', amount: dynamicChartData[0].amount * 0.5 },
            ...dynamicChartData
          ];
        }
      } else {
        dynamicChartData = [
          { name: 'W1', amount: 0 }, { name: 'W2', amount: 0 }, 
          { name: 'W3', amount: 0 }, { name: 'W4', amount: 0 }
        ];
      }
      setChartData(dynamicChartData);

      // Set transactions — real data only, no mocks
      setRecentTransactions(txs.map(tx => ({
        ...tx,
        icon: tx.type === 'repay'
          ? <Home size={24} color="#3b0764" />
          : <Download size={24} color="#3b0764" />,
        sub: tx.date || (tx.createdAt?.toDate?.()?.toLocaleDateString?.() ?? 'Unknown date')
      })));
    };
    fetchAnalytics();
  }, [currentUser]);

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
          <p className="analytics-header-title">Current Balance</p>
          <p className="analytics-header-sub text-white" style={{ fontSize: '1.2rem' }}>{currencySymbol}{totalDebt > 0 ? totalDebt.toLocaleString() : '5552.66'}</p>
        </div>
        <button className="icon-btn-dark">
          <Menu size={24} />
        </button>
      </div>

      <h1 className="analytics-title text-white">Analytics</h1>

      <div className="analytics-cards-row">
        <div className="analytics-card bg-purple" style={{ cursor: 'pointer' }} onClick={() => navigate('/debts')}>
          <div className="flex-between">
            <span className="analytics-card-label text-white">Total Loan<br/>Amount</span>
            <div className="black-arrow-btn">
              <ArrowUpRight size={14} color="white" />
            </div>
          </div>
          <span className="analytics-card-value text-white">{currencySymbol}{totalDebt > 0 ? totalDebt.toLocaleString() : '37,270'}</span>
        </div>

        <div className="analytics-card bg-green" style={{ cursor: 'pointer' }} onClick={() => setShowPrioritySheet(true)}>
          <div className="flex-between">
            <span className="analytics-card-label text-black">Pending<br/>Dues</span>
            <div className="black-arrow-btn">
              <ArrowUpRight size={14} color="white" />
            </div>
          </div>
          <span className="analytics-card-value text-black">{allLoans.filter(l => l.amount > 0).length} Active</span>
        </div>
      </div>

      <div className="chart-container">
        <div style={{ width: '100%', height: 180, marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f1f23', border: 'none', borderRadius: '12px', color: 'white' }} />
              <Area type="monotone" dataKey="amount" stroke="#a78bfa" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, fill: '#60a5fa', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-labels">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <div className="flex gap-6">
          <h3 
            className={`cursor-pointer ${activeTab === 'Transactions' ? 'text-white' : 'text-muted'} font-semibold`} 
            onClick={() => setActiveTab('Transactions')}
          >
            Transactions
          </h3>
          <h3 
            className={`cursor-pointer ${activeTab === 'Loans' ? 'text-white' : 'text-muted'} font-semibold`} 
            onClick={() => setActiveTab('Loans')}
          >
            Loans
          </h3>
          {activeTab === 'Transactions' && (
            <span
              className="see-all"
              style={{ marginLeft: 'auto', fontSize: '13px', cursor: 'pointer' }}
              onClick={() => navigate('/transactions')}
            >
              See All
            </span>
          )}
        </div>
      </div>
      
      <div className="transactions-container">
        {activeTab === 'Transactions' ? (
          recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>📭</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No payments recorded yet</p>
            </div>
          ) : (
          recentTransactions.slice(0, 5).map(tx => (
            <div className="tx-item" key={tx.id}>
              <div className="flex-row">
                <div className="tx-icon">
                  {tx.icon}
                </div>
                <div>
                  <p className="tx-title">{tx.title}</p>
                  <p className="tx-sub">{tx.sub}</p>
                </div>
              </div>
              <span className={`tx-amount ${tx.type === 'repay' ? 'text-red' : 'text-green'}`}>
                {tx.type === 'repay' ? '-' : '+'}{currencySymbol}{tx.amount.toLocaleString()}
              </span>
            </div>
          ))
          )
        ) : (
          allLoans.map(loan => (
            <div className="tx-item" key={loan.id} onClick={() => navigate(`/loan/${loan.id}`)} style={{ cursor: 'pointer' }}>
              <div className="flex-row">
                <div className="tx-icon">
                  <Briefcase size={24} color="#3b0764" />
                </div>
                <div>
                  <p className="tx-title">{loan.title}</p>
                  <p className="tx-sub">{loan.group || 'Personal'}</p>
                </div>
              </div>
              <span className="tx-amount text-white font-semibold">
                {currencySymbol}{loan.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showPrioritySheet && (() => {
          const today = new Date();
          const prioritized = allLoans
            .filter(l => l.amount > 0)
            .map(l => {
              const dueDate = l.lastDateToClear || l.dateOfPayment;
              let daysLeft = Infinity;
              if (dueDate) {
                daysLeft = Math.ceil((new Date(dueDate) - today) / (1000 * 60 * 60 * 24));
              }
              return { ...l, daysLeft };
            })
            .sort((a, b) => {
              if (a.daysLeft === Infinity && b.daysLeft === Infinity) return b.amount - a.amount;
              if (a.daysLeft === Infinity) return 1;
              if (b.daysLeft === Infinity) return -1;
              return a.daysLeft - b.daysLeft;
            });

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
                onClick={() => setShowPrioritySheet(false)}
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  position: 'fixed', bottom: 0, left: 0, right: 0,
                  maxWidth: '480px', margin: '0 auto',
                  background: 'var(--bg-card)', borderRadius: '32px 32px 0 0',
                  padding: '12px 24px 40px', zIndex: 50, maxHeight: '80vh', overflowY: 'auto'
                }}
              >
                <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>⚡ Pending Dues</h3>
                  <button onClick={() => setShowPrioritySheet(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                    <X size={18} color="white" />
                  </button>
                </div>
                {prioritized.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>🎉 No pending dues!</p>
                ) : (
                  prioritized.map((loan, i) => {
                    const isOverdue = loan.daysLeft <= 0 && loan.daysLeft !== Infinity;
                    const isUrgent = loan.daysLeft <= 7 && loan.daysLeft > 0;
                    const badgeColor = isOverdue ? '#ef4444' : isUrgent ? '#f97316' : '#8b5cf6';
                    const badge = isOverdue ? `Overdue ${Math.abs(loan.daysLeft)}d` : loan.daysLeft === Infinity ? 'No deadline' : `${loan.daysLeft}d left`;
                    return (
                      <div
                        key={loan.id}
                        onClick={() => { setShowPrioritySheet(false); navigate(`/loan/${loan.id}`); }}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '14px 16px', background: 'var(--bg-main)', borderRadius: '16px',
                          marginBottom: '10px', cursor: 'pointer', border: `1px solid ${badgeColor}22`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${badgeColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: badgeColor }}>
                            {i + 1}
                          </div>
                          <div>
                            <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{loan.title}</p>
                            <span style={{ background: badgeColor, color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>{badge}</span>
                          </div>
                        </div>
                        <p style={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>{currencySymbol}{loan.amount.toLocaleString()}</p>
                      </div>
                    );
                  })
                )}
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
};

export default Analytics;
