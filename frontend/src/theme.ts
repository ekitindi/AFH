import { createTheme } from '@mui/material/styles';

const colors = {
  primary: {
    main: '#0ea5e9', // Sky blue
    light: '#38bdf8',
    dark: '#0284c7',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#64748b', // Slate gray
    light: '#94a3b8',
    dark: '#475569',
    contrastText: '#ffffff'
  }
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.primary.dark
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: colors.secondary.dark
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }
      }
    }
  }
});

export default theme;
