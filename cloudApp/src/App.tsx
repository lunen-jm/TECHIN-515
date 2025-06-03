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
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { Auth0Provider } from '@auth0/auth0-react';
import { checkDatabaseSetup } from './firebase';
import { createTestUser } from './firebase/services/authService';
import './theme/theme-extensions'; // Import theme extensions
import './App.css';
import './CustomStyles.css';

// Auth0 configuration
const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';
const auth0Audience = process.env.REACT_APP_AUTH0_AUDIENCE;

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
  };  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience,
        scope: 'openid profile email'
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <CustomThemeProvider>
        <CssBaseline />
        <AuthProvider>
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
            <Route path="*" element={<Navigate to="/" />} />          </Routes>
        </Router>
      </AuthProvider>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </CustomThemeProvider>
    </Auth0Provider>
  );
}

export default App;