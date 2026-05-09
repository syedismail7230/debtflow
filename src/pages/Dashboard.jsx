import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, Menu, User, Briefcase, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, currencySymbol } = useAuth();
  const [loans, setLoans] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(0);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'loans'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedLoans = [];
        let total = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.amount > 0) {
            fetchedLoans.push({ id: doc.id, ...data });
            if (data.type === 'borrowed') total += data.amount;
          }
        });
        setLoans(fetchedLoans);
        setTotalDebt(total);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLoans();
  }, [currentUser]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  };

  const firstName = currentUser?.displayName?.split(' ')[0] || 'there';

  const motivations = [
    "Every payment brings you closer to freedom. 🚀",
    "Small steps today, debt-free tomorrow. 💪",
    "Your future self thanks you for paying today. 🙌",
    "Crush that debt — one payment at a time! 🔥",
    "Financial freedom is just ahead. Keep going! ⚡",
    "You're stronger than your debt. Prove it today! 💎",
    "Progress over perfection — keep paying! 🌟",
    "One less debt is one more dream within reach. ✨",
    "Stay consistent. Debt doesn't stand a chance! 🏆",
    "The best time to pay is now. You've got this! 💰",
  ];
  const motivation = motivations[new Date().getDate() % motivations.length];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content"
      style={{ paddingBottom: '200px' }}
    >
      <div className="top-bar">
        <div className="profile-img" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <img src={currentUser?.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100"} alt="Profile" />
        </div>
        <div className="icon-btn" onClick={() => navigate('/calendar')} style={{ cursor: 'pointer' }}>
          <Menu size={24} color="white" />
        </div>
      </div>

      <div className="header-text mb-8">
        <h1 style={{ fontSize: '1.9rem' }}>{getGreeting()},<br/>{firstName}! 👋</h1>
        <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--color-green)', fontWeight: '500', lineHeight: 1.4 }}>
          {motivation}
        </p>
      </div>

      <div className="top-cards-grid mb-8">
        <div className="dash-card card-purple" onClick={() => navigate('/analytics')}>
          <div className="card-top-row">
            <div className="card-icon">💰</div>
            <div className="arrow-btn-small" style={{ color: 'black' }}><ArrowUpRight size={16} /></div>
          </div>
          <div className="card-bottom">
            <span className="card-label" style={{ color: 'white' }}>Current Debt</span>
            <span className="card-value">{currencySymbol}{totalDebt.toLocaleString()}</span>
          </div>
        </div>

        <div className="dash-card card-orange" onClick={() => navigate('/calculator')}>
          <div className="card-top-row">
            <div className="card-icon">🏦</div>
            <div className="arrow-btn-small" style={{ color: 'black' }}><ArrowUpRight size={16} /></div>
          </div>
          <div className="card-bottom">
            <span className="card-label" style={{ color: 'white' }}>Quick Add</span>
            <span className="card-value" style={{ fontSize: '1.4rem' }}>Add<br/>Debt</span>
          </div>
          <div className="orange-card-shape"></div>
        </div>
      </div>

      {(() => {
        if (loans.length === 0) return null;
        const today = new Date();
        const scored = loans
          .filter(l => l.amount > 0)
          .map(l => {
            let daysUntilDue = Infinity;
            const dueDateStr = l.lastDateToClear || l.dateOfPayment;
            if (dueDateStr) {
              const due = new Date(dueDateStr);
              daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            }
            const urgencyScore = daysUntilDue === Infinity 
              ? -l.amount  // fallback: highest amount first
              : daysUntilDue <= 0 ? -999999  // overdue = top priority
              : -1 / daysUntilDue * (l.amount / 1000 + 1);
            return { ...l, daysUntilDue, urgencyScore };
          })
          .sort((a, b) => a.urgencyScore - b.urgencyScore);
        
        const priority = scored[0];
        if (!priority) return null;
        
        const isOverdue = priority.daysUntilDue <= 0 && priority.daysUntilDue !== Infinity;
        const isUrgent = priority.daysUntilDue <= 7 && priority.daysUntilDue > 0;
        const badgeColor = isOverdue ? '#ef4444' : isUrgent ? '#f97316' : '#8b5cf6';
        const badgeText = isOverdue 
          ? `Overdue by ${Math.abs(priority.daysUntilDue)} days!` 
          : priority.daysUntilDue === Infinity
          ? 'Highest Balance'
          : `Due in ${priority.daysUntilDue} days`;

        return (
          <div className="mb-8" style={{ cursor: 'pointer' }} onClick={() => navigate(`/loan/${priority.id}`)}>
            <div className="section-header mb-4">
              <h3 className="text-white">⚡ Priority Alert</h3>
            </div>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '28px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {/* colored glow accent top-right */}
              <div style={{ 
                position: 'absolute', top: '-30px', right: '-30px',
                width: '120px', height: '120px',
                background: `radial-gradient(circle, ${badgeColor}30 0%, transparent 70%)`,
                borderRadius: '50%', pointerEvents: 'none'
              }} />

              {/* top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '16px',
                    background: `${badgeColor}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', flexShrink: 0
                  }}>
                    {isOverdue ? '🔴' : isUrgent ? '🟠' : '🟣'}
                  </div>
                  <div>
                    <p style={{ color: 'white', fontSize: '1rem', fontWeight: '700', marginBottom: '2px' }}>{priority.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{priority.group || 'Personal'}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ color: 'white', fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    {currencySymbol}{priority.amount.toLocaleString()}
                  </p>
                  <span style={{
                    display: 'inline-block', marginTop: '5px',
                    background: badgeColor, color: 'white',
                    fontSize: '10px', fontWeight: '700',
                    padding: '3px 9px', borderRadius: '20px'
                  }}>
                    {badgeText}
                  </span>
                </div>
              </div>

              {/* progress bar */}
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  background: `linear-gradient(90deg, ${badgeColor}, ${badgeColor}99)`,
                  width: priority.originalAmount 
                    ? `${Math.min(100, ((priority.originalAmount - priority.amount) / priority.originalAmount) * 100)}%`
                    : '5%',
                  transition: 'width 1s ease'
                }} />
              </div>

              {/* bottom row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {priority.originalAmount 
                    ? `${Math.round(((priority.originalAmount - priority.amount) / priority.originalAmount) * 100)}% cleared`
                    : 'Tap to repay'}
                </p>
                <div style={{
                  background: badgeColor, borderRadius: '12px',
                  padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>Pay Now</span>
                  <span style={{ color: 'white', fontSize: '14px' }}>→</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="section-header">
        <h3 className="text-white">Active Debts</h3>
        <span className="see-all" onClick={() => navigate('/debts')}>See All</span>
      </div>

      <div className="debts-list">
        {loans.length === 0 ? (
          <p className="text-muted text-center py-4">No active debts found.</p>
        ) : (
          loans.slice(0, 3).map((loan, index) => {
            const colorSchemes = [
              { bg: 'card-green',  iconBg: 'icon-bg-green',  textClass: 'text-dark-green'  },
              { bg: 'card-yellow', iconBg: 'icon-bg-yellow', textClass: 'text-dark-yellow' },
              { bg: 'card-purple', iconBg: 'icon-bg-purple', textClass: 'text-dark-purple' },
            ];
            const color = colorSchemes[index % 3];

            // SVG illustrations per group
            const getIllustration = (group, type) => {
              const g = (group || '').toLowerCase();
              const svgProps = { width: 90, height: 90, viewBox: '0 0 64 64', fill: 'none', opacity: 0.22 };
              if (g === 'business') return (
                <svg {...svgProps}><rect x="8" y="20" width="48" height="32" rx="4" fill="white"/><rect x="20" y="12" width="24" height="12" rx="2" fill="white"/><rect x="14" y="30" width="8" height="8" rx="1" fill="rgba(0,0,0,0.3)"/><rect x="28" y="30" width="8" height="8" rx="1" fill="rgba(0,0,0,0.3)"/><rect x="42" y="30" width="8" height="8" rx="1" fill="rgba(0,0,0,0.3)"/></svg>
              );
              if (g === 'family') return (
                <svg {...svgProps}><circle cx="22" cy="20" r="8" fill="white"/><circle cx="42" cy="20" r="8" fill="white"/><path d="M6 50c0-8.8 7.2-16 16-16h20c8.8 0 16 7.2 16 16" stroke="white" strokeWidth="4" strokeLinecap="round"/></svg>
              );
              if (type === 'lent') return (
                <svg {...svgProps}><path d="M32 8v48M8 32h48" stroke="white" strokeWidth="5" strokeLinecap="round"/><circle cx="32" cy="32" r="22" stroke="white" strokeWidth="4"/></svg>
              );
              // default: personal / home
              return (
                <svg {...svgProps}><path d="M8 28L32 8l24 20v28H40V40H24v16H8V28z" fill="white"/><rect x="26" y="40" width="12" height="16" rx="2" fill="rgba(0,0,0,0.2)"/></svg>
              );
            };

            // Icon per group
            const getIcon = (group) => {
              const g = (group || '').toLowerCase();
              if (g === 'business') return <Briefcase size={22} />;
              if (g === 'family') return <User size={22} />;
              return <Home size={22} />;
            };

            const isExpanded = index === expandedIndex;

            if (isExpanded) {
              return (
                <motion.div
                  layout
                  key={loan.id}
                  className={`debt-item-large ${color.bg} overlap-${index}`}
                  onClick={() => setExpandedIndex(index)}
                  style={{ cursor: 'pointer', minHeight: '160px' }}
                >
                  <motion.div layout="position" className="debt-large-content">
                    <div className={`debt-icon ${color.iconBg} mb-4`}>
                      {getIcon(loan.group)}
                    </div>
                    <h3 className="text-white" style={{ fontSize: '1.6rem', letterSpacing: '-0.5px', maxWidth: '160px', wordBreak: 'break-word' }}>
                      {loan.title}
                    </h3>
                    <p className="text-white mt-4" style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.4 }}>
                      {loan.vendor || loan.group || 'Personal'}{'\n'}
                      {currencySymbol}{loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining
                    </p>
                    <div
                      className="debt-large-action text-white"
                      onClick={(e) => { e.stopPropagation(); navigate(`/loan/${loan.id}`); }}
                      style={{ cursor: 'pointer', display: 'inline-flex', marginTop: '20px' }}
                    >
                      <span style={{ fontWeight: '600' }}>View Details</span>
                      <div className="arrow-btn-small" style={{ color: 'black' }}><ArrowUpRight size={16} /></div>
                    </div>
                  </motion.div>

                  {/* SVG illustration instead of image */}
                  <div style={{ position: 'absolute', bottom: index < loans.slice(0,3).length - 1 ? '88px' : '24px', right: '16px', pointerEvents: 'none' }}>
                    {getIllustration(loan.group, loan.type)}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                layout
                key={loan.id}
                className={`debt-item-large ${color.bg} overlap-${index}`}
                onClick={() => setExpandedIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <motion.div layout="position" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className={`debt-icon ${color.iconBg}`}>
                    {getIcon(loan.group)}
                  </div>
                  <div>
                    <span className="debt-title text-white" style={{ fontSize: '1.1rem' }}>{loan.title}</span>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '2px' }}>
                      {currencySymbol}{loan.amount.toLocaleString()} · {loan.group || 'Personal'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
