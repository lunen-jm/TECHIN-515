import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Types
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Get saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme-mode');
    return (savedTheme as ThemeMode) || 'light';
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme-mode', mode);
  }, [mode]);
  const toggleTheme = () => {
    setMode((prevMode: ThemeMode) => prevMode === 'light' ? 'dark' : 'light');
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#4CAF50',
        light: '#81C784',
        dark: '#388E3C',
      },
      secondary: {
        main: '#78909C',
        light: '#B0BEC5',
        dark: '#546E7A',
      },
      background: {
        default: mode === 'light' ? '#F8F9FA' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
      },
      text: {
        primary: mode === 'light' ? '#263238' : '#FFFFFF',
        secondary: mode === 'light' ? '#607D8B' : '#AAAAAA',
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
        optimal: '#4CAF50',
        warning: '#FFA726',
        critical: '#EF5350',
        neutral: '#78909C',
        fillLow: '#BBDEFB',
        fillMedium: '#90CAF9',
        fillHigh: '#2196F3',
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
            boxShadow: mode === 'light' 
              ? '0 2px 8px rgba(0, 0, 0, 0.05)' 
              : '0 2px 8px rgba(0, 0, 0, 0.3)',
            border: mode === 'light' 
              ? '1px solid #E0E0E0' 
              : '1px solid #333333',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light' 
              ? '0 2px 8px rgba(0, 0, 0, 0.05)' 
              : '0 2px 8px rgba(0, 0, 0, 0.3)',
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
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
            color: mode === 'light' ? '#263238' : '#FFFFFF',
            boxShadow: mode === 'light' 
              ? '0 2px 4px rgba(0,0,0,0.05)' 
              : '0 2px 4px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
            borderRight: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.05)' 
              : '1px solid rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
  });

  const value = {
    mode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
