import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) return setError('Enter your email address first, then click Forgot Password.');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Write to Firestore so admin can list this user
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName: name,
          email: email,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithGoogle();
      // Write to Firestore for admin listing
      if (result?.user) {
        await setDoc(doc(db, 'users', result.user.uid), {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.96, y: 15 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: -15 }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-content auth-page"
    >
      <div className="auth-header text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
          className="auth-logo-wrapper"
        >
          <div className="auth-logo bg-purple">
            <span style={{ fontSize: '24px' }}>💸</span>
          </div>
        </motion.div>
        
        <h1 className="auth-title">DebtFlow</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Welcome back. Let\'s crush your debt.' : 'Create an account to achieve financial freedom.'}
        </p>
      </div>

      <div className="auth-card">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
            type="button"
          >
            Log In
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p style={{ color: 'var(--color-red)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="input-group"
              >
                <div className="input-icon"><User size={20} /></div>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required={!isLogin} className="auth-input" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <div className="input-icon"><Mail size={20} /></div>
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="auth-input" />
          </div>

          <div className="input-group">
            <div className="input-icon"><Lock size={20} /></div>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input" />
          </div>

          {isLogin && (
            <div className="forgot-password">
              {resetSent
                ? <span style={{ color: 'var(--color-green)', fontSize: '13px' }}>✅ Reset email sent! Check your inbox.</span>
                : <span style={{ cursor: 'pointer', color: 'var(--color-purple)' }} onClick={handleForgotPassword}>Forgot password?</span>
              }
            </div>
          )}

          <button type="submit" className="auth-submit-btn bg-purple">
            <span>{isLogin ? 'Log In' : 'Create Account'}</span>
            <ArrowRight size={20} />
          </button>

          <div className="divider">or continue with</div>

          <button type="button" className="google-btn" onClick={handleGoogleAuth}>
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </form>
      </div>
      
      <p className="auth-footer text-muted">
        By continuing, you agree to our{' '}
        <span onClick={() => navigate('/terms')} style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
        {' & '}
        <span onClick={() => navigate('/privacy')} style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.
      </p>
    </motion.div>
  );
};

export default Auth;
