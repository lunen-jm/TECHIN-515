import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme, Snackbar, Alert, AlertColor } from '@mui/material';
import FarmDashboard from './components/dashboard/FarmDashboard';
import FarmDetailView from './components/dashboard/FarmDetailView';
import DeviceDetailView from './components/dashboard/DeviceDetailView';
import MainLayout from './components/layout/MainLayout';
import Profile from './components/Profile';
import AdminPage from './components/AdminPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { checkDatabaseSetup } from './firebase';
import { createTestUser } from './firebase/services/authService';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

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

  return (
    <ThemeProvider theme={theme}>
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
            } />
            
            <Route path="/farms" element={
              <ProtectedRoute>
                <MainLayout>
                  <FarmDashboard />
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
            
            <Route path="/devices/:deviceId" element={
              <ProtectedRoute>
                <MainLayout>
                  <DeviceDetailView />
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
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <MainLayout>
                  <AdminPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;