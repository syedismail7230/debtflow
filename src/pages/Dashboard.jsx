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
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);

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
          fetchedLoans.push({ id: doc.id, ...data });
          if (data.type === 'borrowed') total += data.amount;
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
            <span className="card-value">${totalDebt.toLocaleString()}</span>
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
            const titleColor = isPurple ? 'text-white' : 'text-black';

            if (index === 2 || (index === loans.length - 1 && loans.length > 1)) {
              return (
                <motion.div 
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`debt-item-large ${color.bg} overlap-${index}`} 
                  key={loan.id} 
                  onClick={() => navigate(`/loan/${loan.id}`)} 
                  style={{ cursor: 'pointer' }}
                >
                  <div className="debt-large-content">
                    <div className={`debt-icon ${color.iconBg} mb-4`}>
                      <Home size={20} className={color.text} />
                    </div>
                    <h3 className={titleColor} style={{ wordBreak: 'break-word', maxWidth: '120px' }}>
                      {loan.title.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                    </h3>
                    <p className="text-white mt-4">2972 Westheimer Rd.<br/>Santa Ana, Illinois 85486</p>
                    <div className={`debt-large-action ${titleColor}`}>
                      <span>Calculate</span>
                      <div className="arrow-btn-small" style={{ color: 'black' }}><ArrowUpRight size={16} /></div>
                    </div>
                  </div>
                  <div className="debt-large-image">
                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fit=crop&w=400&h=200" alt="House" />
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`debt-item-large ${color.bg} overlap-${index}`} 
                key={loan.id} 
                onClick={() => navigate(`/loan/${loan.id}`)} 
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className={`debt-icon ${color.iconBg}`}>
                    {color.icon}
                  </div>
                  <span className={`debt-title ${titleColor}`}>{loan.title}</span>
                </div>
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
