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
import './theme/theme-extensions'; // Import theme extensions
import './App.css';
import './CustomStyles.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Green accent color
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#78909C', // Neutral gray-blue
      light: '#B0BEC5',
      dark: '#546E7A',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#263238',
      secondary: '#607D8B',
    },
    success: {
      main: '#66BB6A',
      light: '#A5D6A7',
      dark: '#43A047',
    },
    warning: {
      main: '#FFA726',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#EF5350',
      light: '#E57373',
      dark: '#D32F2F',
    },
    info: {
      main: '#42A5F5',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    // Status colors for data visualization
    statusColors: {
      optimal: '#4CAF50',     // Green for optimal readings
      warning: '#FFA726',     // Orange for warning thresholds
      critical: '#EF5350',    // Red for critical alerts
      neutral: '#78909C',     // Gray for inactive or neutral states
      fillLow: '#BBDEFB',     // Light blue for low fill levels
      fillMedium: '#90CAF9',  // Medium blue for moderate fill
      fillHigh: '#2196F3',    // Bright blue for high fill levels
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
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E0E0E0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
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