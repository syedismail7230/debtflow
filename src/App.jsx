import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Analytics from './pages/Analytics';
import AllDebts from './pages/AllDebts';
import Profile from './pages/Profile';
import LoanCalendar from './pages/LoanCalendar';
import LoanProfile from './pages/LoanProfile';
import Auth from './pages/Auth';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fun initial loading simulation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1.2, 1, 1],
            rotate: [0, 0, 180, 180, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"]
          }}
          transition={{ 
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 0.5
          }}
          style={{ width: 80, height: 80, background: 'linear-gradient(135deg, var(--color-purple-light) 0%, var(--color-purple) 100%)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="bg-glow"></div>
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/debts" element={<AllDebts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<LoanCalendar />} />
          <Route path="/loan/:id" element={<LoanProfile />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
