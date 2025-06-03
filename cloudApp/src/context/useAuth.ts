import { useAuth as useAuth0Context } from './AuthContext';
import { useAuth as useFirebaseAuth } from './FirebaseAuthContext';

// Check if Auth0 is configured
const isAuth0Configured = process.env.REACT_APP_AUTH0_DOMAIN && 
  process.env.REACT_APP_AUTH0_CLIENT_ID && 
  !process.env.REACT_APP_AUTH0_DOMAIN.includes('your-domain') && 
  !process.env.REACT_APP_AUTH0_CLIENT_ID.includes('your-client-id');

// Unified auth hook that automatically selects the correct context
export const useAuth = () => {
  const auth0Context = isAuth0Configured ? useAuth0Context() : { currentUser: null, loading: false, auth0User: null, isAuthenticated: false };
  const firebaseContext = !isAuth0Configured ? useFirebaseAuth() : { currentUser: null, loading: false, auth0User: null, isAuthenticated: false };
  
  console.log('🔗 Unified Auth Hook: Using', isAuth0Configured ? 'Auth0' : 'Firebase', 'context');
  
  return isAuth0Configured ? auth0Context : firebaseContext;
};
