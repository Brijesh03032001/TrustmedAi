'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  Alert,
  Collapse,
  Avatar,
  Paper,
  Fab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat as ChatIcon,
  Search as SearchIcon,
  LocalHospital as HospitalIcon,
  HealthAndSafety as HealthIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
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
  },
  {
    title: 'Quick Search',
    path: '/search',
    icon: SearchIcon,
    description: 'Find conditions fast',
  },
  {
    title: 'Disease Database',
    path: '/diseases',
    icon: HospitalIcon,
    description: 'Browse all conditions',
  },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: healthData, isError: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.healthCheck(),
    refetchInterval: 30000,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: `
        radial-gradient(ellipse at top left, rgba(0, 212, 255, 0.08) 0%, transparent 70%),
        radial-gradient(ellipse at bottom right, rgba(255, 0, 110, 0.06) 0%, transparent 70%),
        linear-gradient(135deg, rgba(10, 10, 15, 0.98) 0%, rgba(17, 25, 40, 0.95) 100%)
      `,
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(0, 212, 255, 0.2)',
    }}>
      {/* Cyberpunk Logo Section */}
      <Box sx={{ 
        p: 4, 
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #00d4ff, #ff006e, transparent)',
          animation: 'logoGlow 3s ease-in-out infinite',
        },
        '@keyframes logoGlow': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            component="img"
            src="/LOGO_doctor.png"
            alt="TrustMed-AI Logo"
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              filter: `
                drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))
                drop-shadow(0 0 30px rgba(0, 212, 255, 0.4))
                brightness(1.2)
                contrast(1.1)
              `,
              border: '2px solid rgba(0, 212, 255, 0.3)',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
              position: 'relative',
              animation: 'logoFloat 4s ease-in-out infinite',
              '@keyframes logoFloat': {
                '0%, 100%': { transform: 'translateY(0px) scale(1)' },
                '25%': { transform: 'translateY(-3px) scale(1.02)' },
                '50%': { transform: 'translateY(0px) scale(1.05)' },
                '75%': { transform: 'translateY(3px) scale(1.02)' },
              },
            }}
          />
          <Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(45deg, #00d4ff 0%, #ffffff 50%, #ff006e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
                fontFamily: '"Inter", "Roboto", sans-serif',
              }}
            >
              TrustMed-AI
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(0, 212, 255, 0.8)',
                fontWeight: 600,
                textShadow: '0 0 15px rgba(0, 212, 255, 0.4)',
                fontSize: '0.85rem',
              }}
            >
              Neural Medical Core
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Neural Core Status Section */}
      <Box sx={{
        p: 3,
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        background: 'rgba(0, 212, 255, 0.02)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent, rgba(0, 212, 255, 0.05), transparent)',
          animation: 'statusPulse 3s ease-in-out infinite',
        },
        '@keyframes statusPulse': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.7 },
        },
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(0, 212, 255, 0.9)',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            mb: 2,
            display: 'block',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
          }}
        >
          Neural Core Status
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Medical Conditions Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '1rem' }}>🧬</Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 500,
                fontSize: '0.8rem',
              }}
            >
              460 medical conditions indexed
            </Typography>
          </Box>
          
          {/* Neural Engine */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '1rem' }}>⚡</Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 500,
                fontSize: '0.8rem',
              }}
            >
              ChromaDB + Advanced Neural Engine
            </Typography>
          </Box>
          
          {/* Active Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: healthError ? '#ff006e' : healthData?.status === 'healthy' ? '#00d4ff' : '#ffa500',
                boxShadow: healthError 
                  ? '0 0 12px #ff006e' 
                  : healthData?.status === 'healthy' 
                    ? '0 0 12px #00d4ff' 
                    : '0 0 12px #ffa500',
                animation: 'statusBlink 2s ease-in-out infinite',
                '@keyframes statusBlink': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: healthError ? '#ff006e' : healthData?.status === 'healthy' ? '#00d4ff' : '#ffa500',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textShadow: healthError 
                  ? '0 0 8px #ff006e' 
                  : healthData?.status === 'healthy' 
                    ? '0 0 8px #00d4ff' 
                    : '0 0 8px #ffa500',
              }}
            >
              {healthError ? 'NEURAL CORE OFFLINE' : healthData?.status === 'healthy' ? 'NEURAL CORE ACTIVE' : 'NEURAL CORE SYNCING'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Modern Navigation */}
      <List sx={{ flex: 1, px: 3, py: 3 }}>
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 2 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '16px',
                  p: 2.5,
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(255, 0, 110, 0.1) 100%)'
                    : 'transparent',
                  border: isActive 
                    ? '1px solid rgba(0, 212, 255, 0.3)' 
                    : '1px solid transparent',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  position: 'relative',
                  '&:hover': {
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(255, 0, 110, 0.15) 100%)'
                      : 'rgba(0, 212, 255, 0.08)',
                    transform: 'translateY(-2px) translateX(4px)',
                    boxShadow: '0 8px 25px rgba(0, 212, 255, 0.2)',
                    borderColor: 'rgba(0, 212, 255, 0.4)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: isActive 
                        ? 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 100%)'
                        : 'rgba(0, 212, 255, 0.1)',
                      color: isActive ? 'white' : '#00d4ff',
                      border: isActive 
                        ? '1px solid rgba(0, 212, 255, 0.4)'
                        : '1px solid rgba(0, 212, 255, 0.2)',
                      boxShadow: isActive 
                        ? '0 0 20px rgba(0, 212, 255, 0.4)'
                        : 'none',
                    }}
                  >
                    <Icon fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={isActive ? 700 : 600}
                      sx={{ 
                        fontSize: '1rem',
                        color: isActive ? '#00d4ff' : 'rgba(255, 255, 255, 0.9)',
                        textShadow: isActive 
                          ? '0 0 15px rgba(0, 212, 255, 0.5)' 
                          : '0 0 10px rgba(0, 212, 255, 0.2)',
                      }}
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.8rem', 
                        mt: 0.5,
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {item.description}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Cyberpunk Footer */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        borderTop: '1px solid rgba(0, 212, 255, 0.2)',
        position: 'relative',
        background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.03), rgba(255, 0, 110, 0.03))',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #00d4ff, #ff006e, transparent)',
          animation: 'footerLineGlow 2s ease-in-out infinite',
        },
        '@keyframes footerLineGlow': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
      }}>
        <Typography 
          variant="caption" 
          display="block" 
          sx={{ 
            mb: 1,
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 500,
          }}
        >
          Medical data sourced from
        </Typography>
        <Typography 
          variant="caption" 
          fontWeight="bold" 
          sx={{
            background: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 50%, #ff006e 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
            fontSize: '0.8rem',
          }}
        >
          MAYO CLINIC NEURAL DATABASE
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>


      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          pt: '80px', // Account for the header height with padding
        }}
      >
        {/* Page Content */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            pt: 1,
            px: 3,
            pb: 3,
            background: `
              radial-gradient(ellipse at top left, rgba(0, 212, 255, 0.02) 0%, transparent 60%),
              radial-gradient(ellipse at bottom right, rgba(255, 0, 110, 0.02) 0%, transparent 60%),
              transparent
            `,
            minHeight: '100%',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Mobile Navigation FAB */}
      <Fab
        color="primary"
        aria-label="open navigation"
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' },
          background: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 50%, #ff006e 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00a8cc 0%, #6f32d1 50%, #d6005c 100%)',
            transform: 'scale(1.05)',
          },
          zIndex: 1200,
        }}
      >
        <MenuIcon />
      </Fab>
    </Box>
  );
}