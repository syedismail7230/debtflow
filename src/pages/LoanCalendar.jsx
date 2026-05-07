import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar as CalIcon, Home, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoanCalendar.css';

const LoanCalendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(14);

  const upcomingPayments = [
    { id: 1, date: 10, title: 'Car Loan EMI', vendor: 'Chase Auto', amount: '$350', status: 'Upcoming', type: 'car' },
    { id: 2, date: 14, title: 'Home Loan EMI', vendor: 'Wells Fargo', amount: '$1,200', status: 'Due Today', type: 'home' },
    { id: 3, date: 23, title: 'Business Loan', vendor: 'Bank of America', amount: '$850', status: 'Upcoming', type: 'business' },
  ];

  const renderGrid = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      const paymentsOnDay = upcomingPayments.filter(p => p.date === i);
      const isEvent = paymentsOnDay.length > 0;
      
      days.push(
        <span 
          key={i} 
          className={`cal-day ${selectedDate === i ? 'active' : ''} ${isEvent ? 'event' : ''}`}
          onClick={() => setSelectedDate(i)}
        >
          {i}
        </span>
      );
    }
    return days;
  };

  const selectedPayments = upcomingPayments.filter(p => p.date === selectedDate);

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
          <p className="header-title text-white font-semibold">EMI Calendar</p>
        </div>
        <div style={{ width: 48 }}></div>
      </div>

      <div className="full-calendar-card mb-8">
        <div className="cal-month-header">
          <ChevronLeft size={20} className="text-muted cursor-pointer" />
          <h2 className="text-white font-bold text-lg">December 2026</h2>
          <ChevronLeft size={20} className="text-muted cursor-pointer" style={{ transform: 'rotate(180deg)' }} />
        </div>
        
        <div className="cal-week-header">
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>
        
        <div className="cal-grid">
          <span className="cal-day prev-month">29</span>
          <span className="cal-day prev-month">30</span>
          {renderGrid()}
          <span className="cal-day next-month">1</span>
          <span className="cal-day next-month">2</span>
          <span className="cal-day next-month">3</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold text-lg">Schedule for Dec {selectedDate}</h3>
      </div>

      <div className="schedule-list">
        {selectedPayments.length > 0 ? (
          selectedPayments.map(payment => (
            <div key={payment.id} className="schedule-card bg-pattern">
              <div className="flex-row justify-between w-full">
                <div className="flex-row gap-4">
                  <div className="schedule-icon">
                    {payment.type === 'home' ? <Home size={20} color="#8b5cf6" /> : <Briefcase size={20} color="#f97316" />}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-md">{payment.title}</h4>
                    <p className="text-muted text-xs">{payment.vendor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="text-white font-bold text-lg">{payment.amount}</h4>
                  <p className={`text-xs font-semibold ${payment.status === 'Due Today' ? 'text-red' : 'text-green'}`}>{payment.status}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-schedule">
            <CalIcon size={40} className="text-muted mb-4 opacity-50" />
            <p className="text-muted">No payments scheduled for this date.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoanCalendar;
