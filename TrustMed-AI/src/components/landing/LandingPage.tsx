'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Application } from '@splinetool/runtime';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: { xs: 360, md: 600 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: '3px solid rgba(244,63,94,0.16)',
          borderTopColor: '#f43f5e',
          animation: 'splineLoadSpin 0.9s linear infinite',
          '@keyframes splineLoadSpin': {
            to: { transform: 'rotate(360deg)' },
          },
        }}
      />
    </Box>
  ),
});

const features = [
  {
    image: '/ChatBotIcon.png',
    title: 'Source-Grounded Medical AI',
    description:
      'Answers are generated from retrieved medical evidence, source links, and cited context instead of unsupported free-form output.',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    image: '/searchicon.png',
    title: 'Hybrid Retrieval Pipeline',
    description:
      'Combines ChromaDB retrieval with optional FAISS refinement and cross-encoder reranking to improve evidence ordering before generation.',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    image: '/LOGO_doctor.png',
    title: 'Public Reference Index',
    description:
      'The vector store is built around curated public medical reference content, avoiding raw patient records in the retrieval index.',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    image: '/DatabaseIcon.png',
    title: 'Agentic RAG Orchestration',
    description:
      'Routes questions across symptoms, diseases, and medicines collections with agent-level scoring, confidence, and source aggregation.',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
  {
    image: '/LandingPageDatabase.png',
    title: 'Evaluation-Ready Architecture',
    description:
      'Includes a 100-prompt evaluation dataset plus precision@K, MRR, grounding, and hallucination-risk benchmark scripts.',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  {
    image: '/Robot.png',
    title: 'Voice-Accessible Experience',
    description:
      'ElevenLabs speech-to-text and text-to-speech make the assistant easier to use for patients who prefer listening or speaking.',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
];

const trustCards = [
  {
    eyebrow: 'Evidence first',
    title: 'Agentic RAG answers stay attached to sources',
    description:
      'The assistant retrieves medical context first, then presents source cards, confidence, and timing metadata so the answer can be inspected.',
    image: '/ChatBotIcon.png',
    color: '#2563eb',
    bg: 'rgba(239,246,255,0.78)',
    border: '#bfdbfe',
  },
  {
    eyebrow: 'ReAct-style planning',
    title: 'Classify, choose tools, retrieve, then answer',
    description:
      'A lightweight ReAct-style router classifies the query, chooses the right medical collections, and exposes the reasoning trace through the API.',
    image: '/searchicon.png',
    color: '#7c3aed',
    bg: 'rgba(245,243,255,0.78)',
    border: '#ddd6fe',
  },
  {
    eyebrow: 'Accessible UX',
    title: 'Speak, listen, search, and explore',
    description:
      'Voice input, text-to-speech, animated response rendering, and visual medical navigation make the project feel like a complete product.',
    image: '/DatabaseIcon.png',
    color: '#0891b2',
    bg: 'rgba(236,254,255,0.78)',
    border: '#a5f3fc',
  },
];

const stats = [
  { value: '9K+', label: 'Indexed Medical Chunks', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { value: '461', label: 'Condition Profiles', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { value: '3', label: 'Retrieval Agents', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { value: '100', label: 'Evaluation Prompts', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
];

const showcaseFeatures = [
  {
    title: 'AI-Powered Medical Chat',
    description:
      'Ask about symptoms, conditions, medicines, and follow-up questions. Responses use Agentic RAG, source cards, ReAct-style routing metadata, and word-by-word answer rendering.',
    image: '/LandingPageChat.png',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    link: '/chat',
    cta: 'Start Chatting',
  },
  {
    title: 'Smart Medical Search',
    description:
      'Search indexed medical conditions with a polished clinical interface, category filtering, animated result cards, and direct handoff into the retrieval agents.',
    image: '/LandingPageSearch.png',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    link: '/search',
    cta: 'Search Now',
  },
  {
    title: 'Comprehensive Database',
    description:
      'Browse hundreds of condition profiles organized by medical category, then open detailed pages or ask the assistant for a source-grounded summary.',
    image: '/LandingPageDatabase.png',
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

function LandingAmbientBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        bgcolor: '#f8fbff',
        background:
          'linear-gradient(135deg, rgba(239,246,255,0.96) 0%, rgba(255,255,255,0.82) 46%, rgba(236,254,255,0.72) 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-54px',
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.075) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          animation: 'landingGridDrift 36s linear infinite',
          maskImage: 'radial-gradient(circle at 58% 18%, black 0%, rgba(0,0,0,0.76) 36%, rgba(0,0,0,0.34) 78%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(115deg, rgba(37,99,235,0.10), transparent 30%, rgba(6,182,212,0.12) 58%, transparent 82%)',
          animation: 'landingLightSweep 14s ease-in-out infinite alternate',
        },
        '@keyframes landingGridDrift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(46px, 46px, 0)' },
        },
        '@keyframes landingLightSweep': {
          '0%': { opacity: 0.34, transform: 'translateX(-4%)' },
          '100%': { opacity: 0.82, transform: 'translateX(4%)' },
        },
      }}
    />
  );
}

function SplineHandVisual() {
  const isMobileSpline = useMediaQuery('(max-width:899px)', { noSsr: true });
  const scene = isMobileSpline ? '/hand3.splinecode' : '/hand2.splinecode';
  const handleSplineLoad = (spline: Application) => {
    if (isMobileSpline) {
      spline.setZoom(0.58);
    } else {
      spline.setZoom(1.2);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: 300, md: 620, lg: 700 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: { xs: 'hidden', md: 'visible' },
        pointerEvents: { xs: 'none', md: 'auto' },
        '&::before': {
          content: '""',
          position: 'absolute',
          width: { xs: 260, md: 620, lg: 760 },
          height: { xs: 260, md: 620, lg: 760 },
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(244,63,94,0.18), rgba(6,182,212,0.10) 45%, transparent 70%)',
          filter: 'blur(10px)',
          zIndex: -2,
          animation: 'splineHeroAura 5.6s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: { xs: 0, md: -20 },
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.34), rgba(248,251,255,0.12) 48%, transparent 72%)',
          zIndex: -1,
          pointerEvents: 'none',
        },
        '@keyframes splineHeroAura': {
          '0%,100%': { transform: 'scale(0.96)', opacity: 0.72 },
          '50%': { transform: 'scale(1.05)', opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 360, sm: 430, md: '112%', lg: '116%' },
          maxWidth: { xs: '100%', md: 'none' },
          height: { xs: 318, sm: 350, md: 680, lg: 760 },
          overflow: { xs: 'hidden', md: 'visible' },
          ml: { xs: 0, md: '-4%', lg: '-8%' },
          '& > div, & canvas': {
            outline: 'none',
            background: 'transparent !important',
            pointerEvents: { xs: 'none !important', md: 'auto' },
          },
          transform: { xs: 'none', md: 'scale(0.87)', lg: 'scale(0.9)' },
          transformOrigin: 'center',
        }}
      >
        <Spline
          key={scene}
          scene={scene}
          onLoad={handleSplineLoad}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
          }}
        />
      </Box>
    </Box>
  );
}

export function LandingPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f8fafc 44%, #ffffff 100%)',
        overflowX: 'hidden',
      }}
    >
      <LandingAmbientBackdrop />

      {/* ── Nav bar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'rgba(255,255,255,0.70)',
          backdropFilter: 'blur(22px)',
          borderBottom: '1px solid rgba(219,234,254,0.82)',
          px: { xs: 1.5, md: 5 },
          py: { xs: 1.05, md: 1.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 34px rgba(37,99,235,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/LOGO_doctor.png"
            alt="TrustMed-AI"
            sx={{
              width: { xs: 36, md: 42 },
              height: { xs: 36, md: 42 },
              borderRadius: '50%',
              border: '2px solid #bfdbfe',
              boxShadow: '0 12px 28px rgba(37,99,235,0.18)',
            }}
          />
          <Box>
            <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.1 }}>
              TrustMed-AI
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              Source-grounded medical assistant
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.75, alignItems: 'center' }}>
          <Button
            onClick={() => router.push('/chat')}
            sx={{
              borderRadius: '999px',
              color: '#475569',
              fontSize: '0.92rem',
              fontWeight: 750,
              px: 2,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(239,246,255,0.88)', color: '#2563eb' },
            }}
          >
            Chat
          </Button>
          <Button
            onClick={() => router.push('/search')}
            sx={{
              borderRadius: '999px',
              color: '#475569',
              fontSize: '0.92rem',
              fontWeight: 750,
              px: 2,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(239,246,255,0.88)', color: '#2563eb' },
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => router.push('/diseases')}
            sx={{
              borderRadius: '999px',
              color: '#475569',
              fontSize: '0.92rem',
              fontWeight: 750,
              px: 2,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(239,246,255,0.88)', color: '#2563eb' },
            }}
          >
            Database
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/chat')}
            sx={{
              borderRadius: '999px',
              bgcolor: '#2563eb',
              fontSize: '0.92rem',
              fontWeight: 850,
              px: 2.6,
              py: 1,
              textTransform: 'none',
              boxShadow: '0 14px 30px rgba(37,99,235,0.24)',
              '&:hover': { bgcolor: '#1d4ed8', transform: 'translateY(-1px)' },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: 'grid', md: 'none' },
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0.8,
          position: 'sticky',
          top: 58,
          zIndex: 99,
          px: 1.25,
          py: 1,
          bgcolor: 'rgba(248,251,255,0.84)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(219,234,254,0.86)',
        }}
      >
        {[
          ['Chat', '/chat', '/ChatBotIcon.png'],
          ['Search', '/search', '/searchicon.png'],
          ['Database', '/diseases', '/DatabaseIcon.png'],
        ].map(([label, href, image]) => (
          <Button
            key={label}
            onClick={() => router.push(href)}
            sx={{
              minWidth: 0,
              borderRadius: '16px',
              py: 1.05,
              px: 0.7,
              color: '#334155',
              bgcolor: 'rgba(255,255,255,0.78)',
              border: '1px solid rgba(191,219,254,0.9)',
              boxShadow: '0 10px 22px rgba(37,99,235,0.07)',
              textTransform: 'none',
              fontWeight: 850,
              fontSize: '0.78rem',
              display: 'flex',
              gap: 0.65,
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            <Box
              component="img"
              src={image}
              alt=""
              sx={{ width: 22, height: 22, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
            />
            {label}
          </Button>
        ))}
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 1.5, md: 5 }, position: 'relative', zIndex: 1 }}>
        {/* ── Hero ── */}
        <Box
          sx={{
            minHeight: { xs: 'auto', lg: 'calc(100vh - 78px)' },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
            alignItems: 'center',
            gap: { xs: 2.5, md: 4, lg: 5 },
            pt: { xs: 3.5, md: 8, lg: 4 },
            pb: { xs: 4.5, md: 8, lg: 4 },
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', lg: 'left' }, maxWidth: 660 }}>
            <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: { xs: 1.1, md: 1.4 },
                  py: { xs: 0.65, md: 0.8 },
                  mb: { xs: 2, md: 3 },
                  borderRadius: '999px',
                  bgcolor: 'rgba(255,255,255,0.76)',
                  border: '1px solid rgba(191,219,254,0.9)',
                  boxShadow: '0 14px 34px rgba(37,99,235,0.10)',
                  backdropFilter: 'blur(14px)',
                }}
              >
                <Box
                  component="img"
                  src="/LOGO_doctor.png"
                  alt="TrustMed-AI"
                  sx={{ width: { xs: 30, md: 36 }, height: { xs: 30, md: 36 }, borderRadius: '50%', border: '2px solid #bfdbfe' }}
                />
                <Typography sx={{ color: '#1d4ed8', fontWeight: 850, fontSize: { xs: '0.78rem', md: '0.92rem' } }}>
                  Medical AI with cited retrieval
                </Typography>
              </Box>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.55rem', sm: '4.2rem', md: '5.8rem', lg: '6.4rem' },
                  fontWeight: 950,
                  mb: { xs: 1.25, md: 2 },
                  color: '#0f172a',
                  letterSpacing: 0,
                  lineHeight: 0.96,
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
                  color: '#334155',
                  mb: { xs: 1.25, md: 2 },
                  fontWeight: 750,
                  fontSize: { xs: '1rem', md: '1.55rem' },
                }}
              >
                Your intelligent medical assistant for faster, clearer answers.
              </Typography>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                  maxWidth: 590,
                  mx: { xs: 'auto', lg: 0 },
                  mb: { xs: 2.75, md: 4.25 },
                  lineHeight: { xs: 1.6, md: 1.75 },
                  fontSize: { xs: '0.94rem', md: '1.12rem' },
                }}
              >
                Ask clinical questions, search conditions, and explore medical topics with a
                retrieval-backed AI interface built around trusted sources and accessible voice
                support.
              </Typography>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1.2, md: 2 },
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                  flexWrap: 'wrap',
                  mb: { xs: 2, md: 3 },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowIcon />}
                  onClick={() => router.push('/chat')}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    px: { xs: 2.5, md: 4.5 },
                    py: { xs: 1.25, md: 1.7 },
                    fontSize: { xs: '0.95rem', md: '1.0625rem' },
                    fontWeight: 800,
                    borderRadius: '16px',
                    bgcolor: '#2563eb',
                    boxShadow: '0 18px 36px rgba(37,99,235,0.28)',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#1d4ed8',
                      boxShadow: '0 22px 44px rgba(37,99,235,0.38)',
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
                    width: { xs: '100%', sm: 'auto' },
                    px: { xs: 2.5, md: 4.5 },
                    py: { xs: 1.25, md: 1.7 },
                    fontSize: { xs: '0.95rem', md: '1.0625rem' },
                    fontWeight: 700,
                    borderRadius: '16px',
                    border: '1.5px solid rgba(148,163,184,0.38)',
                    color: '#334155',
                    bgcolor: 'rgba(255,255,255,0.62)',
                    backdropFilter: 'blur(14px)',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#2563eb',
                      color: '#2563eb',
                      bgcolor: 'rgba(239,246,255,0.92)',
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
                  px: { xs: 1.25, md: 2 },
                  py: { xs: 0.75, md: 0.9 },
                  borderRadius: '999px',
                  bgcolor: 'rgba(255,251,235,0.78)',
                  border: '1px solid #fde68a',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <WarningIcon sx={{ fontSize: 14, color: '#d97706' }} />
                <Typography sx={{ color: '#92400e', fontSize: { xs: '0.72rem', md: '0.8rem' }, fontWeight: 650 }}>
                  Educational medical information with verified sources
                </Typography>
              </Box>
            </motion.div>
          </Box>

          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <SplineHandVisual />
          </motion.div>
        </Box>

        {/* ── Stats ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
            gap: { xs: 1.15, md: 2.5 },
            mb: { xs: 8, md: 16 },
            mt: { xs: 1, lg: -1 },
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
                  p: { xs: 1.55, md: 3.5 },
                  bgcolor: 'rgba(255,255,255,0.70)',
                  border: `1px solid ${stat.border}`,
                  borderRadius: { xs: '16px', md: '20px' },
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 18px 42px rgba(15,23,42,0.06)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    bgcolor: stat.bg,
                    boxShadow: '0 22px 46px rgba(37,99,235,0.10)',
                  },
                }}
              >
                <Typography
                  sx={{
                    color: stat.color,
                    fontWeight: 900,
                    fontSize: { xs: '1.85rem', md: '3rem' },
                    lineHeight: 1,
                    mb: 0.75,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{ color: '#475569', fontWeight: 700, fontSize: { xs: '0.78rem', md: '1rem' }, lineHeight: 1.25 }}
                >
                  {stat.label}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </Box>

        {/* ── Feature Showcases ── */}
        <Box sx={{ mb: { xs: 8, md: 16 } }}>
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
                mb: { xs: 1, md: 1.5 },
                fontSize: { xs: '1.55rem', md: '2.5rem' },
              }}
            >
              Built for Real Medical Workflows
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: '#64748b',
                mb: { xs: 4, md: 9 },
                maxWidth: 520,
                mx: 'auto',
                fontSize: { xs: '0.94rem', md: '1.125rem' },
                lineHeight: 1.6,
              }}
            >
              A connected experience across chat, search, retrieval, voice, and condition browsing.
            </Typography>
          </motion.div>

          {showcaseFeatures.map((feature, i) => {
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
                    gap: { xs: 2.4, md: 9 },
                    mb: { xs: 7, md: 14 },
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        borderRadius: { xs: '18px', md: '24px' },
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
                        sx={{
                          width: '100%',
                          height: { xs: 210, sm: 260, md: 'auto' },
                          objectFit: { xs: 'cover', md: 'initial' },
                          objectPosition: 'top center',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, width: '100%' }}>
                    <Box
                      sx={{
                        width: { xs: 52, md: 68 },
                        height: { xs: 52, md: 68 },
                        borderRadius: '50%',
                        bgcolor: feature.bg,
                        border: `1px solid ${feature.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0.65,
                        mb: { xs: 1.6, md: 3 },
                        boxShadow: `0 16px 34px ${feature.color}24`,
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          feature.link === '/chat'
                            ? '/ChatBotIcon.png'
                            : feature.link === '/search'
                              ? '/searchicon.png'
                              : '/DatabaseIcon.png'
                        }
                        alt={feature.title}
                        sx={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#0f172a',
                        fontWeight: 800,
                        mb: 2,
                        fontSize: { xs: '1.28rem', md: '2rem' },
                        lineHeight: 1.18,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748b',
                        lineHeight: { xs: 1.62, md: 1.8 },
                        mb: { xs: 2.4, md: 3.5 },
                        fontSize: { xs: '0.94rem', md: '1.125rem' },
                      }}
                    >
                      {feature.description}
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowIcon />}
                      onClick={() => router.push(feature.link)}
                      sx={{
                        width: { xs: '100%', sm: 'auto' },
                        px: { xs: 2.5, md: 4 },
                        py: { xs: 1.15, md: 1.5 },
                        fontSize: { xs: '0.92rem', md: '1rem' },
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
        <Box sx={{ mb: { xs: 8, md: 16 }, position: 'relative' }}>
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
                mb: { xs: 1, md: 1.5 },
                fontSize: { xs: '1.55rem', md: '2.5rem' },
              }}
            >
              Why TrustMed-AI?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: '#64748b',
                mb: { xs: 4, md: 7 },
                maxWidth: 620,
                mx: 'auto',
                fontSize: { xs: '0.94rem', md: '1.125rem' },
                lineHeight: { xs: 1.6, md: 1.7 },
              }}
            >
              A portfolio-grade medical AI system designed to show real engineering depth:
              retrieval, reranking, evaluation, voice, and a polished patient-facing interface.
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr' },
              gap: { xs: 2, md: 3 },
              alignItems: 'stretch',
            }}
          >
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 2, md: 4 },
                  borderRadius: { xs: '22px', md: '28px' },
                  bgcolor: 'rgba(255,255,255,0.74)',
                  border: '1px solid rgba(191,219,254,0.9)',
                  backdropFilter: 'blur(18px)',
                  boxShadow: '0 24px 62px rgba(37,99,235,0.10)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(120deg, rgba(37,99,235,0.08), transparent 36%, rgba(6,182,212,0.10))',
                    pointerEvents: 'none',
                  },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.4, md: 2 }, mb: { xs: 2, md: 3 } }}>
                    <Box
                      component="img"
                      src="/LOGO_doctor.png"
                      alt="TrustMed-AI"
                      sx={{
                        width: { xs: 52, md: 72 },
                        height: { xs: 52, md: 72 },
                        borderRadius: '50%',
                        border: '3px solid #bfdbfe',
                        boxShadow: '0 18px 38px rgba(37,99,235,0.18)',
                      }}
                    />
                    <Box>
                      <Typography sx={{ color: '#2563eb', fontWeight: 850, fontSize: { xs: '0.68rem', md: '0.82rem' }, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        System Snapshot
                      </Typography>
                      <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: { xs: '1.18rem', md: '2rem' }, lineHeight: 1.12 }}>
                        Built like a real medical AI product
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: '#64748b', fontSize: { xs: '0.92rem', md: '1.06rem' }, lineHeight: { xs: 1.62, md: 1.75 }, mb: { xs: 2.4, md: 3.5 } }}>
                    TrustMed-AI is not just a UI shell. It connects a FastAPI RAG backend,
                    ChromaDB collections, optional FAISS refinement, cross-encoder reranking,
                    voice endpoints, evaluation scripts, and a modern patient-facing experience.
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(2,1fr)' }, gap: { xs: 1, md: 1.5 } }}>
                    {[
                      ['ChromaDB', 'persistent vector retrieval'],
                      ['FAISS', 'candidate refinement'],
                      ['Cross-Encoder', 'evidence reranking'],
                      ['ElevenLabs', 'voice input and output'],
                    ].map(([label, detail]) => (
                      <Box
                        key={label}
                        sx={{
                          p: { xs: 1.15, md: 1.6 },
                          borderRadius: { xs: '14px', md: '16px' },
                          bgcolor: 'rgba(248,250,252,0.78)',
                          border: '1px solid rgba(219,234,254,0.95)',
                        }}
                      >
                        <Typography sx={{ color: '#0f172a', fontWeight: 850, fontSize: { xs: '0.78rem', md: '0.95rem' } }}>
                          {label}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: { xs: '0.68rem', md: '0.78rem' }, mt: 0.35, lineHeight: 1.25 }}>
                          {detail}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </motion.div>

            <Box sx={{ display: 'grid', gap: { xs: 1.25, md: 2 } }}>
              {trustCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  custom={i}
                  variants={fadeUp}
                >
                  <Card
                    sx={{
                      bgcolor: card.bg,
                      border: `1px solid ${card.border}`,
                      borderRadius: { xs: '18px', md: '22px' },
                      boxShadow: '0 18px 42px rgba(15,23,42,0.06)',
                      transition: 'all 0.22s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 24px 50px ${card.color}1f`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.6, md: 2.4 }, display: 'flex', gap: { xs: 1.25, md: 2 }, alignItems: 'flex-start' }}>
                      <Box
                        component="img"
                        src={card.image}
                        alt={card.title}
                        sx={{
                          width: { xs: 42, md: 54 },
                          height: { xs: 42, md: 54 },
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(255,255,255,0.82)',
                          boxShadow: `0 12px 28px ${card.color}26`,
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography sx={{ color: card.color, fontWeight: 850, fontSize: { xs: '0.64rem', md: '0.72rem' }, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.6 }}>
                          {card.eyebrow}
                        </Typography>
                        <Typography sx={{ color: '#0f172a', fontWeight: 850, fontSize: { xs: '0.92rem', md: '1.05rem' }, mb: 0.75, lineHeight: 1.25 }}>
                          {card.title}
                        </Typography>
                        <Typography sx={{ color: '#64748b', lineHeight: 1.55, fontSize: { xs: '0.82rem', md: '0.92rem' } }}>
                          {card.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
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
              textAlign: { xs: 'center', lg: 'left' },
              mb: { xs: 7, md: 12 },
              p: { xs: 2.1, md: 5 },
              borderRadius: { xs: '24px', md: '32px' },
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,64,175,0.94) 52%, rgba(8,145,178,0.92) 100%)',
              boxShadow: '0 28px 80px rgba(15,23,42,0.28)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(219,234,254,0.24)',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 18% 30%, rgba(255,255,255,0.16), transparent 28%), radial-gradient(circle at 82% 58%, rgba(34,211,238,0.22), transparent 34%)',
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
                backgroundSize: '38px 38px',
                maskImage: 'linear-gradient(90deg, transparent, black 18%, black 82%, transparent)',
                pointerEvents: 'none',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr auto' },
                alignItems: 'center',
                gap: { xs: 2.6, md: 4 },
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: { xs: 1.1, md: 1.35 },
                    py: { xs: 0.65, md: 0.75 },
                    mb: { xs: 1.7, md: 2.5 },
                    borderRadius: '999px',
                    bgcolor: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.22)',
                  }}
                >
                  <Box component="img" src="/LOGO_doctor.png" alt="" sx={{ width: { xs: 22, md: 26 }, height: { xs: 22, md: 26 }, borderRadius: '50%' }} />
                  <Typography sx={{ color: '#dbeafe', fontWeight: 850, fontSize: { xs: '0.72rem', md: '0.84rem' } }}>
                    Try the complete TrustMed-AI flow
                  </Typography>
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 930,
                    mb: { xs: 1.3, md: 2 },
                    lineHeight: 1.06,
                    fontSize: { xs: '1.5rem', md: '3rem' },
                    letterSpacing: 0,
                  }}
                >
                  Ask a question, inspect the evidence, then explore the medical index.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(226,232,240,0.88)',
                    mb: { xs: 2, md: 3 },
                    maxWidth: 680,
                    lineHeight: { xs: 1.58, md: 1.75 },
                    fontSize: { xs: '0.9rem', md: '1.08rem' },
                  }}
                >
                  The demo is designed to show backend orchestration and frontend craft together:
                  Agentic RAG routing, ReAct-style query planning, source cards, confidence,
                  retrieval metadata, voice access, and visual browsing.
                </Typography>
                <Box sx={{ display: 'flex', gap: { xs: 0.75, md: 1.2 }, flexWrap: 'wrap', justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                  {['Agentic RAG', 'ReAct-style routing', 'FAISS refinement', 'Cross-encoder reranking', '100-prompt evaluation', 'Voice enabled'].map((chip) => (
                    <Box
                      key={chip}
                      sx={{
                        px: { xs: 1.05, md: 1.6 },
                        py: { xs: 0.58, md: 0.8 },
                        borderRadius: '999px',
                        color: '#e0f2fe',
                        bgcolor: 'rgba(255,255,255,0.095)',
                        border: '1px solid rgba(255,255,255,0.16)',
                        fontSize: { xs: '0.7rem', md: '0.82rem' },
                        fontWeight: 750,
                      }}
                    >
                      {chip}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: { xs: 1, md: 1.5 },
                  justifyItems: { xs: 'center', lg: 'stretch' },
                  minWidth: { lg: 270 },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/chat')}
                  sx={{
                    width: '100%',
                    px: { xs: 1.4, md: 3.2 },
                    py: { xs: 1.05, md: 1.45 },
                    minHeight: { xs: 62, md: 74 },
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: { xs: 1.05, md: 1.6 },
                    fontSize: { xs: '0.96rem', md: '1.12rem' },
                    fontWeight: 900,
                    borderRadius: { xs: '17px', md: '20px' },
                    bgcolor: '#ffffff',
                    color: '#1d4ed8',
                    textTransform: 'none',
                    boxShadow: '0 18px 38px rgba(0,0,0,0.18)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#eff6ff',
                      boxShadow: '0 24px 46px rgba(0,0,0,0.22)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 40, md: 48 },
                      height: { xs: 40, md: 48 },
                      borderRadius: { xs: '14px', md: '16px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(219,234,254,0.92)',
                      border: '1px solid rgba(147,197,253,0.9)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 22px rgba(37,99,235,0.18)',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src="/ChatBotIcon.png"
                      alt=""
                      sx={{ width: { xs: 31, md: 38 }, height: { xs: 31, md: 38 }, borderRadius: '12px', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box component="span">Start AI Chat</Box>
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/diseases')}
                  sx={{
                    width: '100%',
                    px: { xs: 1.4, md: 3.2 },
                    py: { xs: 1.05, md: 1.45 },
                    minHeight: { xs: 62, md: 74 },
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: { xs: 1.05, md: 1.6 },
                    fontSize: { xs: '0.96rem', md: '1.12rem' },
                    fontWeight: 800,
                    borderRadius: { xs: '17px', md: '20px' },
                    border: '1.5px solid rgba(255,255,255,0.45)',
                    color: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.07)',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#ffffff',
                      bgcolor: 'rgba(255,255,255,0.13)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 40, md: 48 },
                      height: { xs: 40, md: 48 },
                      borderRadius: { xs: '14px', md: '16px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.16)',
                      border: '1px solid rgba(255,255,255,0.28)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.24), 0 10px 22px rgba(15,23,42,0.18)',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src="/DatabaseIcon.png"
                      alt=""
                      sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 }, borderRadius: '12px', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box component="span">Explore Database</Box>
                </Button>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* ── Footer ── */}
        <Box
          sx={{
            borderTop: '1px solid rgba(191,219,254,0.82)',
            py: { xs: 3, md: 5 },
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.75fr 0.75fr' },
              gap: { xs: 2.4, md: 4 },
              alignItems: 'start',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                <Box
                  component="img"
                  src="/LOGO_doctor.png"
                  alt="TrustMed-AI"
                  sx={{ width: { xs: 38, md: 44 }, height: { xs: 38, md: 44 }, borderRadius: '50%', boxShadow: '0 12px 28px rgba(37,99,235,0.16)' }}
                />
                <Box>
                  <Typography sx={{ color: '#0f172a', fontSize: { xs: '0.98rem', md: '1.04rem' }, fontWeight: 900, lineHeight: 1.1 }}>
                    TrustMed-AI
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>
                    Medical AI, grounded in retrieval.
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ color: '#64748b', maxWidth: 470, lineHeight: 1.6, fontSize: { xs: '0.84rem', md: '0.92rem' } }}>
                A full-stack medical assistant project combining FastAPI orchestration, vector
                search, reranking, voice access, 3D visuals, and evaluation-ready documentation.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: '#0f172a', fontWeight: 850, mb: 1.1, fontSize: '0.9rem' }}>
                Product
              </Typography>
              {[
                ['AI Chat', '/chat'],
                ['Medical Search', '/search'],
                ['Disease Database', '/diseases'],
              ].map(([label, href]) => (
                <Button
                  key={label}
                  onClick={() => router.push(href)}
                  sx={{
                    display: { xs: 'inline-flex', md: 'block' },
                    minWidth: 0,
                    px: { xs: 1.2, md: 0 },
                    py: { xs: 0.65, md: 0 },
                    mr: { xs: 0.7, md: 0 },
                    mb: { xs: 0.8, md: 1 },
                    borderRadius: { xs: '999px', md: 0 },
                    border: { xs: '1px solid rgba(191,219,254,0.78)', md: 'none' },
                    bgcolor: { xs: 'rgba(255,255,255,0.62)', md: 'transparent' },
                    color: '#64748b',
                    fontWeight: 650,
                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                    textTransform: 'none',
                    '&:hover': { color: '#2563eb', bgcolor: 'transparent' },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>

            <Box>
              <Typography sx={{ color: '#0f172a', fontWeight: 850, mb: 1.1, fontSize: '0.9rem' }}>
                System Signals
              </Typography>
              {['Agentic RAG', 'ReAct-style routing', 'ChromaDB retrieval', 'FAISS refinement', 'Cross-encoder reranking', 'ElevenLabs voice'].map((item) => (
                <Typography
                  key={item}
                  sx={{
                    display: 'inline-flex',
                    mr: 0.75,
                    mb: 0.8,
                    px: { xs: 1.05, md: 0 },
                    py: { xs: 0.55, md: 0 },
                    borderRadius: { xs: '999px', md: 0 },
                    bgcolor: { xs: 'rgba(239,246,255,0.76)', md: 'transparent' },
                    border: { xs: '1px solid rgba(191,219,254,0.78)', md: 'none' },
                    color: '#64748b',
                    fontSize: { xs: '0.76rem', md: '0.9rem' },
                    fontWeight: 650,
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              mt: { xs: 2.5, md: 4 },
              pt: { xs: 2, md: 3 },
              borderTop: '1px solid rgba(226,232,240,0.88)',
              display: 'flex',
              justifyContent: { xs: 'center', md: 'space-between' },
              textAlign: { xs: 'center', md: 'left' },
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography sx={{ color: '#94a3b8', fontSize: { xs: '0.76rem', md: '0.84rem' }, fontWeight: 650 }}>
              © 2025 TrustMed-AI. Built as a full-stack medical AI portfolio project.
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: { xs: '0.76rem', md: '0.84rem' }, fontWeight: 650 }}>
              Educational medical information with cited public sources.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
