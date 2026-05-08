import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowUpRight, Menu, Home, Briefcase, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [totalDebt, setTotalDebt] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);

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

      // Set recent transactions
      if (txs.length === 0) {
        setRecentTransactions([
          { id: 1, title: 'Home Loan', sub: '5 Emi Paid', amount: 500, type: 'repay', icon: <Home size={24} color="#3b0764" /> },
          { id: 2, title: 'Business Loan', sub: 'Down Payment', amount: 4000, type: 'repay', icon: <Briefcase size={24} color="#3b0764" /> },
          { id: 3, title: 'Topup Balance', sub: 'Via Internet Banking', amount: 2000, type: 'borrow', icon: <Download size={24} color="#3b0764" /> }
        ]);
      } else {
        setRecentTransactions(txs.slice(0, 5).map(tx => ({
          ...tx,
          icon: tx.type === 'repay' ? <Home size={24} color="#3b0764" /> : <Download size={24} color="#3b0764" />,
          sub: tx.date
        })));
      }
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
          <p className="analytics-header-sub text-white" style={{ fontSize: '1.2rem' }}>${totalDebt > 0 ? totalDebt.toLocaleString() : '5552.66'}</p>
        </div>
        <button className="icon-btn-dark">
          <Menu size={24} />
        </button>
      </div>

      <h1 className="analytics-title text-white">Analytics</h1>

      <div className="analytics-cards-row">
        <div className="analytics-card bg-purple">
          <div className="flex-between">
            <span className="analytics-card-label text-white">Total Loan<br/>Amount</span>
            <div className="black-arrow-btn">
              <ArrowUpRight size={14} color="white" />
            </div>
          </div>
          <span className="analytics-card-value text-white">${totalDebt > 0 ? totalDebt.toLocaleString() : '37,270'}</span>
        </div>

        <div className="analytics-card bg-green">
          <div className="flex-between">
            <span className="analytics-card-label text-black">Monthly<br/>Payment (EMI)</span>
            <div className="black-arrow-btn">
              <ArrowUpRight size={14} color="white" />
            </div>
          </div>
          <span className="analytics-card-value text-black">$240.98</span>
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

      <div className="transactions-header mt-8">
        <h3>Transactions</h3>
      </div>
      
      <div className="transactions-container">
        {recentTransactions.map(tx => (
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
              {tx.type === 'repay' ? '-' : '+'}${tx.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Analytics;
