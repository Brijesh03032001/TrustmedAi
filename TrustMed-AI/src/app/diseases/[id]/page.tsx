'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalHospital as HospitalIcon,
  Chat as ChatIcon,
  Link as LinkIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MedicalServices as MedicalIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

interface SectionCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

function SectionCard({ title, content, icon, accentColor, bgColor, borderColor }: SectionCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: '#ffffff',
        border: `1px solid ${borderColor}`,
        borderRadius: '14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '100%',
          background: accentColor,
          borderRadius: '14px 0 0 14px',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>
          {title}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ color: '#334155', lineHeight: 1.75, fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}
      >
        {content}
      </Typography>
    </Paper>
  );
}

export default function DiseaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const diseaseId = parseInt(params.id as string);

  const { data: disease, isLoading, isError } = useQuery({
    queryKey: ['disease', diseaseId],
    queryFn: () => apiService.getDiseaseDetail(diseaseId),
    enabled: !!diseaseId && !isNaN(diseaseId),
    retry: 1,
  });

  const handleBack = () => router.push('/diseases');
  const handleChatAbout = () => {
    if (disease) {
      router.push(`/chat?q=${encodeURIComponent(`Tell me about ${disease.disease_name}`)}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#2563eb', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Loading disease information...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isError || !disease) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          <Typography variant="subtitle2" gutterBottom>Disease Not Found</Typography>
          <Typography variant="body2">The disease with ID {diseaseId} could not be found.</Typography>
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          sx={{ borderRadius: '10px' }}
        >
          Back to Database
        </Button>
      </Box>
    );
  }

  const sections = [
    disease.overview && {
      title: 'Overview',
      content: disease.overview,
      icon: <InfoIcon sx={{ fontSize: 16, color: '#2563eb' }} />,
      accentColor: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
    },
    disease.symptoms && {
      title: 'Symptoms',
      content: disease.symptoms,
      icon: <WarningIcon sx={{ fontSize: 16, color: '#dc2626' }} />,
      accentColor: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
    },
    disease.causes && {
      title: 'Causes',
      content: disease.causes,
      icon: <MedicalIcon sx={{ fontSize: 16, color: '#7c3aed' }} />,
      accentColor: '#7c3aed',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe',
    },
    disease.risk_factors && {
      title: 'Risk Factors',
      content: disease.risk_factors,
      icon: <WarningAmberIcon sx={{ fontSize: 16, color: '#d97706' }} />,
      accentColor: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#fde68a',
    },
    disease.complications && {
      title: 'Complications',
      content: disease.complications,
      icon: <ErrorIcon sx={{ fontSize: 16, color: '#dc2626' }} />,
      accentColor: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
    },
  ].filter(Boolean) as SectionCardProps[];

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2.5 }}>
        <Link
          onClick={handleBack}
          sx={{
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '0.82rem',
            textDecoration: 'none',
            '&:hover': { color: '#2563eb' },
          }}
        >
          Disease Database
        </Link>
        <Typography sx={{ color: '#0f172a', fontSize: '0.82rem', fontWeight: 500 }}>
          {disease.disease_name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Card
        sx={{
          mb: 3,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #2563eb, #7c3aed, #dc2626)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HospitalIcon sx={{ fontSize: 24, color: '#2563eb' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#0f172a',
                  fontWeight: 800,
                  mb: 1.5,
                  lineHeight: 1.2,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                {disease.disease_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.78rem',
                    '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                  }}
                >
                  Back
                </Button>
                <Button
                  startIcon={<ChatIcon />}
                  onClick={handleChatAbout}
                  size="small"
                  variant="contained"
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#2563eb',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' },
                  }}
                >
                  Ask AI About This
                </Button>
                {disease.source_url && (
                  <Button
                    startIcon={<LinkIcon />}
                    onClick={() => window.open(disease.source_url, '_blank')}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      color: '#d97706',
                      fontSize: '0.78rem',
                      '&:hover': { bgcolor: '#fffbeb', borderColor: '#fbbf24' },
                    }}
                  >
                    Source
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map((section) => (
          <SectionCard key={section.title} {...section} />
        ))}
      </Box>

      {/* Disclaimer */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: '12px',
          bgcolor: '#fffbeb',
          border: '1px solid #fde68a',
          display: 'flex',
          gap: 1.25,
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 16, color: '#d97706', flexShrink: 0, mt: 0.1 }} />
        <Typography variant="caption" sx={{ color: '#92400e', lineHeight: 1.6, fontSize: '0.77rem' }}>
          This information is for educational purposes only and is not a substitute for professional medical advice,
          diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions. In case of
          emergency, call 911 immediately.
        </Typography>
      </Box>
    </Box>
  );
}
