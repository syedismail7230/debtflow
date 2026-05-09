import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { PartyPopper, Home } from 'lucide-react';
import './Celebration.css';

const Celebration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loanName = location.state?.loanName || 'your debt';
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random confetti particles
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: -20 - Math.random() * 50,
      size: Math.random() * 10 + 5,
      color: ['#a3e635', '#8b5cf6', '#f97316', '#38bdf8', '#fbbf24'][Math.floor(Math.random() * 5)],
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <motion.div 
      className="page-content celebration-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="confetti-particle"
          style={{ 
            left: `${p.x}%`, 
            width: p.size, 
            height: p.size, 
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
          initial={{ y: p.y, rotate: 0, opacity: 1 }}
          animate={{ y: '120vh', rotate: 360, opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
        />
      ))}

      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [-10, 10, -10, 0] }}
        transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.2 }}
        className="celebration-icon-wrapper"
      >
        <PartyPopper size={80} color="white" />
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="celebration-title"
      >
        Congratulations!
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="celebration-text"
      >
        You have successfully cleared <strong>{loanName}</strong>.<br/>
        You are one step closer to complete financial freedom.
      </motion.p>
      
      <motion.button 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="back-home-btn"
        onClick={() => navigate('/')}
      >
        <Home size={20} /> Back to Dashboard
      </motion.button>
    </motion.div>
  );
};

export default Celebration;
