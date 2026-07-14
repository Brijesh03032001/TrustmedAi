'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat as ChatIcon,
  Search as SearchIcon,
  LocalHospital as HospitalIcon,
  Lightbulb as TipIcon,
  AutoAwesome as SparkIcon,
  Favorite as HeartIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../lib/api';

const drawerWidth = 280;

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: 'AI Chat',
    path: '/chat',
    icon: ChatIcon,
    description: 'Ask medical questions',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    title: 'Quick Search',
    path: '/search',
    icon: SearchIcon,
    description: 'Find conditions fast',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    title: 'Disease Database',
    path: '/diseases',
    icon: HospitalIcon,
    description: 'Browse all conditions',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
];

const healthTip = {
  text: 'Staying hydrated supports kidney function and helps maintain healthy blood pressure.',
  label: "Today's Tip",
};

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: healthData, isError: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.healthCheck(),
    refetchInterval: 30000,
    retry: 1,
  });

  const isOnline = !healthError && healthData?.status === 'healthy';

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f8fbff',
        background:
          'linear-gradient(160deg, rgba(239,246,255,0.98) 0%, rgba(255,255,255,0.96) 42%, rgba(236,254,255,0.78) 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.68), rgba(0,0,0,0.18), rgba(0,0,0,0.42))',
          animation: 'sidebarGridDrift 28s linear infinite',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -120,
          right: -110,
          width: 230,
          height: 230,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.22), transparent 64%)',
          pointerEvents: 'none',
        },
        '@keyframes sidebarGridDrift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(34px, 34px, 0)' },
        },
      }}
    >
      {/* Logo area */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1,
          borderBottom: '1px solid rgba(191,219,254,0.72)',
        }}
        onClick={() => handleNavigation('/')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box
            component="img"
            src="/LOGO_doctor.png"
            alt="TrustMed-AI"
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '2.5px solid rgba(255,255,255,0.82)',
              boxShadow: '0 16px 32px rgba(37,99,235,0.22)',
            }}
          />
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2, fontSize: '1.125rem' }}>
              TrustMed-AI
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 500 }}>
              Medical Intelligence
            </Typography>
          </Box>
        </Box>

        {/* Status badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: '20px',
            bgcolor: isOnline ? 'rgba(240,253,244,0.88)' : 'rgba(254,242,242,0.88)',
            border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}`,
            boxShadow: isOnline ? '0 10px 22px rgba(22,163,74,0.10)' : '0 10px 22px rgba(220,38,38,0.10)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: isOnline ? '#16a34a' : '#dc2626',
              boxShadow: `0 0 6px ${isOnline ? '#16a34a80' : '#dc262680'}`,
            }}
          />
          <Typography sx={{ color: isOnline ? '#15803d' : '#b91c1c', fontWeight: 700, fontSize: '0.8125rem' }}>
            {isOnline ? 'System Online' : 'System Offline'}
          </Typography>
          {isOnline && healthData?.active_sessions !== undefined && (
            <Chip
              label={`${healthData.active_sessions} active`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                bgcolor: '#dcfce7',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1, position: 'relative', zIndex: 1 }}>
        <Typography
          sx={{
            px: 1,
            mb: 1.5,
            display: 'block',
            color: '#94a3b8',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Navigation
        </Typography>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');

            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: '18px',
                    py: 1.5,
                    px: 1.75,
                    bgcolor: isActive ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.34)',
                    border: `1px solid ${isActive ? item.border : 'rgba(226,232,240,0.62)'}`,
                    backdropFilter: 'blur(14px)',
                    boxShadow: isActive ? `0 18px 34px ${item.color}1f` : '0 8px 20px rgba(15,23,42,0.03)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.92)',
                      borderColor: item.border,
                      transform: 'translateX(4px)',
                      boxShadow: `0 18px 34px ${item.color}1f`,
                      '& .navIconBox': {
                        bgcolor: item.color,
                        color: '#ffffff',
                        transform: 'scale(1.06) rotate(-3deg)',
                        boxShadow: `0 12px 26px ${item.color}3d`,
                      },
                    },
                    transition: 'all 0.22s ease',
                    '&::before': isActive
                      ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 10,
                          bottom: 10,
                          width: 4,
                          borderRadius: '0 999px 999px 0',
                          bgcolor: item.color,
                        }
                      : undefined,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Box
                      className="navIconBox"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: isActive ? item.color : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.22s ease',
                        boxShadow: isActive ? `0 12px 26px ${item.color}3d` : 'none',
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: 'inherit' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '1rem',
                          color: isActive ? item.color : '#334155',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.4, mt: 0.25 }}>
                        {item.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 2.5, my: 1.5, borderColor: 'rgba(226,232,240,0.72)', position: 'relative', zIndex: 1 }} />

      {/* Today's Tip */}
      <Box sx={{ px: 2.5, pb: 1.5, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: '18px',
            bgcolor: 'rgba(240,253,244,0.78)',
            border: '1px solid #bbf7d0',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 14px 32px rgba(22,163,74,0.10)',
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 38px rgba(22,163,74,0.14)' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TipIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {healthTip.label}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', color: '#166534', lineHeight: 1.6 }}>
            {healthTip.text}
          </Typography>
        </Box>
      </Box>

      {/* Assistant quality card */}
      <Box sx={{ px: 2.5, pb: 1.5, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: '18px',
            bgcolor: 'rgba(239,246,255,0.78)',
            border: '1px solid #bfdbfe',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 14px 32px rgba(37,99,235,0.10)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(37,99,235,0.24)',
              }}
            >
              <SparkIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 850, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              RAG Assistant
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 0.85 }}>
            {[
              { icon: ShieldIcon, label: 'Source-grounded answers' },
              { icon: HeartIcon, label: 'Voice-enabled patient support' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      bgcolor: '#ffffff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #dbeafe',
                    }}
                  >
                    <Icon sx={{ fontSize: 13 }} />
                  </Box>
                  <Typography sx={{ color: '#334155', fontSize: '0.8rem', fontWeight: 650, lineHeight: 1.25 }}>
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 'auto', px: 3, py: 2.5, borderTop: '1px solid rgba(226,232,240,0.72)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
          <Box
            component="img"
            src="/LOGO_doctor.png"
            alt="Mayo Clinic"
            sx={{ width: 20, height: 20, borderRadius: '50%', opacity: 0.6 }}
          />
          <Typography sx={{ color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 600 }}>
            Powered by Mayo Clinic data
          </Typography>
        </Box>
        <Typography sx={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
          © 2025 TrustMed-AI
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.1)' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, border: 'none', borderRight: '1px solid #e2e8f0' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: '#f8fafc',
        }}
      >
        {/* Mobile top bar */}
        <AppBar position="static" elevation={0} sx={{ display: { xs: 'flex', sm: 'none' }, bgcolor: '#ffffff' }}>
          <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, color: '#334155', width: 40, height: 40 }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/LOGO_doctor.png"
                alt="TrustMed-AI"
                sx={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #bfdbfe' }}
              />
              <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.0625rem' }}>
                TrustMed-AI
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
