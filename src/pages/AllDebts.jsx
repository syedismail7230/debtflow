import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './AllDebts.css';

const AllDebts = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [debts, setDebts] = useState([]);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [totalLent, setTotalLent] = useState(0);

  useEffect(() => {
    const fetchDebts = async () => {
      if (!currentUser) return;
      const q = query(collection(db, 'loans'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const fetched = [];
      let borrowed = 0;
      let lent = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        fetched.push({ id: doc.id, ...data });
        if (data.type === 'borrowed') borrowed += data.amount;
        if (data.type === 'lent') lent += data.amount;
      });
      setDebts(fetched);
      setTotalBorrowed(borrowed);
      setTotalLent(lent);
    };
    fetchDebts();
  }, [currentUser]);

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
          <p className="header-title text-white font-semibold">All Debts</p>
        </div>
        <button className="icon-btn-dark" onClick={() => navigate('/calculator')}>
          <Plus size={24} />
        </button>
      </div>

      <div className="stats-row mb-8">
        <div className="stat-card bg-purple-glass text-center">
          <p className="stat-label text-white opacity-80">Total Borrowed</p>
          <p className="stat-value text-purple-light">${totalBorrowed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card bg-green-glass text-center">
          <p className="stat-label text-white opacity-80">Total Lent</p>
          <p className="stat-value text-green-light">${totalLent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="all-debts-list">
        {debts.length === 0 ? (
          <p className="text-muted text-center py-4">No debts found. Click the + button to add one.</p>
        ) : (
          debts.map(debt => (
            <div 
              key={debt.id} 
              className={`all-debt-item ${debt.type === 'borrowed' ? 'card-purple' : 'card-green'}`}
              onClick={() => navigate(`/loan/${debt.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <p className="all-debt-title">{debt.title}</p>
                <p className="all-debt-sub">{debt.group || 'Personal'}</p>
              </div>
              <div className="text-right">
                <p className="all-debt-amount">${debt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className="all-debt-sub">{debt.dateOfPayment || 'No due date'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default AllDebts;
