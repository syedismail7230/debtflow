import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, ShieldCheck, Zap, BarChart2, Bell, Calendar, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const RAZORPAY_KEY_ID = 'rzp_live_RQuwNOxotGRMaW';
const PLAN_AMOUNT = 100; // ₹100/month

const FEATURES = [
  { icon: <Zap size={18} />,         label: 'Unlimited debt tracking' },
  { icon: <BarChart2 size={18} />,   label: 'Full analytics & insights' },
  { icon: <Bell size={18} />,        label: 'Smart overdue alerts' },
  { icon: <Calendar size={18} />,    label: 'EMI auto-deduction' },
  { icon: <ShieldCheck size={18} />, label: 'Priority support' },
  { icon: <Crown size={18} />,       label: 'Pro Member badge' },
];

const Subscription = ({ isModal = false, onSuccess }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = () => {
    setError('');

    if (!window.Razorpay) {
      setError('Payment gateway not loaded. Please check your internet connection and reload.');
      return;
    }

    setProcessing(true);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: PLAN_AMOUNT * 100,
      currency: 'INR',
      name: 'DebtFlow Pro',
      description: 'Monthly Subscription — ₹100/month',
      image: '',
      prefill: {
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
      },
      theme: { color: '#8b5cf6' },
      modal: {
        escape: true,
        ondismiss: () => {
          setProcessing(false);
        },
      },
      handler: async (response) => {
        try {
          const start = new Date();
          const end = new Date();
          end.setMonth(end.getMonth() + 1);

          await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName || '',
            status: 'active',
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            amount: PLAN_AMOUNT,
            razorpayPaymentId: response.razorpay_payment_id,
            activatedByAdmin: false,
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          setProcessing(false);
          if (onSuccess) onSuccess();
          else navigate('/');
        } catch (err) {
          console.error(err);
          setError('Payment received but activation failed. Contact support@debtflow.app with your payment ID.');
          setProcessing(false);
        }
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        setError(`Payment failed: ${r.error.description || 'Unknown error'}. Please try again.`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setError('Failed to open payment gateway. Please reload and try again.');
      setProcessing(false);
    }
  };

  const content = (
    <div style={{
      background: isModal ? 'var(--bg-card)' : 'var(--bg-main)',
      borderRadius: isModal ? '28px 28px 0 0' : '0',
      padding: '32px 24px 48px',
      maxWidth: '480px',
      margin: '0 auto',
      width: '100%',
    }}>

      {/* Back button */}
      {!isModal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer' }}>
            <ArrowLeft size={20} color="white" />
          </button>
          <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '800' }}>Upgrade to Pro</h1>
        </div>
      )}

      {/* Modal drag handle */}
      {isModal && (
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ width: '48px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 24px' }} />
        </div>
      )}

      {/* Crown hero */}
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: '24px' }}
      >
        <div style={{
          width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(249,115,22,0.4)'
        }}>
          <Crown size={40} color="white" />
        </div>
        <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>
          DebtFlow Pro
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.5 }}>
          {isModal
            ? 'Your 1-month free trial has ended. Subscribe to keep using all features.'
            : 'Unlock the full power of debt management.'}
        </p>
      </motion.div>

      {/* Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))',
          border: '1px solid rgba(139,92,246,0.3)', borderRadius: '24px',
          padding: '24px', marginBottom: '24px', textAlign: 'center'
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '8px' }}>Monthly Plan</p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
          <span style={{ color: 'white', fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-2px' }}>₹100</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>/month</span>
        </div>
        <p style={{ color: 'rgba(163,230,53,0.9)', fontSize: '12px', fontWeight: '600' }}>
          ✨ First month FREE · Cancel anytime
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}
      >
        {FEATURES.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'rgba(139,92,246,0.15)', color: '#8b5cf6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>{f.icon}</div>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{f.label}</span>
            <Check size={14} color="#a3e635" style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        ))}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '14px', padding: '12px 14px', marginBottom: '14px',
              display: 'flex', gap: '10px', alignItems: 'flex-start'
            }}
          >
            <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ color: '#ef4444', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubscribe}
        disabled={processing}
        style={{
          width: '100%', padding: '18px', borderRadius: '20px', border: 'none',
          cursor: processing ? 'not-allowed' : 'pointer',
          background: processing ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #8b5cf6, #a855f7)',
          color: 'white', fontWeight: '800', fontSize: '16px',
          boxShadow: processing ? 'none' : '0 8px 24px rgba(139,92,246,0.4)',
          transition: 'all 0.3s', marginBottom: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}
      >
        {processing ? (
          <>
            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Opening payment...
          </>
        ) : '🔒 Subscribe — ₹100/month'}
      </motion.button>

      <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
        Secured by Razorpay · 256-bit SSL · By subscribing you agree to our{' '}
        <span onClick={() => navigate('/terms')} style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
        {' & '}
        <span onClick={() => navigate('/privacy')} style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (isModal) return content;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      style={{ minHeight: '100vh', background: 'var(--bg-main)', overflowY: 'auto' }}>
      {content}
    </motion.div>
  );
};

export default Subscription;
