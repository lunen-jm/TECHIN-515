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
  };  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#428F2F', // Leaf Green
        light: '#4CB610', // Bright Green
        dark: '#376452', // Forest Green
      },
      secondary: {
        main: '#376452', // Forest Green
        light: '#BCBCBC', // Grey
        dark: '#072B2B', // Dark Green
      },      background: {
        default: mode === 'light' ? '#F2F2F2' : '#072B2B', // Light Gray / Dark Green
        paper: mode === 'light' ? '#FFFFFF' : '#376452', // White / Forest Green
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#FFFFFF', // Black / White
        secondary: mode === 'light' ? '#376452' : '#BCBCBC', // Forest Green / Grey
      },
      success: {
        main: '#50C800', // Neon Green
        light: '#4CB610', // Bright Green
        dark: '#428F2F', // Leaf Green
      },
      warning: {
        main: '#4CB610', // Bright Green (alternative warning)
        light: '#50C800', // Neon Green
        dark: '#428F2F', // Leaf Green
      },
      error: {
        main: '#D42700', // Accent Red
        light: '#FF5722', // Lighter red variant
        dark: '#B71C1C', // Darker red variant
      },
      info: {
        main: '#376452', // Forest Green
        light: '#428F2F', // Leaf Green
        dark: '#072B2B', // Dark Green
      },
      // Enhanced status colors for data visualization following style guide
      statusColors: {
        optimal: '#50C800', // Neon Green
        warning: '#4CB610', // Bright Green
        critical: '#D42700', // Accent Red
        neutral: '#BCBCBC', // Grey
        fillLow: '#EFFFE9', // Soft Green Tint
        fillMedium: '#4CB610', // Bright Green
        fillHigh: '#428F2F', // Leaf Green
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
      },    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.06)' 
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: mode === 'light' 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'light' 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.06)' 
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: mode === 'light' 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            '&:hover': {
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              backgroundColor: mode === 'light' 
                ? 'rgba(66, 143, 47, 0.08)' // Leaf Green with opacity
                : 'rgba(129, 140, 248, 0.12)',
            },
          },
        },
      },MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#072B2B',
            color: mode === 'light' ? '#000000' : '#FFFFFF',
            boxShadow: mode === 'light' 
              ? '0 2px 4px rgba(0,0,0,0.05)' 
              : '0 2px 4px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#072B2B',
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
