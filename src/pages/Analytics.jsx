import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [totalDebt, setTotalDebt] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  const mockChartData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser) return;
      
      const q = query(collection(db, 'loans'), where('userId', '==', currentUser.uid));
      const qs = await getDocs(q);
      let total = 0;
      qs.forEach(d => {
        if (d.data().type === 'borrowed') total += d.data().amount;
      });
      setTotalDebt(total);

      const txQ = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
      const txQs = await getDocs(txQ);
      const txs = [];
      txQs.forEach(d => txs.push({ id: d.id, ...d.data() }));
      txs.sort((a, b) => b.createdAt - a.createdAt);
      setRecentTransactions(txs.slice(0, 5));
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
          <p className="analytics-header-title">Analytics</p>
          <p className="analytics-header-sub">Overview</p>
        </div>
        <div style={{ width: 48 }}></div>
      </div>

      <h1 className="analytics-title text-white">Your debts</h1>

      <div className="analytics-cards-row">
        <AnimatePresence mode="popLayout">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="analytics-card bg-purple"
          >
            <div className="flex-between">
              <span className="analytics-card-label">Total Debt<br/>Amount</span>
            </div>
            <span className="analytics-card-value">${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="analytics-card bg-green"
          >
            <div className="flex-between">
              <span className="analytics-card-label text-black">Active<br/>Loans</span>
            </div>
            <span className="analytics-card-value text-black">Live</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="chart-container">
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9e9ea5', fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1f1f23', border: 'none', borderRadius: '12px', color: 'white' }} />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 6, 6]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="transactions-container mt-6">
        <div className="transactions-header">
          <h3>Recent Global Activity</h3>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="text-muted text-center">No activity recorded yet.</p>
        ) : (
          recentTransactions.map(tx => (
            <div className="tx-item" key={tx.id}>
              <div className="flex-row">
                <div className="tx-icon">
                  <ArrowUpRight size={24} className="text-black" />
                </div>
                <div>
                  <p className="tx-title">{tx.title}</p>
                  <p className="tx-sub">{tx.date}</p>
                </div>
              </div>
              <span className={`tx-amount ${tx.type === 'repay' ? 'text-green' : 'text-red'}`}>
                {tx.type === 'repay' ? '-' : '+'}${tx.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Analytics;
