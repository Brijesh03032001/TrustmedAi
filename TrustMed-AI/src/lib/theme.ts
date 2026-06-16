'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb', light: '#60a5fa', dark: '#1d4ed8', contrastText: '#ffffff' },
    secondary: { main: '#7c3aed', light: '#a78bfa', dark: '#5b21b6', contrastText: '#ffffff' },
    error: { main: '#dc2626', light: '#f87171', dark: '#b91c1c' },
    warning: { main: '#d97706', light: '#fbbf24', dark: '#b45309' },
    info: { main: '#0891b2', light: '#38bdf8', dark: '#0e7490' },
    success: { main: '#16a34a', light: '#4ade80', dark: '#15803d' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
    divider: '#e2e8f0',
    grey: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
      400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
      800: '#1e293b', 900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' },
    h2: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.7, fontWeight: 400 },
    body2: { fontSize: '0.9375rem', lineHeight: 1.6, fontWeight: 400 },
    caption: { fontSize: '0.8125rem', lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none', fontSize: '0.9375rem' },
    subtitle1: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
    '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)',
    '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.03)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
    '0 25px 50px -12px rgba(0,0,0,0.12)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { background: '#f8fafc', minHeight: '100vh' },
        '*::-webkit-scrollbar': { width: '6px', height: '6px' },
        '*::-webkit-scrollbar-track': { background: '#f1f5f9', borderRadius: '10px' },
        '*::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: '10px',
          '&:hover': { background: '#94a3b8' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.9375rem',
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-1px)' },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
          '&:hover': { boxShadow: '0 4px 16px rgba(37,99,235,0.3)' },
        },
        outlined: { borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease',
          '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            fontSize: '1rem',
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#94a3b8' },
            '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '2px' },
          },
          '& .MuiInputBase-input': {
            color: '#0f172a',
            fontSize: '1rem',
            '&::placeholder': { color: '#94a3b8' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '8px', fontWeight: 600, fontSize: '0.8125rem' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          color: '#0f172a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { background: '#ffffff', borderRight: '1px solid #e2e8f0' },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#e2e8f0' } },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: { fontSize: '0.9375rem' },
        secondary: { fontSize: '0.8125rem' },
      },
    },
  },
});
