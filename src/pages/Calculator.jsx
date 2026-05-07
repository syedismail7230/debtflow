import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Menu, Minus, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Calculator.css';

const Calculator = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(1500);
  const [frequency, setFrequency] = useState('6 Months');
  const [activeTab, setActiveTab] = useState('Car Loan');
  const [selectedDate, setSelectedDate] = useState(22);
  const [reminder, setReminder] = useState(false);

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      const isEvent = [1, 4, 10, 14, 23].includes(i);
      days.push(
        <span 
          key={i} 
          className={`${selectedDate === i ? 'active-date' : ''} ${isEvent ? 'has-event' : ''}`}
          onClick={() => setSelectedDate(i)}
          style={{ cursor: 'pointer' }}
        >
          {i}
        </span>
      );
    }
    return days;
  };

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
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="calc-header-title">Plan Debt Payoff</p>
        </div>
        <button className="icon-btn">
          <Menu size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="calc-tabs">
        {['Car Loan', 'Home Loan', 'Personal Loan', 'Business Loan'].map(tab => (
          <div 
            key={tab} 
            className={`calc-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Amount Selector */}
      <div className="amount-container">
        <button className="amount-btn text-green" onClick={() => setAmount(Math.max(0, amount - 100))}>
          <Minus size={24} />
        </button>
        <div className="amount-display">${amount.toLocaleString()}</div>
        <button className="amount-btn text-green" onClick={() => setAmount(amount + 100)}>
          <Plus size={24} />
        </button>
      </div>

      {/* Custom Title Input */}
      <div className="custom-input-container" style={{ marginBottom: '12px' }}>
        <input 
          type="text" 
          className="custom-title-input" 
          placeholder="Or enter custom debt title..."
        />
      </div>
      
      {/* Vendor Details Input */}
      <div className="custom-input-container">
        <input 
          type="text" 
          className="custom-title-input" 
          placeholder="Vendor Details (e.g. Bank Name)..."
        />
      </div>

      {/* Calendar Label */}
      <p className="frequency-label">Select Payoff Date</p>

      {/* Calendar UI */}
      <div className="calendar-card" style={{ marginBottom: '16px' }}>
        <div className="calendar-header">
          <ChevronLeft size={20} className="text-muted" />
          <span className="calendar-month">December 2026</span>
          <ChevronLeft size={20} className="text-muted" style={{ transform: 'rotate(180deg)' }} />
        </div>
        <div className="calendar-grid-header">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
        <div className="calendar-grid">
          <span className="text-muted">29</span><span className="text-muted">30</span>
          {renderCalendarDays()}
          <span className="text-muted">1</span><span className="text-muted">2</span>
        </div>
      </div>
      
      {/* Reminder Toggle */}
      <div 
        onClick={() => setReminder(!reminder)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: 'var(--bg-card)', padding: '16px 20px', borderRadius: '24px',
          marginBottom: '32px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <span style={{ color: 'white', fontWeight: 500, fontSize: '15px' }}>Set Repay Reminder</span>
        <div style={{
          width: '48px', height: '28px', borderRadius: '14px', padding: '4px',
          backgroundColor: reminder ? 'var(--color-green)' : '#2a2a30', transition: 'all 0.3s'
        }}>
          <div style={{
            width: '20px', height: '20px', backgroundColor: reminder ? '#1a1a1a' : 'white',
            borderRadius: '10px', transform: reminder ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.3s'
          }}></div>
        </div>
      </div>

      {/* Actions */}
      <div className="action-buttons">
        <button className="calc-action-btn btn-orange">
          <span>Interest Calculator</span>
          <div className="arrow-btn-small text-orange">
            <ArrowRight size={16} />
          </div>
        </button>

        <button className="calc-action-btn btn-outline-green" onClick={() => navigate('/debts')}>
          Update New Debt
        </button>
      </div>
    </motion.div>
  );
};

export default Calculator;
