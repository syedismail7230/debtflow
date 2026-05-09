import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Analytics from './pages/Analytics';
import AllDebts from './pages/AllDebts';
import Profile from './pages/Profile';
import LoanCalendar from './pages/LoanCalendar';
import LoanProfile from './pages/LoanProfile';
import Auth from './pages/Auth';
import Celebration from './pages/Celebration';
import AllTransactions from './pages/AllTransactions';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1.2, 1, 1], rotate: [0, 0, 180, 180, 0], borderRadius: ["20%", "20%", "50%", "50%", "20%"] }}
          transition={{ duration: 2, ease: "easeInOut", times: [0, 0.2, 0.5, 0.8, 1], repeat: Infinity, repeatDelay: 0.5 }}
          style={{ width: 80, height: 80, background: 'var(--color-purple)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="bg-glow"></div>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Auth />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/calculator" element={<PrivateRoute><Calculator /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/debts" element={<PrivateRoute><AllDebts /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><LoanCalendar /></PrivateRoute>} />
          <Route path="/loan/:id" element={<PrivateRoute><LoanProfile /></PrivateRoute>} />
          <Route path="/celebration" element={<PrivateRoute><Celebration /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><AllTransactions /></PrivateRoute>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
