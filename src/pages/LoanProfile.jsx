import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreHorizontal, Minus, Plus, Check, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './LoanProfile.css';

const LoanProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');

  // Mock data for the specific loan
  const loanData = {
    title: 'Natalie Smith',
    badge: 'I borrowed',
    amount: '$2,000',
    note: '"For office repairs"',
    dateOfPayment: '26 Aug 2026',
    reminder: 'No',
    group: 'Business',
    interest: 'No',
    history: [
      { id: 1, date: '28 Aug', title: 'I repaid part', amount: '-$4,000', type: 'repay' },
      { id: 2, date: '27 Aug', title: 'I borrowed', amount: '+$1,000', type: 'borrow' }
    ]
  };

  const handleConfirmPayment = () => {
    if (partialAmount) {
      // In a real app, this would update the backend/state
      setShowPartialModal(false);
      setPartialAmount('');
    }
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
      <div className="top-bar mb-6">
        <button className="icon-btn-dark" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="header-title text-white font-semibold">{loanData.title}</p>
        </div>
        <button className="icon-btn-dark">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Merged Main Card */}
      <div className="loan-merged-card mb-8">
        {/* Top Half with Pattern */}
        <div className="loan-profile-top bg-pattern">
          <div className="loan-badge">{loanData.badge}</div>
          <h1 className="loan-huge-amount">{loanData.amount}</h1>
          
          {/* Action Buttons */}
          <div className="loan-actions-row">
            <div className="action-circle-group">
              <button className="action-circle-btn" onClick={() => setShowPartialModal(true)}>
                <Minus size={24} color="white" />
              </button>
              <span>Repay<br/>part</span>
            </div>
            
            <div className="action-circle-group">
              <button className="action-circle-btn">
                <Plus size={24} color="white" />
              </button>
              <span>Borrow<br/>more</span>
            </div>

            <div className="action-circle-group">
              <button className="action-circle-btn bg-purple-solid">
                <Check size={24} color="white" />
              </button>
              <span>Repay<br/>&nbsp;</span>
            </div>
          </div>
        </div>

        {/* Bottom Half Details */}
        <div className="loan-details-list">
          <div className="detail-row">
            <span className="detail-label">Note</span>
            <span className="detail-value text-muted">{loanData.note}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date of payment</span>
            <span className="detail-value">{loanData.dateOfPayment}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reminder</span>
            <span className="detail-value">{loanData.reminder}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Group</span>
            <span className="detail-value font-semibold">{loanData.group}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Interest per month</span>
            <span className="detail-value">{loanData.interest}</span>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="section-header">
        <h3 className="text-white font-semibold">History</h3>
      </div>
      
      <div className="history-list">
        {loanData.history.map(item => (
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
            <span className={`history-amount font-semibold ${item.type === 'repay' ? 'text-red' : 'text-green'}`}>
              {item.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Partial Payment Modal */}
      <AnimatePresence>
        {showPartialModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop"
              onClick={() => setShowPartialModal(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="partial-payment-modal"
            >
              <div className="modal-handle"></div>
              <div className="flex-between w-full mb-2">
                <h3 className="text-white text-xl font-bold">Partial Repayment</h3>
                <button className="icon-btn-transparent" onClick={() => setShowPartialModal(false)}>
                  <X size={20} color="white" />
                </button>
              </div>
              <p className="text-muted text-sm mb-6">Enter the amount you wish to repay towards your {loanData.amount} balance.</p>
              
              <div className="amount-input-wrapper mb-6">
                <span className="currency-symbol">$</span>
                <input 
                  type="number" 
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                  className="payment-amount-input"
                  autoFocus
                />
              </div>
              
              <button 
                className={`confirm-payment-btn ${partialAmount ? 'active' : ''}`}
                onClick={handleConfirmPayment}
                disabled={!partialAmount}
              >
                Confirm Payment
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default LoanProfile;
