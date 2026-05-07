import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Menu, ArrowUpRight, Home, Briefcase, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, ReferenceLine } from 'recharts';
import './Analytics.css';

const txData = [
  {
    id: 'overview',
    title: 'All Active Liabilities',
    sub: 'Total Debt Overview',
    amount: '',
    icon: <Menu size={20} color="white" />,
    amountColor: '',
    chartData: [
      { name: 'Week 1', amount: 62000 },
      { name: 'Week 1.5', amount: 77000 },
      { name: 'Week 2', amount: 76270 },
      { name: 'Week 2.5', amount: 64000 },
      { name: 'Week 3', amount: 80000 },
      { name: 'Week 3.5', amount: 66000 },
      { name: 'Week 4', amount: 73000 },
    ],
    totalDebt: '$67,270',
    monthly: '$1,090.98'
  },
  {
    id: 'home',
    title: 'Home Loan',
    sub: '5 Emi Paid',
    amount: '-$500',
    icon: <Home size={20} fill="#3b0764" color="#3b0764" />,
    amountColor: 'text-red',
    chartData: [
      { name: 'Week 1', amount: 20000 },
      { name: 'Week 1.5', amount: 35000 },
      { name: 'Week 2', amount: 37270 },
      { name: 'Week 2.5', amount: 25000 },
      { name: 'Week 3', amount: 42000 },
      { name: 'Week 3.5', amount: 28000 },
      { name: 'Week 4', amount: 35000 },
    ],
    totalDebt: '$37,270',
    monthly: '$240.98'
  },
  {
    id: 'business',
    title: 'Business Loan',
    sub: 'Down Payment',
    amount: '-$4000',
    icon: <Briefcase size={20} fill="#3b0764" color="#3b0764" />,
    amountColor: 'text-red',
    chartData: [
      { name: 'Week 1', amount: 40000 },
      { name: 'Week 1.5', amount: 39000 },
      { name: 'Week 2', amount: 35000 },
      { name: 'Week 2.5', amount: 34000 },
      { name: 'Week 3', amount: 32000 },
      { name: 'Week 3.5', amount: 31000 },
      { name: 'Week 4', amount: 30000 },
    ],
    totalDebt: '$30,000',
    monthly: '$850.00'
  },
  {
    id: 'topup',
    title: 'Topup Balance',
    sub: 'Via Internet Banking',
    amount: '+$2000',
    icon: <Download size={20} color="#3b0764" />,
    amountColor: 'text-green',
    chartData: [
      { name: 'Week 1', amount: 2000 },
      { name: 'Week 1.5', amount: 3000 },
      { name: 'Week 2', amount: 4000 },
      { name: 'Week 2.5', amount: 5000 },
      { name: 'Week 3', amount: 6000 },
      { name: 'Week 3.5', amount: 7000 },
      { name: 'Week 4', amount: 8000 },
    ],
    totalDebt: '$0',
    monthly: '$0.00'
  }
];

const Analytics = () => {
  const navigate = useNavigate();
  const [activeTx, setActiveTx] = useState(txData[0]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content pb-10"
    >
      {/* Top Bar */}
      <div className="top-bar">
        <button className="icon-btn-dark" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="analytics-header-title">Current Debt</p>
          <p className="analytics-header-sub">{activeTx.totalDebt}</p>
        </div>
        <button className="icon-btn-dark" onClick={() => setActiveTx(txData[0])}>
          <Menu size={24} />
        </button>
      </div>

      <h1 className="analytics-title">Analytics</h1>

      {/* Cards Row */}
      <div className="analytics-cards-row">
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={`total-${activeTx.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="analytics-card bg-purple"
            onClick={() => navigate(`/loan/${activeTx.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex-between">
              <span className="analytics-card-label">Total Debt<br/>Amount</span>
              <div className="black-arrow-btn">
                <ArrowUpRight size={14} color="white" />
              </div>
            </div>
            <span className="analytics-card-value">{activeTx.totalDebt}</span>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          <motion.div 
            key={`monthly-${activeTx.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="analytics-card bg-green"
            onClick={() => navigate('/debts')}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex-between">
              <span className="analytics-card-label text-black">Monthly<br/>Payment (EMI)</span>
              <div className="black-arrow-btn">
                <ArrowUpRight size={14} color="white" />
              </div>
            </div>
            <span className="analytics-card-value text-black">{activeTx.monthly}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={activeTx.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide={true} />
            
            {/* Custom crosshair approximation */}
            <ReferenceLine x="Week 2" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            <ReferenceLine y={activeTx.chartData[2].amount} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#a78bfa" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorAmount)" 
              activeDot={{ r: 6, fill: "#38bdf8", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="chart-labels">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
        </div>
      </div>

      {/* Transactions */}
      <div className="transactions-header">
        <h3>Transactions</h3>
      </div>

      <div className="transactions-container">
        {txData.map((tx) => (
          <div 
            key={tx.id}
            className="tx-item" 
            onClick={() => setActiveTx(tx)}
            style={{ 
              cursor: 'pointer',
              opacity: activeTx.id === tx.id ? 1 : 0.5,
              transition: 'opacity 0.2s'
            }}
          >
            <div className="flex-row">
              <div className="tx-icon">
                {tx.icon}
              </div>
              <div>
                <p className="tx-title">{tx.title}</p>
                <p className="tx-sub">{tx.sub}</p>
              </div>
            </div>
            <span className={`tx-amount ${tx.amountColor}`}>{tx.amount}</span>
          </div>
        ))}
      </div>

    </motion.div>
  );
};

export default Analytics;
