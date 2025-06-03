import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { useAuth0 } from '@auth0/auth0-react';
import { auth } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  auth0User: any;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  currentUser: null, 
  loading: true,
  auth0User: null,
  isAuthenticated: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: auth0User, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  
  // Check if Auth0 is configured
  const isAuth0Configured = process.env.REACT_APP_AUTH0_DOMAIN && 
    process.env.REACT_APP_AUTH0_CLIENT_ID;

  // Create Firebase custom token from Auth0 token (optional)
  const createFirebaseToken = useCallback(async () => {
    if (!isAuthenticated || !auth0User) return;

    try {
      const accessToken = await getAccessTokenSilently();
      // Only try to create Firebase token if functions URL is configured
      if (process.env.REACT_APP_FIREBASE_FUNCTIONS_URL) {
        const response = await fetch(`${process.env.REACT_APP_FIREBASE_FUNCTIONS_URL}/createFirebaseToken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            auth0User: auth0User
          })
        });

        if (response.ok) {
          const { firebaseToken } = await response.json();        
          // Sign in to Firebase with the custom token
          const userCredential = await signInWithCustomToken(auth, firebaseToken);
          setCurrentUser(userCredential.user);
        }
      }
    } catch (error) {
      console.error('Error creating Firebase token:', error);
      // Don't throw error - Auth0 can work without Firebase integration
    }
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  useEffect(() => {
    if (isAuth0Configured && isAuthenticated && auth0User) {
      createFirebaseToken();
    } else if (isAuth0Configured && !isAuthenticated) {
      setCurrentUser(null);
    }
    setLoading(isLoading);
  }, [isAuth0Configured, isAuthenticated, auth0User, isLoading, createFirebaseToken]);

  // Also listen to Firebase auth state changes (for direct Firebase authentication)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      // Only update currentUser from Firebase if Auth0 is not being used
      if (!isAuth0Configured || !isAuthenticated) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [isAuth0Configured, isAuthenticated]);

  const value = {
    currentUser,
    loading,
    auth0User,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};