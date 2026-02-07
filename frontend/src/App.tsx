// src/App.tsx

import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AssessmentView from './components/assessment/AssessmentView';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2c5aa0', // Blue color
    },
    secondary: {
      main: '#5a8fb8',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
