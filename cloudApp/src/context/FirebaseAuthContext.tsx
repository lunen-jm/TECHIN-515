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
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    auth0User: currentUser, // Map Firebase user to auth0User for compatibility
    isAuthenticated: !!currentUser
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {!loading && children}
    </FirebaseAuthContext.Provider>
  );
};
