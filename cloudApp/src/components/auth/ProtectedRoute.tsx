import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { CircularProgress, Box, Alert } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const location = useLocation();

  console.log('🔒 ProtectedRoute: Loading =', loading, 'User =', !!currentUser);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser || !requireAdmin) return;
      
      setCheckingAdmin(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.globalAdmin === true || userData.localAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, requireAdmin]);

  // Show loading spinner while checking authentication
  if (loading || (requireAdmin && checkingAdmin)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if admin required but user is not admin
  if (requireAdmin && isAdmin === false) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          You do not have permission to access this page.
        </Alert>
        <Navigate to="/" replace />
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;