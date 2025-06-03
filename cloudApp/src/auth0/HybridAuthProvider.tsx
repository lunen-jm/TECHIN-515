import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface HybridAuthContextType {
  // Current authentication method
  authMethod: 'auth0' | 'firebase' | null;
  
  // User data
  user: any; // Auth0 user or Firebase user
  firebaseUser: FirebaseUser | null;
  auth0User: any;
  
  // Loading states
  isLoading: boolean;
  
  // Authentication state
  isAuthenticated: boolean;
  
  // User metadata
  userRole: 'admin' | 'user' | null;
  farmMemberships: string[];
  
  // Methods
  switchToAuth0: () => void;
  switchToFirebase: () => void;
  logout: () => void;
}

const HybridAuthContext = createContext<HybridAuthContextType | undefined>(undefined);

export const useHybridAuth = () => {
  const context = useContext(HybridAuthContext);
  if (!context) {
    throw new Error('useHybridAuth must be used within HybridAuthProvider');
  }
  return context;
};

interface HybridAuthProviderProps {
  children: React.ReactNode;
}

export const HybridAuthProvider: React.FC<HybridAuthProviderProps> = ({ children }) => {
  const { 
    user: auth0User, 
    isLoading: auth0Loading, 
    isAuthenticated: auth0IsAuthenticated,
    loginWithRedirect,
    logout: auth0Logout
  } = useAuth0();
  
  const [firebaseUser, firebaseLoading] = useAuthState(auth);
  
  const [authMethod, setAuthMethod] = useState<'auth0' | 'firebase' | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [farmMemberships, setFarmMemberships] = useState<string[]>([]);

  // Determine which authentication method is active
  useEffect(() => {
    if (auth0IsAuthenticated && auth0User) {
      setAuthMethod('auth0');
    } else if (firebaseUser) {
      setAuthMethod('firebase');
    } else {
      setAuthMethod(null);
    }
  }, [auth0IsAuthenticated, auth0User, firebaseUser]);

  // Load user metadata based on authentication method
  useEffect(() => {
    const loadUserMetadata = async () => {
      if (authMethod === 'firebase' && firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.globalAdmin || userData.localAdmin ? 'admin' : 'user');
            // Load farm memberships from Firestore
            // Implementation depends on your data structure
          }
        } catch (error) {
          console.error('Error loading Firebase user metadata:', error);
        }
      } else if (authMethod === 'auth0' && auth0User) {
        // Extract role from Auth0 custom claims
        const isAdmin = auth0User[`https://farmsensors.app/globalAdmin`] || 
                       auth0User[`https://farmsensors.app/localAdmin`];
        setUserRole(isAdmin ? 'admin' : 'user');
        
        // Extract farm memberships from Auth0 custom claims
        const memberships = auth0User[`https://farmsensors.app/farmMemberships`] || [];
        setFarmMemberships(memberships);
      }
    };

    loadUserMetadata();
  }, [authMethod, firebaseUser, auth0User]);

  const switchToAuth0 = () => {
    // Sign out from Firebase first
    if (firebaseUser) {
      auth.signOut();
    }
    // Redirect to Auth0 login
    loginWithRedirect();
  };

  const switchToFirebase = () => {
    // Sign out from Auth0 first
    if (auth0IsAuthenticated) {
      auth0Logout();
    }
    // Redirect to Firebase login
    window.location.href = '/login/firebase';
  };

  const logout = () => {
    if (authMethod === 'auth0') {
      auth0Logout();
    } else if (authMethod === 'firebase') {
      auth.signOut();
    }
    setAuthMethod(null);
    setUserRole(null);
    setFarmMemberships([]);
  };
  const value: HybridAuthContextType = {
    authMethod,
    user: authMethod === 'auth0' ? auth0User : firebaseUser,
    firebaseUser: firebaseUser || null,
    auth0User,
    isLoading: auth0Loading || firebaseLoading,
    isAuthenticated: authMethod !== null,
    userRole,
    farmMemberships,
    switchToAuth0,
    switchToFirebase,
    logout
  };

  return (
    <HybridAuthContext.Provider value={value}>
      {children}
    </HybridAuthContext.Provider>
  );
};
