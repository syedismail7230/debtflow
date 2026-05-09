import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreHorizontal, Minus, Plus, Check, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './LoanProfile.css';

const LoanProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser, currencySymbol } = useAuth();
  
  const [loan, setLoan] = useState(null);
  const [history, setHistory] = useState([]);
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [borrowMode, setBorrowMode] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLoanData = async () => {
    if (!currentUser || !id) return;
    try {
      const loanDoc = await getDoc(doc(db, 'loans', id));
      if (loanDoc.exists() && loanDoc.data().userId === currentUser.uid) {
        setLoan({ id: loanDoc.id, ...loanDoc.data() });
        
        const q = query(collection(db, 'transactions'), where('loanId', '==', id));
        const qs = await getDocs(q);
        const txs = [];
        qs.forEach(d => txs.push({ id: d.id, ...d.data() }));
        txs.sort((a, b) => {
          const aMs = a.createdAt?.toMillis?.() ?? 0;
          const bMs = b.createdAt?.toMillis?.() ?? 0;
          return bMs - aMs;
        });
        setHistory(txs);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [id, currentUser]);

  const handleConfirmPayment = async () => {
    if (!partialAmount || isProcessing || !loan) return;
    const amt = parseFloat(partialAmount);
    if (!amt || amt <= 0) return alert('Please enter a valid amount greater than 0');
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        loanId: id,
        userId: currentUser.uid,
        amount: amt,
        type: borrowMode ? 'borrow' : 'repay',
        title: borrowMode ? 'Borrowed more' : 'I repaid part',
        date: new Date().toLocaleDateString(),
        createdAt: new Date()
      });

      const newBalance = borrowMode ? loan.amount + amt : loan.amount - amt;
      await updateDoc(doc(db, 'loans', id), {
        amount: Math.max(0, newBalance),
        ...(borrowMode ? { originalAmount: (loan.originalAmount || loan.amount) + amt } : {})
      });

      if (!borrowMode && newBalance <= 0) {
        navigate('/celebration', { state: { loanName: loan.title } });
      } else {
        await fetchLoanData();
        setShowPartialModal(false);
        setPartialAmount('');
        setBorrowMode(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!loan) {
    return <div className="page-content pb-10"><p className="text-white text-center mt-10">Loading...</p></div>;
  }

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
          <p className="header-title text-white font-semibold">{loan.title}</p>
        </div>
        <button className="icon-btn-dark">
          <MoreHorizontal size={24} />
        </button>
      </div>

      <div className="loan-merged-card mb-8">
        <div className="loan-profile-top bg-pattern">
          <div className="loan-badge">{loan.type === 'borrowed' ? 'I borrowed' : 'I lent'}</div>
          <h1 className="loan-huge-amount">{currencySymbol}{loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
          
          <div className="loan-actions-row">
            <div className="action-circle-group">
              <button className="action-circle-btn" onClick={() => setShowPartialModal(true)}>
                <Minus size={24} color="white" />
              </button>
              <span>Repay<br/>part</span>
            </div>
            
            <div className="action-circle-group">
              <button className="action-circle-btn" onClick={() => { setPartialAmount(''); setBorrowMode(true); setShowPartialModal(true); }}>
                <Plus size={24} color="white" />
              </button>
              <span>Borrow<br/>more</span>
            </div>

            <div className="action-circle-group">
              <button className="action-circle-btn bg-purple-solid" onClick={() => setShowPartialModal(true)}>
                <Check size={24} color="white" />
              </button>
              <span>Repay<br/>&nbsp;</span>
            </div>
          </div>
        </div>

        <div className="loan-details-list">
          <div className="detail-row">
            <span className="detail-label">Vendor</span>
            <span className="detail-value text-muted">{loan.vendor || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Borrowed On</span>
            <span className="detail-value">{loan.borrowedDate || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Date to Clear</span>
            <span className="detail-value" style={{ color: loan.lastDateToClear ? 'var(--color-green)' : 'var(--text-muted)' }}>
              {loan.lastDateToClear || 'No deadline set'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reminder</span>
            <span className="detail-value">{loan.reminder ? 'Yes' : 'No'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Group</span>
            <span className="detail-value font-semibold">{loan.group || 'Personal'}</span>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h3 className="text-white font-semibold">History</h3>
      </div>
      
      <div className="history-list">
        {history.length === 0 ? (
          <p className="text-muted text-center py-4">No transactions yet.</p>
        ) : (
          history.map(item => (
            <div key={item.id} className="history-item">
              <div className="flex-row gap-4">
                <div className="history-icon">
                  {item.type === 'repay' ? (
                    <ArrowUpRight size={20} className="text-red" />
                  ) : (
                    <ArrowDownLeft size={20} className="text-green" />
                  )}
                </div>
                <div>
                  <p className="history-date text-muted">{item.date}</p>
                  <p className="history-title text-white font-medium">{item.title}</p>
                </div>
              </div>
              <span className={`history-amount font-semibold ${item.type === 'repay' ? 'text-green' : 'text-red'}`}>
                {item.type === 'repay' ? '-' : '+'}{currencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showPartialModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="modal-backdrop" onClick={() => setShowPartialModal(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="partial-payment-modal"
            >
              <div className="modal-handle"></div>
              <div className="flex-between w-full mb-2">
                <h3 className="text-white text-xl font-bold">{borrowMode ? 'Borrow More' : 'Repayment'}</h3>
                <button className="icon-btn-transparent" onClick={() => setShowPartialModal(false)}>
                  <X size={20} color="white" />
                </button>
              </div>
              <p className="text-muted text-sm mb-6">
                {borrowMode
                  ? `Add to your ${currencySymbol}${loan.amount.toLocaleString()} balance.`
                  : `Enter the amount you wish to repay towards your ${currencySymbol}${loan.amount.toLocaleString()} balance.`}
              </p>
              
              <div className="amount-input-wrapper mb-6">
                <span className="currency-symbol">{currencySymbol}</span>
                <input 
                  type="number" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00" className="payment-amount-input" autoFocus
                />
              </div>
              
              <button 
                className={`confirm-payment-btn ${partialAmount ? 'active' : ''}`}
                onClick={handleConfirmPayment} disabled={!partialAmount || isProcessing}
              >
                {isProcessing ? 'Processing...' : borrowMode ? 'Confirm Borrow' : 'Confirm Payment'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LoanProfile;
