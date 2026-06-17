import { createTheme } from '@mui/material/styles';

// We will export a function to generate theme based on mode
export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#b39ddb' : '#673ab7', // Deep purple
        light: mode === 'dark' ? '#d1c4e9' : '#8561c5',
        dark: mode === 'dark' ? '#7e57c2' : '#482880',
        contrastText: mode === 'dark' ? '#000000' : '#ffffff',
      },
      secondary: {
        main: mode === 'dark' ? '#80rel' : '#009688', // Teal
        light: mode === 'dark' ? '#b2dfdb' : '#33ab9f',
        dark: mode === 'dark' ? '#004d40' : '#00695c',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#0f0e13' : '#f5f5f7',
        paper: mode === 'dark' ? '#18171f' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#e2e1e9' : '#1b1b1f',
        secondary: mode === 'dark' ? '#a5a4a9' : '#47464f',
      },
      divider: mode === 'dark' ? '#2d2c35' : '#e1e0e9',
    },
    shape: {
      borderRadius: 16, // Material Design 3 rounded corners
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      button: {
        textTransform: 'none', // Material Design 3 buttons don't have uppercase text forced
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 24, // MD3 Pills shape
            padding: '8px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            boxShadow: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Disable MUI dark mode overlays
          },
          elevation1: {
            boxShadow: mode === 'dark' 
              ? '0px 4px 20px rgba(0, 0, 0, 0.4)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(24, 23, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            color: mode === 'dark' ? '#e2e1e9' : '#1b1b1f',
            borderBottom: `1px solid ${mode === 'dark' ? '#2d2c35' : '#e1e0e9'}`,
            boxShadow: 'none',
          },
        },
      },
    },
  });
};
