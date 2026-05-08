'use client';

import { createTheme } from '@mui/material/styles';

// Stunning dark theme with impressive neon colors and cyberpunk aesthetics
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff', // Electric cyan
      light: '#66e3ff',
      dark: '#0099cc',
      contrastText: '#0a0a0f',
    },
    secondary: {
      main: '#ff006e', // Hot pink/magenta
      light: '#ff5599',
      dark: '#cc0057',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff073a',
      light: '#ff4569',
      dark: '#cc052e',
    },
    warning: {
      main: '#ffb700',
      light: '#ffcc33',
      dark: '#cc9200',
    },
    info: {
      main: '#7c3aed',
      light: '#a855f7',
      dark: '#6d28d9',
    },
    success: {
      main: '#10d9c4',
      light: '#4fe0d2',
      dark: '#0bb5a3',
    },
    background: {
      default: '#0a0a0f', // Deep dark background
      paper: 'rgba(17, 25, 40, 0.9)', // Semi-transparent dark panels with better visibility
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)', // Brighter secondary text for better visibility
    },
    grey: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#0f0f15',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px -1px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.1)',
    '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)',
    '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -2px rgba(0,0,0,0.05)',
    '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
    '0px 25px 50px -12px rgba(0,0,0,0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            radial-gradient(ellipse at top, #1e3a8a 0%, transparent 70%),
            radial-gradient(ellipse at bottom, #7c2d92 0%, transparent 70%),
            radial-gradient(ellipse at right, #0f172a 0%, transparent 70%),
            linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)
          `,
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(45deg, #00d4ff, #ff006e)',
          borderRadius: '10px',
          '&:hover': {
            background: 'linear-gradient(45deg, #66e3ff, #ff5599)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          padding: '12px 28px',
          fontWeight: 700,
          textTransform: 'none',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 30px rgba(0, 212, 255, 0.4)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 50%, #ff006e 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 3s ease infinite',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #66e3ff 0%, #a855f7 50%, #ff5599 100%)',
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(255, 0, 110, 0.4)',
          },
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          background: 'rgba(17, 25, 40, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '24px',
            padding: '1px',
            background: 'linear-gradient(45deg, #00d4ff, #7c3aed, #ff006e)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.4),
              0 0 40px rgba(0, 212, 255, 0.2),
              0 0 80px rgba(255, 0, 110, 0.1)
            `,
            '&::before': {
              opacity: 1,
            },
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          background: 'rgba(17, 25, 40, 0.9)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: 'rgba(17, 25, 40, 0.8)',
            backdropFilter: 'blur(10px)',
            '& fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#00d4ff',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00d4ff',
              borderWidth: '2px',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)',
            },
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.6)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
        },
        colorPrimary: {
          background: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 100%)',
          color: '#ffffff',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #66e3ff 0%, #a855f7 100%)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid rgba(0, 212, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(10, 10, 15, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0, 212, 255, 0.2)',
        },
      },
    },
  },
});