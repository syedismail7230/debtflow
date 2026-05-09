import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const DatePickerInput = ({ value, onChange, label, placeholder = 'Select date' }) => {
  const today = new Date();
  const parsed = value ? new Date(value) : null;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState((parsed || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((parsed || today).getMonth());
  const [selected, setSelected] = useState(parsed);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay();

  const handleSelect = (day) => {
    const date = new Date(viewYear, viewMonth, day);
    setSelected(date);
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(iso);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const displayValue = selected
    ? `${String(selected.getDate()).padStart(2,'0')} ${MONTHS[selected.getMonth()].slice(0,3)} ${selected.getFullYear()}`
    : '';

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = (d) => selected &&
    selected.getDate() === d &&
    selected.getMonth() === viewMonth &&
    selected.getFullYear() === viewYear;

  const isToday = (d) =>
    today.getDate() === d &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input field */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px', borderRadius: '16px',
          background: 'var(--bg-main)',
          border: open ? '1.5px solid var(--color-purple)' : '1.5px solid rgba(255,255,255,0.06)',
          cursor: 'pointer', transition: 'border 0.2s'
        }}
      >
        <Calendar size={20} color={open ? '#8b5cf6' : '#9e9ea5'} />
        <span style={{ flex: 1, color: displayValue ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '15px' }}>
          {displayValue || placeholder}
        </span>
        {selected && (
          <button
            onClick={(e) => { e.stopPropagation(); setSelected(null); onChange(''); }}
            style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} color="#9e9ea5" />
          </button>
        )}
      </div>

      {/* Calendar dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: '#1f1f23',
              borderRadius: '20px',
              padding: '16px',
              zIndex: 100,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.07)'
            }}
          >
            {/* Month/Year header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={16} color="white" />
              </button>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} color="white" />
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', color: '#9e9ea5', fontSize: '12px', fontWeight: '600', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {cells.map((day, i) => (
                <div
                  key={i}
                  onClick={() => day && handleSelect(day)}
                  style={{
                    textAlign: 'center', padding: '8px 0', borderRadius: '10px',
                    fontSize: '14px', fontWeight: day ? '500' : '400',
                    cursor: day ? 'pointer' : 'default',
                    color: isSelected(day) ? 'white'
                         : isToday(day) ? 'var(--color-purple)'
                         : day ? 'rgba(255,255,255,0.85)' : 'transparent',
                    background: isSelected(day) ? 'var(--color-purple)' : 'transparent',
                    boxShadow: isToday(day) && !isSelected(day) ? '0 0 0 1.5px var(--color-purple)' : 'none',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { if (day && !isSelected(day)) e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
                  onMouseLeave={e => { if (day && !isSelected(day)) e.currentTarget.style.background = 'transparent'; }}
                >
                  {day || ''}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => { setSelected(null); onChange(''); setOpen(false); }}
                style={{ background: 'none', border: 'none', color: '#9e9ea5', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
              >
                Clear
              </button>
              <button
                onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-purple)', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePickerInput;
