'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Psychology as BrainIcon,
  TrendingUp as TrendingIcon,
  VerifiedUser as VerifiedIcon,
  Storage as DatabaseIcon,
  ArrowForward as ArrowIcon,
  Chat as ChatIcon,
  Search as SearchIcon,
  LocalHospital as HospitalIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: BrainIcon,
    title: 'Advanced AI Intelligence',
    description:
      'Powered by RAG (Retrieval-Augmented Generation) technology. Our AI understands medical context and provides personalized responses based on verified clinical data.',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    icon: SpeedIcon,
    title: 'Lightning Fast Responses',
    description:
      'Get comprehensive medical insights in under 2 seconds, powered by ChromaDB vector search and intelligent caching across 10,000+ conditions.',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    icon: SecurityIcon,
    title: 'Privacy First',
    description:
      'Your queries are never stored or shared. All conversations are anonymized and processed securely with no personal data retention.',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    icon: DatabaseIcon,
    title: 'Comprehensive Database',
    description:
      'Access 10,000+ medical conditions across 13 specialized categories including Cardiology, Neurology, Oncology, and more.',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
  {
    icon: VerifiedIcon,
    title: 'Clinically Verified',
    description:
      'Every piece of information is sourced from trusted medical institutions including Mayo Clinic and peer-reviewed clinical guidelines.',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  {
    icon: TrendingIcon,
    title: 'Continuously Updated',
    description:
      'Our system is regularly updated with the latest research findings, treatment protocols, and medical information.',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
];

const stats = [
  { value: '10K+', label: 'Medical Conditions', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { value: '13', label: 'Specialties', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { value: '<2s', label: 'Response Time', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { value: '99%', label: 'Uptime', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
];

const showcaseFeatures = [
  {
    title: 'AI-Powered Medical Chat',
    description:
      'Engage in natural conversations with our AI assistant. Ask about symptoms, conditions, and treatments — get instant, accurate answers powered by RAG technology.',
    image: '/LandingPageChat.png',
    icon: ChatIcon,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    link: '/chat',
    cta: 'Start Chatting',
  },
  {
    title: 'Smart Medical Search',
    description:
      'Lightning-fast search across 10,000+ medical conditions. Filter by category, view detailed information, and find exactly what you need instantly.',
    image: '/LandingPageSearch.png',
    icon: SearchIcon,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    link: '/search',
    cta: 'Search Now',
  },
  {
    title: 'Comprehensive Database',
    description:
      'Browse our extensive medical database with 13 specialized categories. Each condition includes symptoms, causes, risk factors, and treatment options.',
    image: '/LandingPageDatabase.png',
    icon: HospitalIcon,
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    link: '/diseases',
    cta: 'Explore Database',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

export function LandingPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0f7ff 0%, #f8fafc 40%, #ffffff 100%)',
        overflowX: 'hidden',
      }}
    >
      {/* ── Nav bar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid #e2e8f0',
          px: { xs: 2, md: 5 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/LOGO_doctor.png"
            alt="TrustMed-AI"
            sx={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #bfdbfe' }}
          />
          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem' }}>
            TrustMed-AI
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            onClick={() => router.push('/chat')}
            sx={{
              borderRadius: '10px',
              color: '#475569',
              fontSize: '1rem',
              fontWeight: 600,
              px: 2,
              textTransform: 'none',
            }}
          >
            Chat
          </Button>
          <Button
            onClick={() => router.push('/search')}
            sx={{
              borderRadius: '10px',
              color: '#475569',
              fontSize: '1rem',
              fontWeight: 600,
              px: 2,
              textTransform: 'none',
            }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/chat')}
            sx={{
              borderRadius: '10px',
              bgcolor: '#2563eb',
              fontSize: '1rem',
              fontWeight: 700,
              px: 2.5,
              py: 1,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 5 } }}>
        {/* ── Hero ── */}
        <Box sx={{ textAlign: 'center', pt: { xs: 8, md: 14 }, pb: { xs: 8, md: 12 } }}>
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <Box
              component="img"
              src="/LOGO_doctor.png"
              alt="TrustMed-AI"
              sx={{
                width: { xs: 80, md: 100 },
                height: { xs: 80, md: 100 },
                borderRadius: '50%',
                mb: 3.5,
                border: '3px solid #bfdbfe',
                boxShadow: '0 8px 40px rgba(37,99,235,0.18)',
                animation: 'float 4s ease-in-out infinite',
                '@keyframes float': {
                  '0%,100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-12px)' },
                },
              }}
            />
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem' },
                fontWeight: 900,
                mb: 2,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              TrustMed
              <Box component="span" sx={{ color: '#2563eb' }}>
                -AI
              </Box>
            </Typography>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <Typography
              variant="h5"
              sx={{
                color: '#475569',
                mb: 2.5,
                fontWeight: 500,
                fontSize: { xs: '1.125rem', md: '1.375rem' },
              }}
            >
              Your Intelligent Medical Assistant
            </Typography>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                maxWidth: 580,
                mx: 'auto',
                mb: 5.5,
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.125rem' },
              }}
            >
              Get instant, AI-powered medical information on 10,000+ conditions with clinically
              verified data from trusted sources including Mayo Clinic.
            </Typography>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <Box
              sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap', mb: 5 }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={() => router.push('/chat')}
                sx={{
                  px: 5,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  borderRadius: '14px',
                  bgcolor: '#2563eb',
                  boxShadow: '0 4px 20px rgba(37,99,235,0.32)',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                    boxShadow: '0 8px 28px rgba(37,99,235,0.42)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Start Chatting
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/search')}
                sx={{
                  px: 5,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  color: '#475569',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#2563eb',
                    color: '#2563eb',
                    bgcolor: '#eff6ff',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Browse Conditions
              </Button>
            </Box>
          </motion.div>

          <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                borderRadius: '10px',
                bgcolor: '#fffbeb',
                border: '1px solid #fde68a',
              }}
            >
              <WarningIcon sx={{ fontSize: 14, color: '#d97706' }} />
              <Typography sx={{ color: '#92400e', fontSize: '0.8125rem' }}>
                For informational purposes only · Not a substitute for professional medical advice ·
                Emergency: Call 911
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* ── Stats ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
            gap: 2.5,
            mb: 16,
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
            >
              <Card
                sx={{
                  textAlign: 'center',
                  p: 3.5,
                  bgcolor: stat.bg,
                  border: `1px solid ${stat.border}`,
                  borderRadius: '20px',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Typography
                  sx={{
                    color: stat.color,
                    fontWeight: 900,
                    fontSize: { xs: '2.25rem', md: '3rem' },
                    lineHeight: 1,
                    mb: 0.75,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{ color: '#475569', fontWeight: 600, fontSize: '1rem' }}
                >
                  {stat.label}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </Box>

        {/* ── Feature Showcases ── */}
        <Box sx={{ mb: 16 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                color: '#0f172a',
                fontWeight: 800,
                mb: 1.5,
                fontSize: { xs: '1.875rem', md: '2.5rem' },
              }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: '#64748b',
                mb: 9,
                maxWidth: 520,
                mx: 'auto',
                fontSize: '1.125rem',
              }}
            >
              Everything you need to access reliable medical information
            </Typography>
          </motion.div>

          {showcaseFeatures.map((feature, i) => {
            const IconComponent = feature.icon;
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                custom={0}
                variants={fadeUp}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: isEven ? 'row' : 'row-reverse' },
                    gap: { xs: 4, md: 9 },
                    mb: { xs: 10, md: 14 },
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: `1px solid ${feature.border}`,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
                        },
                      }}
                      onClick={() => router.push(feature.link)}
                    >
                      <Box
                        component="img"
                        src={feature.image}
                        alt={feature.title}
                        sx={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        bgcolor: feature.bg,
                        border: `1px solid ${feature.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <IconComponent sx={{ fontSize: 28, color: feature.color }} />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#0f172a',
                        fontWeight: 800,
                        mb: 2,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.8,
                        mb: 3.5,
                        fontSize: '1.125rem',
                      }}
                    >
                      {feature.description}
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowIcon />}
                      onClick={() => router.push(feature.link)}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: '12px',
                        bgcolor: feature.color,
                        textTransform: 'none',
                        boxShadow: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: feature.color,
                          filter: 'brightness(0.9)',
                          boxShadow: `0 6px 20px ${feature.color}40`,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {feature.cta}
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* ── Why TrustMed-AI ── */}
        <Box sx={{ mb: 16 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                color: '#0f172a',
                fontWeight: 800,
                mb: 1.5,
                fontSize: { xs: '1.875rem', md: '2.5rem' },
              }}
            >
              Why TrustMed-AI?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: '#64748b',
                mb: 8,
                maxWidth: 500,
                mx: 'auto',
                fontSize: '1.125rem',
              }}
            >
              Cutting-edge technology meets medical expertise
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' },
              gap: 3,
            }}
          >
            {features.map((feature, i) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  custom={i % 3}
                  variants={fadeUp}
                >
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: feature.border,
                        transform: 'translateY(-4px)',
                        boxShadow: '0 14px 36px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3.5 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '14px',
                          bgcolor: feature.bg,
                          border: `1px solid ${feature.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                        }}
                      >
                        <IconComponent sx={{ fontSize: 28, color: feature.color }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#0f172a',
                          fontWeight: 700,
                          mb: 1.5,
                          fontSize: '1.125rem',
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#64748b', lineHeight: 1.75, fontSize: '1rem' }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </Box>
        </Box>

        {/* ── CTA ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
        >
          <Box
            sx={{
              textAlign: 'center',
              mb: 12,
              p: { xs: 5, md: 10 },
              borderRadius: '28px',
              background:
                'linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #7c3aed 100%)',
              boxShadow: '0 20px 60px rgba(37,99,235,0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.875rem', md: '2.75rem' },
              }}
            >
              Ready to get started?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                mb: 5,
                maxWidth: 480,
                mx: 'auto',
                lineHeight: 1.75,
                fontSize: '1.125rem',
              }}
            >
              Join thousands of users who rely on TrustMed-AI for accurate, AI-powered medical
              information.
            </Typography>
            <Box
              sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ChatIcon />}
                onClick={() => router.push('/chat')}
                sx={{
                  px: 5,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  borderRadius: '14px',
                  bgcolor: '#ffffff',
                  color: '#2563eb',
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#f0f7ff',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Start Chatting
              </Button>
              <Button
                variant="outlined"
                size="large"
                endIcon={<HospitalIcon />}
                onClick={() => router.push('/diseases')}
                sx={{
                  px: 5,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  borderRadius: '14px',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  color: '#ffffff',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Explore Database
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* ── Footer ── */}
        <Box sx={{ borderTop: '1px solid #e2e8f0', py: 5, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Box
              component="img"
              src="/LOGO_doctor.png"
              alt="TrustMed-AI"
              sx={{ width: 28, height: 28, borderRadius: '50%', opacity: 0.7 }}
            />
            <Typography sx={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>
              © 2025 TrustMed-AI · Medical data sourced from Mayo Clinic
            </Typography>
          </Box>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            For informational purposes only. Not a substitute for professional medical advice. In
            emergencies, call 911.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
