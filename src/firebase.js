import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDms0-Hx1BBsyKc506BXeyasvmlJiAuqNc",
  authDomain: "debtflow-9c6be.firebaseapp.com",
  projectId: "debtflow-9c6be",
  storageBucket: "debtflow-9c6be.firebasestorage.app",
  messagingSenderId: "192702686374",
  appId: "1:192702686374:web:0be4ae6553dc8acd880067",
  measurementId: "G-Z7MSVMLBRJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
