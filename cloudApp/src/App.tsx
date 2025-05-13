import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme, Snackbar, Alert, AlertColor } from '@mui/material';
import FarmDashboard from './components/dashboard/FarmDashboard';
import FarmDetailView from './components/dashboard/FarmDetailView';
import DeviceDetailView from './components/dashboard/DeviceDetailView';
import MainLayout from './components/layout/MainLayout';
import Profile from './components/Profile';
import AdminPage from './components/AdminPage';
import { checkDatabaseSetup } from './firebase';
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
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<FarmDashboard />} />
            <Route path="/farms" element={<FarmDashboard />} />
            <Route path="/farms/:farmId" element={<FarmDetailView />} />
            <Route path="/devices/:deviceId" element={<DeviceDetailView />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<FarmDashboard />} />
          </Routes>
        </MainLayout>
      </Router>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;