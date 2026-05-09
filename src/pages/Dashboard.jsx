import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content pb-10"
      style={{ paddingBottom: '100px' }}
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
        <h1>Smart Debt<br/>Solutions</h1>
        <p>Empower your financial success.</p>
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
            <span className="card-label" style={{ color: 'white' }}>Debt Plan</span>
            <span className="card-value" style={{ fontSize: '1.4rem' }}>Calculate<br/>EMI</span>
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
            if (l.dateOfPayment) {
              const due = new Date(l.dateOfPayment);
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
              <h3 className="text-white" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚨 Priority Debt
              </h3>
            </div>
            <div className="priority-card" style={{
              background: `linear-gradient(135deg, ${isOverdue ? 'rgba(239,68,68,0.15)' : isUrgent ? 'rgba(249,115,22,0.15)' : 'rgba(139,92,246,0.15)'} 0%, rgba(255,255,255,0.03) 100%)`,
              border: `1px solid ${badgeColor}33`,
              borderRadius: '24px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
                background: `radial-gradient(circle, ${badgeColor}20 0%, transparent 70%)`,
                borderRadius: '50%', transform: 'translate(30%, -30%)'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Highest Priority</p>
                  <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.5px' }}>{priority.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{priority.group || 'Personal'}</p>
                </div>
                <div style={{ textAlign: 'right', zIndex: 2 }}>
                  <p style={{ color: 'white', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-1px' }}>
                    {currencySymbol}{priority.amount.toLocaleString()}
                  </p>
                  <span style={{
                    display: 'inline-block', marginTop: '6px',
                    background: badgeColor, color: 'white',
                    fontSize: '11px', fontWeight: '700',
                    padding: '4px 10px', borderRadius: '20px',
                    letterSpacing: '0.3px'
                  }}>
                    {badgeText}
                  </span>
                </div>
              </div>
              <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  background: `linear-gradient(to right, ${badgeColor}, ${badgeColor}88)`,
                  width: priority.originalAmount 
                    ? `${Math.min(100, ((priority.originalAmount - priority.amount) / priority.originalAmount) * 100)}%`
                    : '0%',
                  transition: 'width 1s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {priority.originalAmount 
                    ? `${Math.round(((priority.originalAmount - priority.amount) / priority.originalAmount) * 100)}% repaid`
                    : 'Tap to view details'}
                </p>
                <div style={{
                  background: badgeColor,
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '16px', lineHeight: 1 }}>→</span>
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
            const colors = [
              { bg: 'card-green', iconBg: 'icon-bg-green', text: 'text-dark-green', icon: <User size={24} className="text-dark-green" /> },
              { bg: 'card-yellow', iconBg: 'icon-bg-yellow', text: 'text-dark-yellow', icon: <Briefcase size={24} className="text-dark-yellow" /> },
              { bg: 'card-purple', iconBg: 'icon-bg-purple', text: 'text-dark-purple', icon: <Home size={24} className="text-dark-purple" /> }
            ];
            const color = colors[index % 3];

            const isPurple = color.bg === 'card-purple';
            const titleColor = 'text-white'; // The screenshots show white text on all expanded cards!

            // Demo details based on index
            const addresses = [
              "124 Personal St.\nChicago, Illinois 60601",
              "456 Business Blvd.\nNew York, NY 10001",
              "2972 Westheimer Rd.\nSanta Ana, Illinois 85486"
            ];
            const images = [
              "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?fit=crop&w=400&h=200", // Person
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?fit=crop&w=400&h=200", // Business
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fit=crop&w=400&h=200"  // Home
            ];

            if (index === expandedIndex) {
              return (
                <motion.div 
                  layout
                  className={`debt-item-large ${color.bg} overlap-${index}`} 
                  key={loan.id} 
                  onClick={() => setExpandedIndex(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <motion.div layout="position" className="debt-large-content">
                    <div className={`debt-icon ${color.iconBg} mb-4`}>
                      {color.icon}
                    </div>
                    <h3 className={titleColor} style={{ wordBreak: 'break-word', maxWidth: '140px' }}>
                      {loan.title.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                    </h3>
                    <p className="text-white mt-4" style={{ whiteSpace: 'pre-line' }}>{addresses[index % 3]}</p>
                    
                    <div 
                      className={`debt-large-action ${titleColor}`} 
                      onClick={(e) => { e.stopPropagation(); navigate(`/loan/${loan.id}`); }}
                      style={{ cursor: 'pointer', display: 'inline-flex' }}
                    >
                      <span>Calculate</span>
                      <div className="arrow-btn-small" style={{ color: 'black' }}><ArrowUpRight size={16} /></div>
                    </div>
                  </motion.div>
                  
                  <motion.div layout="position" className="debt-large-image" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <img src={images[index % 3]} alt="Thumbnail" />
                  </motion.div>
                </motion.div>
              );
            }

            return (
              <motion.div 
                layout
                className={`debt-item-large ${color.bg} overlap-${index}`} 
                key={loan.id} 
                onClick={() => setExpandedIndex(index)} 
                style={{ cursor: 'pointer' }}
              >
                <motion.div layout="position" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className={`debt-icon ${color.iconBg}`}>
                    {color.icon}
                  </div>
                  <span className={`debt-title ${titleColor}`}>{loan.title}</span>
                </motion.div>
              </motion.div>
            );
          })
        )}
      </div>
      <Navigation />
    </motion.div>
  );
};

export default Dashboard;
