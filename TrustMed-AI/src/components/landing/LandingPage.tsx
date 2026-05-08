'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  alpha,
} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
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
} from '@mui/icons-material';

const features = [
  {
    icon: BrainIcon,
    title: 'Advanced AI Intelligence',
    description: 'Powered by state-of-the-art advanced neural networks and RAG (Retrieval-Augmented Generation) technology. Our AI understands context, medical terminology, and provides personalized responses based on your specific symptoms and concerns. Trained on millions of verified medical cases and continuously learning from the latest research.',
    color: '#00d4ff',
  },
  {
    icon: SpeedIcon,
    title: 'Lightning Fast Responses',
    description: 'Experience blazing-fast query processing with our optimized infrastructure. Get comprehensive medical insights in under 2 seconds, powered by ChromaDB vector search and intelligent caching. No more waiting - instant answers when you need them most, with real-time database querying across 10,000+ conditions.',
    color: '#7c3aed',
  },
  {
    icon: SecurityIcon,
    title: 'Bank-Level Security & Privacy',
    description: 'Your health data deserves maximum protection. All queries are encrypted end-to-end with AES-256 encryption. We never store personal information, never share data with third parties, and all conversations are anonymized. HIPAA-compliant infrastructure ensures your medical privacy is always protected.',
    color: '#ff006e',
  },
  {
    icon: DatabaseIcon,
    title: 'Comprehensive Medical Database',
    description: 'Access a vast repository of 10,000+ medical conditions spanning 13 specialized categories including Cardiology, Neurology, Oncology, and more. Each condition includes detailed symptoms, causes, risk factors, diagnostic procedures, treatment options, and prevention strategies sourced from Mayo Clinic and leading medical institutions.',
    color: '#00d4ff',
  },
  {
    icon: VerifiedIcon,
    title: 'Clinically Verified Information',
    description: 'Every piece of information is carefully curated and verified by medical professionals. Our database is built from trusted sources including Mayo Clinic, peer-reviewed journals, and clinical guidelines. Regular audits ensure accuracy, relevance, and compliance with current medical standards and best practices.',
    color: '#7c3aed',
  },
  {
    icon: TrendingIcon,
    title: 'Continuously Updated & Learning',
    description: 'Stay ahead with AI that evolves with medical science. Our system is updated weekly with the latest research findings, treatment protocols, and drug information. Machine learning algorithms continuously improve response accuracy, understanding of medical context, and ability to provide relevant, personalized recommendations.',
    color: '#ff006e',
  },
];

const stats = [
  { value: '10K+', label: 'Medical Conditions', color: '#00d4ff' },
  { value: '13', label: 'Categories', color: '#7c3aed' },
  { value: '<2s', label: 'Response Time', color: '#ff006e' },
  { value: '99.9%', label: 'Accuracy', color: '#00d4ff' },
];

const showcaseFeatures = [
  {
    title: 'AI-Powered Medical Chat',
    description: 'Engage in natural conversations with our advanced AI assistant. Ask about symptoms, conditions, treatments, and get instant, accurate medical information powered by cutting-edge AI and RAG technology.',
    image: '/LandingPageChat.png',
    icon: ChatIcon,
    color: '#00d4ff',
    link: '/chat',
  },
  {
    title: 'Smart Medical Search',
    description: 'Lightning-fast search across 10,000+ medical conditions. Filter by category, view detailed information cards, and find exactly what you need with our intelligent search algorithm.',
    image: '/LandingPageSearch.png',
    icon: SearchIcon,
    color: '#7c3aed',
    link: '/search',
  },
  {
    title: 'Comprehensive Database',
    description: 'Browse our extensive medical database with 13 specialized categories. Each condition includes symptoms, causes, risk factors, diagnosis methods, treatment options, and prevention strategies.',
    image: '/LandingPageDatabase.png',
    icon: HospitalIcon,
    color: '#ff006e',
    link: '/diseases',
  },
];

const FeatureShowcase = ({ feature, index }: { feature: typeof showcaseFeatures[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const router = useRouter();
  const IconComponent = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
          gap: 6,
          mb: 12,
          alignItems: 'center',
        }}
      >
        {/* Image Side */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
          }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: '32px',
                overflow: 'hidden',
                border: `3px solid ${alpha(feature.color, 0.4)}`,
                boxShadow: `0 20px 80px ${alpha(feature.color, 0.3)}`,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: feature.color,
                  boxShadow: `0 30px 120px ${alpha(feature.color, 0.5)}`,
                  transform: 'translateY(-8px)',
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
                  height: 'auto',
                  display: 'block',
                }}
              />
              {/* Gradient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(feature.color, 0.1)}, transparent)`,
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </motion.div>
        </Box>

        {/* Content Side */}
        <Box
          sx={{
            flex: 1,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 70,
              height: 70,
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${alpha(feature.color, 0.3)}, ${alpha(feature.color, 0.1)})`,
              border: `2px solid ${alpha(feature.color, 0.4)}`,
              mb: 3,
              boxShadow: `0 10px 40px ${alpha(feature.color, 0.3)}`,
            }}
          >
            <IconComponent
              sx={{
                fontSize: 40,
                color: feature.color,
                filter: `drop-shadow(0 0 15px ${alpha(feature.color, 0.8)})`,
              }}
            />
          </Box>

          <Typography
            variant="h3"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
              textShadow: `0 0 40px ${alpha(feature.color, 0.4)}`,
            }}
          >
            {feature.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              mb: 4,
            }}
          >
            {feature.description}
          </Typography>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              endIcon={<ArrowIcon />}
              onClick={() => router.push(feature.link)}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '16px',
                background: `linear-gradient(45deg, ${feature.color}, ${alpha(feature.color, 0.7)})`,
                border: `2px solid ${alpha(feature.color, 0.5)}`,
                boxShadow: `0 10px 30px ${alpha(feature.color, 0.4)}`,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 15px 50px ${alpha(feature.color, 0.6)}`,
                },
              }}
            >
              Try {feature.title}
            </Button>
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

export function LandingPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120, 119, 198, 0.4) 0%, transparent 60%),
          radial-gradient(ellipse 80% 80% at 80% 20%, rgba(255, 0, 110, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse 80% 80% at 40% 40%, rgba(0, 212, 255, 0.25) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 70%, #0f1419 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 120px,
              rgba(0, 212, 255, 0.03) 120px,
              rgba(0, 212, 255, 0.03) 122px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 180px,
              rgba(255, 0, 110, 0.02) 180px,
              rgba(255, 0, 110, 0.02) 182px
            )
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          style={{ opacity, scale }}
          initial={{ opacity: 0, y: 50 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              mb: 16,
              py: 8,
            }}
          >
            {/* Logo Animation */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Box
                  component="img"
                  src="/LOGO_doctor.png"
                  alt="TrustMed-AI"
                  sx={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    filter: `
                      drop-shadow(0 0 40px rgba(0, 212, 255, 0.8))
                      drop-shadow(0 0 80px rgba(255, 0, 110, 0.6))
                      brightness(1.2)
                    `,
                    border: '3px solid rgba(0, 212, 255, 0.4)',
                  }}
                />
              </motion.div>
            </Box>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3.5rem', md: '6rem' },
                  fontWeight: 900,
                  mb: 3,
                  background: 'linear-gradient(45deg, #00d4ff 0%, #ffffff 30%, #7c3aed 60%, #ff006e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 80px rgba(0, 212, 255, 0.5)',
                  letterSpacing: '-0.02em',
                }}
              >
                TrustMed-AI
              </Typography>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  fontWeight: 600,
                  textShadow: '0 0 30px rgba(0, 212, 255, 0.4)',
                }}
              >
                Your Intelligent Medical Assistant
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  maxWidth: 800,
                  mx: 'auto',
                  mb: 6,
                  lineHeight: 1.8,
                }}
              >
                Experience the future of medical information with our advanced AI-powered platform. 
                Get instant, accurate insights on 10,000+ medical conditions with clinically verified data.
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowIcon />}
                    onClick={() => router.push('/chat')}
                    sx={{
                      px: 8,
                      py: 2.5,
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      borderRadius: '20px',
                      background: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 100%)',
                      border: '2px solid rgba(0, 212, 255, 0.5)',
                      boxShadow: '0 15px 60px rgba(0, 212, 255, 0.5)',
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 20px 80px rgba(0, 212, 255, 0.7)',
                        background: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 80%, #ff006e 100%)',
                      },
                    }}
                  >
                    Start Chatting
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/search')}
                    sx={{
                      px: 6,
                      py: 2.5,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      borderRadius: '20px',
                      border: '2px solid rgba(124, 58, 237, 0.5)',
                      color: '#7c3aed',
                      background: 'rgba(124, 58, 237, 0.05)',
                      backdropFilter: 'blur(10px)',
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 10px 40px rgba(124, 58, 237, 0.4)',
                        borderColor: '#7c3aed',
                        background: 'rgba(124, 58, 237, 0.1)',
                      },
                    }}
                  >
                    Browse Conditions
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/diseases')}
                    sx={{
                      px: 6,
                      py: 2.5,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      borderRadius: '20px',
                      border: '2px solid rgba(255, 0, 110, 0.5)',
                      color: '#ff006e',
                      background: 'rgba(255, 0, 110, 0.05)',
                      backdropFilter: 'blur(10px)',
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 10px 40px rgba(255, 0, 110, 0.4)',
                        borderColor: '#ff006e',
                        background: 'rgba(255, 0, 110, 0.1)',
                      },
                    }}
                  >
                    Explore Database
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
        </motion.div>

        {/* Stats Section */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4,
            mb: 16,
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  sx={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(stat.color, 0.4)}`,
                    borderRadius: '32px',
                    textAlign: 'center',
                    p: 4,
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '100%',
                      background: `radial-gradient(circle at top, ${alpha(stat.color, 0.15)}, transparent 70%)`,
                      pointerEvents: 'none',
                    },
                    '&:hover': {
                      boxShadow: `0 25px 80px ${alpha(stat.color, 0.5)}, inset 0 0 60px ${alpha(stat.color, 0.1)}`,
                      borderColor: stat.color,
                      borderWidth: '3px',
                    },
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '3rem', md: '3.5rem' },
                      color: stat.color,
                      fontWeight: 900,
                      mb: 2,
                      textShadow: `0 0 40px ${alpha(stat.color, 0.8)}, 0 0 80px ${alpha(stat.color, 0.4)}`,
                      letterSpacing: '-0.02em',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </Box>

        {/* Feature Showcases with Screenshots */}
        <Box sx={{ mb: 16 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                color: '#ffffff',
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
              }}
            >
              Powerful Features at Your Fingertips
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 10,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Explore our comprehensive suite of medical tools designed to provide you with instant, accurate health information
            </Typography>
          </motion.div>

          {showcaseFeatures.map((feature, index) => (
            <FeatureShowcase key={index} feature={feature} index={index} />
          ))}
        </Box>

        {/* Technical Features Grid */}
        <Box sx={{ mb: 16 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                color: '#ffffff',
                fontWeight: 700,
                mb: 2,
                textShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
              }}
            >
              Why Choose TrustMed-AI?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 8,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Cutting-edge technology meets medical expertise
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <motion.div
                    whileHover={{ y: -15, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        minHeight: '400px',
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `2px solid ${alpha(feature.color, 0.25)}`,
                        borderRadius: '32px',
                        p: 4,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`,
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '200%',
                          height: '200%',
                          background: `radial-gradient(circle, ${alpha(feature.color, 0.1)}, transparent 70%)`,
                          transform: 'translate(-50%, -50%)',
                          opacity: 0,
                          transition: 'opacity 0.5s ease',
                          pointerEvents: 'none',
                        },
                        '&:hover': {
                          boxShadow: `0 35px 100px ${alpha(feature.color, 0.5)}, inset 0 0 80px ${alpha(feature.color, 0.05)}`,
                          borderColor: feature.color,
                          borderWidth: '3px',
                          '&::before': {
                            opacity: 1,
                          },
                          '&::after': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '24px',
                            background: `linear-gradient(135deg, ${alpha(feature.color, 0.3)}, ${alpha(feature.color, 0.1)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            boxShadow: `0 15px 40px ${alpha(feature.color, 0.4)}, inset 0 0 30px ${alpha(feature.color, 0.2)}`,
                            border: `2px solid ${alpha(feature.color, 0.3)}`,
                          }}
                        >
                          <IconComponent
                            sx={{
                              fontSize: 45,
                              color: feature.color,
                              filter: `drop-shadow(0 0 15px ${alpha(feature.color, 0.8)})`,
                            }}
                          />
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 700,
                            mb: 2.5,
                            fontSize: '1.5rem',
                            textShadow: `0 0 30px ${alpha(feature.color, 0.4)}`,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: 1.8,
                            fontSize: '1rem',
                            flex: 1,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </Box>
        </Box>

        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: 12,
              px: { xs: 4, md: 8 },
              background: `
                radial-gradient(circle at 50% 0%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 50% 100%, rgba(255, 0, 110, 0.12) 0%, transparent 50%),
                rgba(10, 15, 30, 0.95)
              `,
              backdropFilter: 'blur(30px)',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(124, 58, 237, 0.3), rgba(255, 0, 110, 0.4)) 1',
              borderRadius: '48px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `
                0 30px 100px rgba(0, 212, 255, 0.25),
                0 0 100px rgba(255, 0, 110, 0.15) inset
              `,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #00d4ff 20%, #7c3aed 50%, #ff006e 80%, transparent)',
                animation: 'shimmer 3s ease-in-out infinite',
                filter: 'blur(2px)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 100px,
                    rgba(0, 212, 255, 0.03) 100px,
                    rgba(0, 212, 255, 0.03) 102px
                  )
                `,
                pointerEvents: 'none',
              },
              '@keyframes shimmer': {
                '0%, 100%': { 
                  opacity: 0.3,
                  transform: 'translateX(-100%)',
                },
                '50%': { 
                  opacity: 1,
                  transform: 'translateX(100%)',
                },
              },
            }}
          >
            {/* Animated Icon Group */}
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                mb: 4,
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.4), rgba(124, 58, 237, 0.3), rgba(255, 0, 110, 0.2))
                    `,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 0 60px rgba(0, 212, 255, 0.6), 0 0 100px rgba(255, 0, 110, 0.4) inset',
                    border: '3px solid rgba(0, 212, 255, 0.5)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -10,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #00d4ff, #7c3aed, #ff006e)',
                      opacity: 0.2,
                      filter: 'blur(20px)',
                      animation: 'pulse 2s ease-in-out infinite',
                    },
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.2 },
                      '50%': { transform: 'scale(1.2)', opacity: 0.4 },
                    },
                  }}
                >
                  <SparkleIcon
                    sx={{
                      fontSize: 50,
                      color: '#00d4ff',
                      filter: 'drop-shadow(0 0 30px rgba(0, 212, 255, 1))',
                    }}
                  />
                </Box>
              </motion.div>

              {/* Orbiting Particles */}
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: index * 0.5,
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 120 + index * 30,
                    height: 120 + index * 30,
                    marginLeft: -(60 + index * 15),
                    marginTop: -(60 + index * 15),
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: index === 0 ? '#00d4ff' : index === 1 ? '#7c3aed' : '#ff006e',
                      boxShadow: `0 0 20px ${index === 0 ? '#00d4ff' : index === 1 ? '#7c3aed' : '#ff006e'}`,
                    }}
                  />
                </motion.div>
              ))}
            </Box>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(135deg, #00d4ff 0%, #ffffff 40%, #7c3aed 70%, #ff006e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 60px rgba(0, 212, 255, 0.5)',
                  letterSpacing: '-0.02em',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Ready to Get Started?
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  mb: 6,
                  maxWidth: 650,
                  mx: 'auto',
                  lineHeight: 1.7,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 400,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Join thousands of users who trust TrustMed-AI for accurate, instant medical information
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={() => router.push('/chat')}
                sx={{
                  px: 10,
                  py: 3,
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #ff006e 100%)',
                  border: '3px solid rgba(0, 212, 255, 0.6)',
                  boxShadow: `
                    0 20px 80px rgba(0, 212, 255, 0.6),
                    0 0 60px rgba(255, 0, 110, 0.4) inset
                  `,
                  textTransform: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.6s ease',
                  },
                  '&:hover': {
                    boxShadow: `
                      0 25px 100px rgba(0, 212, 255, 0.8),
                      0 0 80px rgba(255, 0, 110, 0.6) inset
                    `,
                    borderColor: '#00d4ff',
                    transform: 'translateY(-4px)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Launch TrustMed-AI
              </Button>
            </motion.div>

            {/* Bottom Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Box
                sx={{
                  mt: 6,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { icon: '⚡', text: 'Instant Answers' },
                  { icon: '🔒', text: 'Secure & Private' },
                  { icon: '✓', text: 'Clinically Verified' },
                ].map((badge, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 3,
                      py: 1.5,
                      borderRadius: '16px',
                      background: 'rgba(0, 212, 255, 0.1)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Typography sx={{ fontSize: '1.2rem' }}>{badge.icon}</Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}
                    >
                      {badge.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
