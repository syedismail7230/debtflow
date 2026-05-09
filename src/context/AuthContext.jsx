import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState({
    currency: 'INR (₹)',
    language: 'English',
    pushNotifications: true,
    emailReminders: true,
    marketingEmails: false
  });
  const [accountCreatedAt, setAccountCreatedAt] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Ensure accountCreatedAt is recorded in Firestore
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists() || !snap.data().accountCreatedAt) {
          const createdAt = new Date().toISOString();
          await setDoc(userRef, {
            displayName: user.displayName || '',
            email: user.email || '',
            accountCreatedAt: createdAt,
          }, { merge: true });
          setAccountCreatedAt(createdAt);
        } else {
          setAccountCreatedAt(snap.data().accountCreatedAt);
        }
      } else {
        setAccountCreatedAt(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserSettings(prev => ({ ...prev, ...data }));
          if (data.accountCreatedAt) setAccountCreatedAt(data.accountCreatedAt);
        }
      });
    }
    return () => { if (unsubscribeSnapshot) unsubscribeSnapshot(); };
  }, [currentUser]);

  const currencySymbol = userSettings?.currency?.match(/\(([^)]+)\)/)?.[1] || '₹';

  // Trial: 30 days free from accountCreatedAt
  const isInFreeTrial = accountCreatedAt
    ? (new Date() - new Date(accountCreatedAt)) < 30 * 24 * 60 * 60 * 1000
    : true;

  return (
    <AuthContext.Provider value={{ currentUser, userSettings, currencySymbol, accountCreatedAt, isInFreeTrial }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
