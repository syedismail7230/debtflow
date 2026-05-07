import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Briefcase, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AllDebts.css';

const allDebtsData = [
  {
    id: 'personal',
    title: 'Personal Loan',
    icon: <User fill="currentColor" size={24} className="text-dark-green" />,
    colorClass: 'card-green',
    iconBgClass: 'icon-bg-green',
    amount: '$12,500',
    remaining: '18 Months'
  },
  {
    id: 'business',
    title: 'Business Loan',
    icon: <Briefcase fill="currentColor" size={24} className="text-dark-yellow" />,
    colorClass: 'card-yellow',
    iconBgClass: 'icon-bg-yellow',
    amount: '$45,000',
    remaining: '36 Months'
  },
  {
    id: 'home',
    title: 'Home Loan',
    icon: <Home fill="currentColor" size={24} className="text-dark-purple" />,
    colorClass: 'card-purple',
    iconBgClass: 'icon-bg-purple',
    amount: '$350,000',
    remaining: '15 Years'
  }
];

const AllDebts = () => {
  const navigate = useNavigate();

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
          <p className="header-title text-white font-semibold">Monitor Debts</p>
          <p className="header-sub text-green text-xs">All Active Liabilities</p>
        </div>
        <button className="icon-btn-dark" onClick={() => navigate('/calculator')}>
          <Plus size={24} />
        </button>
      </div>

      {/* Debts List */}
      <div className="all-debts-list">
        {allDebtsData.map((debt) => (
          <div 
            key={debt.id} 
            className={`all-debt-item ${debt.colorClass} bg-pattern`}
            onClick={() => navigate(`/loan/${debt.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex-row gap-4">
              <div className={`debt-icon ${debt.iconBgClass}`}>
                {debt.icon}
              </div>
              <div>
                <h3 className="all-debt-title">{debt.title}</h3>
                <p className="all-debt-sub">{debt.remaining} Left</p>
              </div>
            </div>
            <div className="text-right">
              <span className="all-debt-amount">{debt.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AllDebts;
