import { useAuth as useFirebaseAuth } from './FirebaseAuthContext';

// Unified auth hook - now using only Firebase authentication
export const useAuth = () => {
  console.log('🔗 Unified Auth Hook: Using Firebase context');
  return useFirebaseAuth();
};
