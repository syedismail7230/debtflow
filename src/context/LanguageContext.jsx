import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const STRINGS = {
  English: {
    dashboard: 'Dashboard',
    addDebt: 'Add Debt',
    analytics: 'Analytics',
    profile: 'Profile',
    activeDebts: 'Active Debts',
    seeAll: 'See All',
    totalLoan: 'Total Loan',
    pendingDues: 'Pending Dues',
    priorityAlert: '⚡ Priority Alert',
    noDebts: 'No active debts found.',
    history: 'History',
    noTransactions: 'No transactions yet.',
    repay: 'Repay part',
    borrowMore: 'Borrow more',
    saveDebt: 'Save New Debt',
    loanTitle: 'Loan Title',
    vendor: 'Vendor / Person Details',
    borrowedDate: 'Borrowed Date',
    lastDate: 'Last Date to Clear',
    group: 'Group',
    reminder: 'Set Repay Reminder',
    autoEmi: 'Auto EMI Deduction',
    viewDetails: 'View Details',
  },
  Hindi: {
    dashboard: 'डैशबोर्ड',
    addDebt: 'कर्ज जोड़ें',
    analytics: 'विश्लेषण',
    profile: 'प्रोफाइल',
    activeDebts: 'सक्रिय ऋण',
    seeAll: 'सभी देखें',
    totalLoan: 'कुल ऋण',
    pendingDues: 'बकाया',
    priorityAlert: '⚡ प्राथमिकता अलर्ट',
    noDebts: 'कोई सक्रिय ऋण नहीं।',
    history: 'इतिहास',
    noTransactions: 'अभी तक कोई लेनदेन नहीं।',
    repay: 'भाग चुकाएं',
    borrowMore: 'और उधार लें',
    saveDebt: 'नया कर्ज सहेजें',
    loanTitle: 'ऋण शीर्षक',
    vendor: 'विक्रेता / व्यक्ति विवरण',
    borrowedDate: 'उधार लेने की तारीख',
    lastDate: 'अंतिम चुकाने की तारीख',
    group: 'समूह',
    reminder: 'रिपेमेंट रिमाइंडर',
    autoEmi: 'स्वत: EMI कटौती',
    viewDetails: 'विवरण देखें',
  },
  Spanish: {
    dashboard: 'Inicio',
    addDebt: 'Agregar Deuda',
    analytics: 'Análisis',
    profile: 'Perfil',
    activeDebts: 'Deudas Activas',
    seeAll: 'Ver Todo',
    totalLoan: 'Préstamo Total',
    pendingDues: 'Pagos Pendientes',
    priorityAlert: '⚡ Alerta de Prioridad',
    noDebts: 'No se encontraron deudas activas.',
    history: 'Historial',
    noTransactions: 'Sin transacciones aún.',
    repay: 'Pagar parte',
    borrowMore: 'Pedir más',
    saveDebt: 'Guardar Deuda',
    loanTitle: 'Título del Préstamo',
    vendor: 'Vendedor / Persona',
    borrowedDate: 'Fecha de Préstamo',
    lastDate: 'Fecha Límite',
    group: 'Grupo',
    reminder: 'Recordatorio de Pago',
    autoEmi: 'Deducción EMI Automática',
    viewDetails: 'Ver Detalles',
  }
};

const LanguageContext = createContext();
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const { userSettings } = useAuth();
  const lang = userSettings?.language || 'English';
  const t = (key) => STRINGS[lang]?.[key] || STRINGS['English'][key] || key;
  return (
    <LanguageContext.Provider value={{ t, lang }}>
      {children}
    </LanguageContext.Provider>
  );
};
