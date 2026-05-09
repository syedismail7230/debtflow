import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Subscription from '../pages/Subscription';

const ADMIN_EMAIL = 'admin@debtflow.app';

/**
 * SubscriptionGate
 * Wraps the app content. If the user's free trial has expired AND they
 * have no active subscription, it overlays the Subscription modal.
 */
const SubscriptionGate = ({ children }) => {
  const { currentUser, isInFreeTrial } = useAuth();
  const [subStatus, setSubStatus] = useState('loading'); // 'loading' | 'active' | 'none'

  useEffect(() => {
    const checkSub = async () => {
      if (!currentUser) { setSubStatus('none'); return; }
      // Admin always bypasses
      if (currentUser.email === ADMIN_EMAIL) { setSubStatus('active'); return; }
      // Within free trial → no paywall
      if (isInFreeTrial) { setSubStatus('active'); return; }

      try {
        const snap = await getDoc(doc(db, 'subscriptions', currentUser.uid));
        if (snap.exists()) {
          const sub = snap.data();
          const isActive = sub.status === 'active' && sub.endDate && new Date(sub.endDate) > new Date();
          setSubStatus(isActive ? 'active' : 'none');
        } else {
          setSubStatus('none');
        }
      } catch (e) {
        console.error(e);
        setSubStatus('none');
      }
    };
    checkSub();
  }, [currentUser, isInFreeTrial]);

  const handleSubscriptionSuccess = () => setSubStatus('active');

  // Still loading → show nothing extra
  if (subStatus === 'loading') return <>{children}</>;

  // Active or admin → pass through
  if (subStatus === 'active') return <>{children}</>;

  // Trial expired, no subscription → overlay paywall
  return (
    <>
      {/* Blurred background content */}
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* Paywall modal */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
          }}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 180 }}
            style={{ width: '100%', maxWidth: '480px' }}
          >
            <Subscription
              isModal={true}
              onSuccess={handleSubscriptionSuccess}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default SubscriptionGate;
