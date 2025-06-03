import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0, Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react';
import { auth, db } from '../firebase/config';
import { signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth0Config } from './config';

interface Auth0FirebaseContextType {
  // Auth0 user data
  auth0User: any;
  auth0Loading: boolean;
  auth0Error: Error | undefined;
  
  // Firebase user data
  firebaseUser: FirebaseUser | null;
  firebaseLoading: boolean;
  
  // Combined authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Methods
  loginWithRedirect: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

const Auth0FirebaseContext = createContext<Auth0FirebaseContextType | undefined>(undefined);

export const useAuth0Firebase = () => {
  const context = useContext(Auth0FirebaseContext);
  if (!context) {
    throw new Error('useAuth0Firebase must be used within Auth0FirebaseProvider');
  }
  return context;
};

interface Auth0FirebaseProviderProps {
  children: React.ReactNode;
}

const Auth0FirebaseProviderInner: React.FC<Auth0FirebaseProviderProps> = ({ children }) => {
  const {
    user: auth0User,
    isLoading: auth0Loading,
    error: auth0Error,
    isAuthenticated: auth0IsAuthenticated,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  // Create Firebase custom token from Auth0 token
  const createFirebaseToken = async (auth0Token: string): Promise<string> => {
    const response = await fetch('/api/create-firebase-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth0Token}`
      },
      body: JSON.stringify({ auth0Token })
    });

    if (!response.ok) {
      throw new Error('Failed to create Firebase token');
    }

    const { firebaseToken } = await response.json();
    return firebaseToken;
  };

  // Sync Auth0 user with Firebase
  const syncUserWithFirebase = async () => {
    if (!auth0User || !auth0IsAuthenticated) {
      setFirebaseUser(null);
      setFirebaseLoading(false);
      return;
    }

    try {
      setFirebaseLoading(true);

      // Get Auth0 access token
      const auth0Token = await getAccessTokenSilently();
      
      // Create Firebase custom token
      const firebaseToken = await createFirebaseToken(auth0Token);
      
      // Sign in to Firebase with custom token
      const firebaseCredential = await signInWithCustomToken(auth, firebaseToken);
      const firebaseUser = firebaseCredential.user;

      // Create or update user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        username: auth0User.name || auth0User.nickname,
        email: auth0User.email,
        auth0Id: auth0User.sub,
        lastLogin: serverTimestamp(),
        // Map Auth0 custom claims to Firebase user data
        localAdmin: auth0User[`${auth0Config.domain}/localAdmin`] || false,
        globalAdmin: auth0User[`${auth0Config.domain}/globalAdmin`] || false,
        // Preserve existing data if user already exists
        ...(userDoc.exists() ? userDoc.data() : {
          createdAt: serverTimestamp(),
          localAdmin: false,
          globalAdmin: false
        })
      };

      await setDoc(userDocRef, userData, { merge: true });
      setFirebaseUser(firebaseUser);

    } catch (error) {
      console.error('Error syncing user with Firebase:', error);
      setFirebaseUser(null);
    } finally {
      setFirebaseLoading(false);
    }
  };

  // Effect to sync users when Auth0 state changes
  useEffect(() => {
    syncUserWithFirebase();
  }, [auth0User, auth0IsAuthenticated]);

  // Enhanced logout function
  const logout = () => {
    // Sign out from both Auth0 and Firebase
    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
    
    // Firebase sign out will happen automatically when Auth0 user is cleared
  };

  const getAccessToken = async (): Promise<string> => {
    return await getAccessTokenSilently();
  };

  const value: Auth0FirebaseContextType = {
    auth0User,
    auth0Loading,
    auth0Error,
    firebaseUser,
    firebaseLoading,
    isAuthenticated: auth0IsAuthenticated && firebaseUser !== null,
    isLoading: auth0Loading || firebaseLoading,
    loginWithRedirect,
    logout,
    getAccessToken
  };

  return (
    <Auth0FirebaseContext.Provider value={value}>
      {children}
    </Auth0FirebaseContext.Provider>
  );
};

export const Auth0FirebaseProvider: React.FC<Auth0FirebaseProviderProps> = ({ children }) => {
  return (
    <Auth0ProviderBase
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope
      }}
    >
      <Auth0FirebaseProviderInner>
        {children}
      </Auth0FirebaseProviderInner>
    </Auth0ProviderBase>
  );
};
