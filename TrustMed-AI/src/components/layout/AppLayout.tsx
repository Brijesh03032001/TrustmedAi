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
  WarningAmber as WarningIcon,
  Lightbulb as TipIcon,
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      {/* Logo area */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
          borderBottom: '1px solid #e2e8f0',
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
              border: '2.5px solid #bfdbfe',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
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
            bgcolor: isOnline ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}`,
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
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
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
                    borderRadius: '12px',
                    py: 1.5,
                    px: 1.75,
                    bgcolor: isActive ? item.bg : 'transparent',
                    border: `1px solid ${isActive ? item.border : 'transparent'}`,
                    borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                    '&:hover': {
                      bgcolor: item.bg,
                      borderColor: item.border,
                      borderLeftColor: item.color,
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: isActive ? item.color : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? `0 2px 8px ${item.color}40` : 'none',
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: isActive ? '#ffffff' : '#64748b' }} />
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

      <Divider sx={{ mx: 2.5, my: 1.5, borderColor: '#f1f5f9' }} />

      {/* Today's Tip */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TipIcon sx={{ fontSize: 16, color: '#16a34a' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {healthTip.label}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', color: '#166534', lineHeight: 1.6 }}>
            {healthTip.text}
          </Typography>
        </Box>
      </Box>

      {/* Medical Disclaimer */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <WarningIcon sx={{ fontSize: 16, color: '#d97706', mt: 0.1, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#92400e', mb: 0.5 }}>
                Medical Disclaimer
              </Typography>
              <Typography sx={{ color: '#92400e', fontSize: '0.8rem', lineHeight: 1.55 }}>
                For informational purposes only. Not a substitute for professional medical advice. Emergency: Call 911.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 'auto', px: 3, py: 2.5, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
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
