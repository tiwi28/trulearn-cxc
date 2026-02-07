//import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AssessmentView from './components/assessment/AssessmentView';

// Create TruLearn theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#AEE0F9',
      light: '#C7EAFC',
      dark: '#7DC8E8',
      contrastText: '#1a1a1a',
    },
    secondary: {
      main: '#6BB6D6',
      light: '#8FC9E0',
      dark: '#4A9ABF',
      contrastText: '#ffffff',
    },
    success: {
      main: '#51cf66',
      light: '#8ce99a',
      dark: '#2b8a3e',
    },
    error: {
      main: '#ff6b6b',
      light: '#ffa8a8',
      dark: '#c92a2a',
    },
    warning: {
      main: '#ffd43b',
      light: '#ffe066',
      dark: '#e67700',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#6c757d',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AssessmentView />
    </ThemeProvider>
  );
}

export default App;