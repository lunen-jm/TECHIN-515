// Custom theme type declarations to extend Material UI theme
import '@mui/material/styles';

// Extend the palette options
declare module '@mui/material/styles' {
  interface Palette {
    statusColors: {
      optimal: string;
      warning: string;
      critical: string;
      neutral: string;
      fillLow: string;
      fillMedium: string;
      fillHigh: string;
    };
  }
  
  interface PaletteOptions {
    statusColors?: {
      optimal?: string;
      warning?: string;
      critical?: string;
      neutral?: string;
      fillLow?: string;
      fillMedium?: string;
      fillHigh?: string;
    };
  }
}

// Adding custom component props
declare module '@mui/material/LinearProgress' {
  interface LinearProgressPropsColorOverrides {
    optimal: true;
    warning: true;
    critical: true;
    neutral: true;
    fillLow: true;
    fillMedium: true;
    fillHigh: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    optimal: true;
    warning: true;
    critical: true;
    neutral: true;
  }
}
