import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar as CalendarIcon, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Calculator.css';

const Calculator = () => {
  const navigate = useNavigate();
  const { currentUser, currencySymbol } = useAuth();

  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('borrowed');
  const [date, setDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [group, setGroup] = useState('Personal');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !amount) return alert("Title and Amount are required.");
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'loans'), {
        userId: currentUser.uid,
        title,
        vendor,
        amount: parseFloat(amount),
        originalAmount: parseFloat(amount),
        type,
        dateOfPayment: date,
        reminder,
        group,
        createdAt: serverTimestamp()
      });
      navigate('/debts');
    } catch (err) {
      console.error(err);
      alert("Failed to save loan");
    }
    setIsSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content pb-10"
    >
      <div className="top-bar">
        <button className="icon-btn-dark" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="header-title text-white font-semibold">New Debt</p>
        </div>
        <div style={{ width: 48 }}></div>
      </div>

      <div className="calc-amount-section">
        <span className="currency-symbol text-white">{currencySymbol}</span>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="amount-input"
        />
      </div>

      <div className="toggle-container">
        <div className="toggle-bg">
          <div className={`toggle-slider ${type === 'lent' ? 'right' : ''}`}></div>
          <button className={`toggle-btn ${type === 'borrowed' ? 'active' : ''}`} onClick={() => setType('borrowed')}>
            I borrowed
          </button>
          <button className={`toggle-btn ${type === 'lent' ? 'active' : ''}`} onClick={() => setType('lent')}>
            I lent
          </button>
        </div>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label className="form-label">Loan Title</label>
          <input type="text" className="form-input" placeholder="e.g. Home Renovation" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Vendor / Person Details</label>
          <input type="text" className="form-input" placeholder="e.g. Bank of America" value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Date of Payment</label>
          <div className="date-input-wrapper">
            <CalendarIcon size={20} className="date-icon" />
            <input type="date" className="form-input with-icon" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="form-group row-between">
          <div>
            <label className="form-label mb-1">Set Repay Reminder</label>
            <p className="form-sub-label">Get notified before due date</p>
          </div>
          <div className={`switch ${reminder ? 'active' : ''}`} onClick={() => setReminder(!reminder)}>
            <div className="switch-knob"></div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Group</label>
          <select className="form-input" value={group} onChange={(e) => setGroup(e.target.value)}>
            <option>Personal</option>
            <option>Business</option>
            <option>Family</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <button className="apply-btn bg-purple" onClick={handleSave} disabled={isSaving}>
        <Save size={20} />
        <span>{isSaving ? 'Saving...' : 'Save New Debt'}</span>
      </button>
    </motion.div>
  );
};

export default Calculator;
