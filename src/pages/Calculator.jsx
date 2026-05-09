import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePickerInput from '../components/DatePickerInput';
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
  const [borrowedDate, setBorrowedDate] = useState('');
  const [lastDateToClear, setLastDateToClear] = useState('');
  const [reminder, setReminder] = useState(false);
  const [group, setGroup] = useState('Personal');
  const [emiEnabled, setEmiEnabled] = useState(false);
  const [emiAmount, setEmiAmount] = useState('');
  const [emiFrequency, setEmiFrequency] = useState('monthly');
  const [isSaving, setIsSaving] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const groupRef = useRef(null);
  const GROUP_OPTIONS = ['Personal', 'Business', 'Family', 'Other'];

  useEffect(() => {
    const handleOutside = (e) => {
      if (groupRef.current && !groupRef.current.contains(e.target)) setGroupOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

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
        borrowedDate,
        lastDateToClear,
        reminder,
        group,
        emiEnabled,
        emiAmount: emiEnabled ? parseFloat(emiAmount) : 0,
        emiFrequency: emiEnabled ? emiFrequency : null,
        nextEmiDate: emiEnabled && borrowedDate ? (() => {
          const d = new Date(borrowedDate);
          emiFrequency === 'weekly' ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1);
          return d.toISOString().split('T')[0];
        })() : null,
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
          <label className="form-label">Borrowed Date</label>
          <DatePickerInput
            value={borrowedDate}
            onChange={setBorrowedDate}
            placeholder="When was this borrowed?"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Last Date to Clear</label>
          <DatePickerInput
            value={lastDateToClear}
            onChange={setLastDateToClear}
            placeholder="Deadline to clear this debt"
          />
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

        {/* EMI Auto-deduction */}
        <div className="form-group row-between">
          <div>
            <label className="form-label mb-1">Auto EMI Deduction</label>
            <p className="form-sub-label">Auto-deduct EMI on schedule</p>
          </div>
          <div className={`switch ${emiEnabled ? 'active' : ''}`} onClick={() => setEmiEnabled(!emiEnabled)}>
            <div className="switch-knob"></div>
          </div>
        </div>

        {emiEnabled && (
          <>
            <div className="form-group">
              <label className="form-label">EMI Amount ({currencySymbol})</label>
              <input
                type="number" className="form-input"
                placeholder="e.g. 5000"
                value={emiAmount} onChange={e => setEmiAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">EMI Frequency</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['monthly', 'weekly'].map(freq => (
                  <button key={freq} onClick={() => setEmiFrequency(freq)}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                      fontWeight: '600', fontSize: '14px', textTransform: 'capitalize',
                      background: emiFrequency === freq ? 'var(--color-purple)' : 'var(--bg-main)',
                      color: 'white', transition: 'background 0.2s'
                    }}
                  >{freq}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="form-group" ref={groupRef} style={{ position: 'relative' }}>
          <label className="form-label">Group</label>
          {/* Custom dropdown trigger */}
          <div
            onClick={() => setGroupOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', borderRadius: '16px',
              background: 'var(--bg-main)',
              border: groupOpen ? '1.5px solid var(--color-purple)' : '1.5px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', transition: 'border 0.2s'
            }}
          >
            <span style={{ color: 'white', fontSize: '15px' }}>{group}</span>
            <ChevronDown size={18} color="#9e9ea5" style={{ transform: groupOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          {/* Dropdown options */}
          <AnimatePresence>
            {groupOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: '#1f1f23', borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  overflow: 'hidden', zIndex: 50
                }}
              >
                {GROUP_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    onClick={() => { setGroup(opt); setGroupOpen(false); }}
                    style={{
                      padding: '14px 18px', cursor: 'pointer',
                      color: opt === group ? 'white' : 'rgba(255,255,255,0.7)',
                      background: opt === group ? 'var(--color-purple)' : 'transparent',
                      fontSize: '15px', fontWeight: opt === group ? '600' : '400',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => { if (opt !== group) e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; }}
                    onMouseLeave={e => { if (opt !== group) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {opt}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
