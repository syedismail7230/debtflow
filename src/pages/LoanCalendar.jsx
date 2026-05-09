import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Home, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './LoanCalendar.css';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const LoanCalendar = () => {
  const navigate = useNavigate();
  const { currentUser, currencySymbol } = useAuth();

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [upcomingPayments, setUpcomingPayments] = useState([]);

  // ─── Fetch loans ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    const fetchPayments = async () => {
      if (!currentUser) return;
      const q = query(collection(db, 'loans'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        // Support lastDateToClear OR borrowedDate as fallback date sources
        const dateStr = data.lastDateToClear || data.borrowedDate || data.dateOfPayment;
        if (dateStr) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // 0-indexed
            const day = parseInt(parts[2], 10);
            const isCleared = data.amount <= 0;
            fetched.push({
              id: doc.id,
              year, month, day,
              title: data.title,
              vendor: data.vendor || 'Unknown',
              amount: `${currencySymbol}${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              status: isCleared ? 'Cleared' : 'Upcoming',
              type: data.group ? data.group.toLowerCase() : 'other',
              rawDate: new Date(year, month, day)
            });
          }
        }
      });
      setUpcomingPayments(fetched);
    };
    fetchPayments();
  }, [currentUser, currencySymbol]);

  // ─── Calendar math ────────────────────────────────────────────────────────
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const paymentsInView = upcomingPayments.filter(
    p => p.month === viewMonth && p.year === viewYear
  );

  const hasEvent = (day) => paymentsInView.some(p => p.day === day);

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  // Build grid cells
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < firstDayOfMonth) {
      cells.push({ day: daysInPrevMonth - firstDayOfMonth + 1 + i, type: 'prev' });
    } else if (i < firstDayOfMonth + daysInMonth) {
      cells.push({ day: i - firstDayOfMonth + 1, type: 'current' });
    } else {
      cells.push({ day: i - firstDayOfMonth - daysInMonth + 1, type: 'next' });
    }
  }

  const selectedPayments = selectedDay === null
    ? [...paymentsInView].sort((a, b) => a.day - b.day)
    : paymentsInView.filter(p => p.day === selectedDay);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content pb-10"
    >
      {/* Header */}
      <div className="top-bar mb-6">
        <button className="icon-btn-dark" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="header-title text-white font-semibold">EMI Calendar</p>
        </div>
        <div style={{ width: 48 }} />
      </div>

      {/* Calendar Card */}
      <div className="full-calendar-card mb-8">
        {/* Month navigation */}
        <div className="cal-month-header">
          <button
            onClick={prevMonth}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={18} color="white" />
          </button>
          <h2 className="text-white font-bold text-lg">{MONTHS[viewMonth]} {viewYear}</h2>
          <button
            onClick={nextMonth}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={18} color="white" />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="cal-week-header">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className="cal-grid">
          {cells.map((cell, i) => {
            const isCurrent = cell.type === 'current';
            const isSelected = isCurrent && selectedDay === cell.day;
            const event = isCurrent && hasEvent(cell.day);
            const todayCell = isCurrent && isToday(cell.day);

            return (
              <span
                key={i}
                className={`cal-day
                  ${cell.type !== 'current' ? 'prev-month' : ''}
                  ${isSelected ? 'active' : ''}
                  ${event ? 'event' : ''}
                  ${todayCell && !isSelected ? 'today-ring' : ''}
                `}
                style={{ cursor: isCurrent ? 'pointer' : 'default' }}
                onClick={() => isCurrent && setSelectedDay(selectedDay === cell.day ? null : cell.day)}
              >
                {cell.day}
              </span>
            );
          })}
        </div>
      </div>

      {/* Schedule section */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold text-lg">
          {selectedDay
            ? `Schedule for ${MONTHS[viewMonth].slice(0, 3)} ${selectedDay}`
            : `All Payments — ${MONTHS[viewMonth]}`}
        </h3>
        {selectedDay && paymentsInView.length > 0 && (
          <span
            className="text-purple cursor-pointer text-sm font-semibold"
            onClick={() => setSelectedDay(null)}
          >
            See All
          </span>
        )}
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
                  <p className={`text-xs font-semibold ${
                    payment.status === 'Cleared' ? 'text-purple' :
                    payment.rawDate < today ? 'text-red' : 'text-green'
                  }`}>
                    {payment.status === 'Cleared' ? 'Cleared' :
                     payment.rawDate < today ? 'Overdue' : 'Upcoming'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-schedule">
            <CalIcon size={40} className="text-muted mb-4 opacity-50" />
            <p className="text-muted">
              {selectedDay
                ? 'No payments scheduled for this date.'
                : `No payments in ${MONTHS[viewMonth]}.`}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoanCalendar;
