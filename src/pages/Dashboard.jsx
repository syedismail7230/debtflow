import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ArrowUpRight, User, Briefcase, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const debtsData = [
  {
    id: 'personal',
    title: 'Personal Loan',
    titleSplit: ['Personal', 'Loan'],
    icon: <User fill="currentColor" size={24} className="text-dark-green" />,
    colorClass: 'card-green',
    iconBgClass: 'icon-bg-green',
    zClass: 'z-1',
    overlapClass: '',
    address: '124 Personal St.\nChicago, Illinois 60601',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?grayscale&fit=crop&w=200&h=100'
  },
  {
    id: 'business',
    title: 'Business Loan',
    titleSplit: ['Business', 'Loan'],
    icon: <Briefcase fill="currentColor" size={24} className="text-dark-yellow" />,
    colorClass: 'card-yellow',
    iconBgClass: 'icon-bg-yellow',
    zClass: 'z-2',
    overlapClass: 'overlap-1',
    address: '456 Business Blvd.\nNew York, NY 10001',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?grayscale&fit=crop&w=200&h=100'
  },
  {
    id: 'home',
    title: 'Home Loan',
    titleSplit: ['Home', 'Loan'],
    icon: <Home fill="currentColor" size={24} className="text-dark-purple" />,
    colorClass: 'card-purple',
    iconBgClass: 'icon-bg-purple',
    zClass: 'z-3',
    overlapClass: 'overlap-2',
    address: '2972 Westheimer Rd.\nSanta Ana, Illinois 85486',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?grayscale&fit=crop&w=200&h=100'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState('home');

  const userName = "Alex";
  const greetings = ["Welcome back", "Hello", "Greetings", "Hey"];
  const motivations = [
    "Every payment gets you closer to freedom.",
    "Small steps lead to big financial wins.",
    "Keep up the great work on your journey!",
    "Empower your financial success today."
  ];
  
  // Use a simple pseudo-random based on current time so it changes, but doesn't cause hydration errors
  const [greeting] = useState(greetings[Math.floor(Math.random() * greetings.length)]);
  const [motivation] = useState(motivations[Math.floor(Math.random() * motivations.length)]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content"
    >
      {/* Top Bar */}
      <div className="top-bar">
        <div className="profile-img" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100" alt="Profile" />
        </div>
        <button className="icon-btn" onClick={() => navigate('/calendar')}>
          <Menu size={24} />
        </button>
      </div>

      {/* Header */}
      <div className="header-text mb-8">
        <h1>{greeting},<br/>{userName}</h1>
        <p>{motivation}</p>
      </div>

      {/* Top Cards Grid */}
      <div className="top-cards-grid mb-8">
        <div className="dash-card card-purple bg-pattern" onClick={() => navigate('/analytics')}>
          <div className="card-top-row">
            <div className="card-icon">
              <span>💰</span>
            </div>
            <div className="arrow-btn">
              <ArrowUpRight size={16} strokeWidth={3} />
            </div>
          </div>
          <div className="card-bottom">
            <span className="card-label">Current<br/>Debt</span>
            <span className="card-value">$37,270</span>
          </div>
        </div>

        <div className="dash-card card-orange bg-pattern" onClick={() => navigate('/calculator')}>
          <div className="card-top-row">
            <div className="card-icon">
              <span>🏦</span>
            </div>
            <div className="arrow-btn">
              <ArrowUpRight size={16} strokeWidth={3} />
            </div>
          </div>
          <div className="card-bottom">
            <span className="card-label">Debt Plan</span>
            <span className="card-value text-lg">Calculate<br/>EMI</span>
          </div>
          <div className="orange-card-shape"></div>
        </div>
      </div>

      {/* Active Debts List */}
      <div className="section-header">
        <h3>Active Debts</h3>
        <span className="see-all" onClick={() => navigate('/debts')}>See All</span>
      </div>

      <div className="debts-list">
        {debtsData.map((debt) => {
          const isActive = activeCard === debt.id;
          
          return (
            <motion.div 
              layout
              key={debt.id}
              onClick={() => setActiveCard(debt.id)}
              className={`${isActive ? 'debt-item-large' : 'debt-item'} ${debt.colorClass} bg-pattern-large ${debt.overlapClass} ${debt.zClass}`}
              style={{ cursor: 'pointer' }}
            >
              <AnimatePresence mode="popLayout">
                {isActive ? (
                  <motion.div
                    key="large"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex justify-between"
                    style={{ width: '100%' }}
                  >
                    <div className="debt-large-content">
                      <div className={`debt-icon ${debt.iconBgClass} mb-4`}>
                        {debt.icon}
                      </div>
                      <h3>{debt.titleSplit[0]}<br/>{debt.titleSplit[1]}</h3>
                      <p style={{ whiteSpace: 'pre-line', marginBottom: '24px' }}>{debt.address}</p>
                      
                      <div className="debt-large-action" style={{ marginTop: '0' }}>
                        <span>Calculate</span>
                        <div className="arrow-btn bg-white text-black">
                          <ArrowUpRight size={16} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="debt-large-image">
                      <img src={debt.image} alt={debt.title} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="small"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-row items-center gap-4 w-full"
                    style={{ display: 'flex', width: '100%', gap: '16px' }}
                  >
                    <div className={`debt-icon ${debt.iconBgClass}`}>
                      {debt.icon}
                    </div>
                    <span className="debt-title">{debt.title}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Dashboard;
