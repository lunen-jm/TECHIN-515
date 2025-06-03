import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

interface FirebaseAuthContextType {
  currentUser: User | null;
  loading: boolean;
  auth0User: any;
  isAuthenticated: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({ 
  currentUser: null, 
  loading: true,
  auth0User: null,
  isAuthenticated: false
});

export const useAuth = () => useContext(FirebaseAuthContext);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 Firebase Auth: Initializing auth state listener...');
    
    // Set a timeout to force loading to false after 5 seconds
    const timeoutId = setTimeout(() => {
      console.log('⏰ Firebase Auth: Timeout reached, setting loading to false');
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      console.log('🔥 Firebase Auth: State changed', user ? 'User logged in' : 'No user');
      clearTimeout(timeoutId); // Clear timeout if auth state changes
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    auth0User: currentUser, // Map Firebase user to auth0User for compatibility
    isAuthenticated: !!currentUser
  };

  console.log('🔥 Firebase Auth Provider: loading =', loading, 'user =', !!currentUser);

  return (
    <FirebaseAuthContext.Provider value={value}>
      {!loading && children}
    </FirebaseAuthContext.Provider>
  );
};
