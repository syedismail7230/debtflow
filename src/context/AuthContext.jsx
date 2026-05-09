import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState({
    currency: 'USD ($)',
    language: 'English',
    pushNotifications: true,
    emailReminders: true,
    marketingEmails: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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
          setUserSettings(prev => ({ ...prev, ...docSnap.data() }));
        } else {
          setDoc(userRef, userSettings, { merge: true });
        }
      });
    }
    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [currentUser]);

  const currencySymbol = userSettings?.currency?.match(/\(([^)]+)\)/)?.[1] || '$';

  return (
    <AuthContext.Provider value={{ currentUser, userSettings, currencySymbol }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
