import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Snackbar, Alert, AlertColor } from '@mui/material';
import FarmDashboard from './components/dashboard/FarmDashboard';
import FarmDetailView from './components/dashboard/FarmDetailView';
import FarmsPage from './pages/FarmsPage';
import FarmCreatePage from './pages/FarmCreatePage';
import FarmManagementPage from './pages/FarmManagementPage';
import FarmSettingsPage from './pages/FarmSettingsPage';
import DevicesPage from './pages/DevicesPage';
import DeviceDetailView from './components/dashboard/DeviceDetailView';
import DeviceLayoutShowcase from './components/DeviceLayoutShowcase';
import DeviceProvisioning from './components/DeviceProvisioning';
import AlertCenter from './components/alerts/AlertCenter';
import MainLayout from './components/layout/MainLayout';
import Profile from './components/Profile';
import AdminPage from './components/AdminPage';
import SiloShowcase from './components/SiloShowcase';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { checkDatabaseSetup } from './firebase';
import { createTestUser } from './firebase/services/authService';
import './theme/theme-extensions'; // Import theme extensions
import './App.css';
import './CustomStyles.css';

function App() {
  const [notification, setNotification] = useState<{ 
    open: boolean; 
    message: string; 
    severity: AlertColor | undefined 
  }>({ open: false, message: '', severity: undefined });

  useEffect(() => {
    // Check and initialize Firebase database on app startup
    const initFirebase = async () => {
      try {
        await checkDatabaseSetup();
        console.log('Firebase database connection established');
        
        // Create a test user automatically only in development mode
        if (process.env.NODE_ENV === 'development') {
          try {
            await createTestUser();
            console.log('Test user created or verified');
          } catch (error) {
            console.error('Error creating test user:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };

    initFirebase();
  }, []);
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  // Conditional Auth Provider based on Auth0 configuration
  const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Always use Firebase authentication (Auth0 disabled for simplicity)
    return (
      <FirebaseAuthProvider>
        {children}
      </FirebaseAuthProvider>
    );
  };

  return (
    <AuthWrapper>
      <CustomThemeProvider>
        <CssBaseline />
        <Router>
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <FarmDashboard />
                </MainLayout>
              </ProtectedRoute>
            } />              <Route path="/farms" element={
              <ProtectedRoute>
                <MainLayout>
                  <FarmsPage />
                </MainLayout>
              </ProtectedRoute>
            } />
              <Route path="/farms/create" element={
              <ProtectedRoute>
                <MainLayout>
                  <FarmCreatePage />
                </MainLayout>
              </ProtectedRoute>
            } />
              <Route path="/farms/:farmId/manage" element={
              <ProtectedRoute>
                <MainLayout>
                  <FarmManagementPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/farms/:farmId/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <FarmSettingsPage />
                </MainLayout>
              </ProtectedRoute>
            } />
              <Route path="/farms/:farmId" element={
              <ProtectedRoute>
                <MainLayout>
                  <FarmDetailView />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/devices" element={
              <ProtectedRoute>
                <MainLayout>
                  <DevicesPage />
                </MainLayout>
              </ProtectedRoute>
            } />
              <Route path="/devices/:deviceId" element={
              <ProtectedRoute>
                <MainLayout>
                  <DeviceDetailView />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/devices/add" element={
              <ProtectedRoute>
                <MainLayout>
                  <DeviceProvisioning />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } />
              <Route path="/silo-showcase" element={
              <ProtectedRoute>
                <MainLayout>
                  <SiloShowcase />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/device-layout-showcase" element={
              <ProtectedRoute>
                <MainLayout>
                  <DeviceLayoutShowcase />
                </MainLayout>
              </ProtectedRoute>
            } />
              <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <MainLayout>
                  <AdminPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/alerts" element={
              <ProtectedRoute>
                <MainLayout>
                  <AlertCenter />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />          </Routes>        </Router>
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </CustomThemeProvider>
    </AuthWrapper>
  );
}

export default App;