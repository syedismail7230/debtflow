import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { ArrowUpRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);

  const greetings = ["Welcome back", "Hello", "Good to see you"];
  const quotes = ["Let's crush your debt today.", "Every payment is a step to freedom.", "Financial peace is within reach."];
  const [greeting] = useState(greetings[Math.floor(Math.random() * greetings.length)]);
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

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
      className="page-content"
    >
      <div className="header-row">
        <div className="flex-row">
          <div className="profile-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <img src={currentUser?.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100"} alt="Profile" />
          </div>
          <div>
            <p className="greeting-text text-muted">{greeting}, {currentUser?.displayName?.split(' ')[0] || 'User'}</p>
            <p className="greeting-name text-white">{quote}</p>
          </div>
        </div>
        <div className="menu-icon" onClick={() => navigate('/calendar')} style={{ cursor: 'pointer' }}>
          <CalendarIcon size={24} color="white" />
        </div>
      </div>

      <div className="cards-container">
        <div className="dash-card card-purple" onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>
          <div className="flex-between">
            <span className="dash-card-title">Current Debt</span>
            <div className="icon-btn">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="dash-card-amount">${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="dash-card-footer">
            <span className="dash-card-badge bg-white-10">{loans.filter(l => l.type === 'borrowed').length} Active</span>
          </div>
        </div>

        <div className="dash-card card-orange" onClick={() => navigate('/calculator')} style={{ cursor: 'pointer' }}>
          <div className="flex-between">
            <span className="dash-card-title">Add New Debt</span>
            <div className="icon-btn">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="orange-card-shape"></div>
        </div>
      </div>

      <div className="flex-between mb-4">
        <h3 className="section-title text-white">Active Debts</h3>
        <span className="see-all text-muted" onClick={() => navigate('/debts')} style={{ cursor: 'pointer' }}>See all</span>
      </div>

      <div className="transactions-list">
        {loans.length === 0 ? (
          <p className="text-muted text-center py-4">No active debts found.</p>
        ) : (
          loans.slice(0, 3).map(loan => (
            <div className="transaction-item" key={loan.id} onClick={() => navigate(`/loan/${loan.id}`)} style={{ cursor: 'pointer' }}>
              <div className="flex-row">
                <div className={`tx-icon-bg ${loan.type === 'borrowed' ? 'bg-orange-light' : 'bg-green-light'}`}>
                  <div className={`tx-icon-dot ${loan.type === 'borrowed' ? 'bg-orange' : 'bg-green'}`}></div>
                </div>
                <div>
                  <p className="tx-name text-white">{loan.title}</p>
                  <p className="tx-date text-muted">{loan.dateOfPayment || 'No due date'}</p>
                </div>
              </div>
              <p className="tx-amount text-white">${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          ))
        )}
      </div>
      <Navigation />
    </motion.div>
  );
};

export default Dashboard;
