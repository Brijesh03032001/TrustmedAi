'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../lib/theme';
import { QueryProvider } from '../components/providers/QueryProvider';
import { AppLayout } from '../components/layout/AppLayout';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryProvider>
            {isLandingPage ? (
              children
            ) : (
              <AppLayout>
                {children}
              </AppLayout>
            )}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
