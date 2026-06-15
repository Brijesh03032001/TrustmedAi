'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../../lib/theme';
import { QueryProvider } from './QueryProvider';
import { AppLayout } from '../layout/AppLayout';
import { usePathname } from 'next/navigation';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryProvider>
        {isLandingPage ? children : <AppLayout>{children}</AppLayout>}
      </QueryProvider>
    </ThemeProvider>
  );
}
