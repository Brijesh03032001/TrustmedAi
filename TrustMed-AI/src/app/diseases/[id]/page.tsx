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
  Container,
  Breadcrumbs,
  Link,
  Divider,
  Paper,
  Grid,
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
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { DiseaseDetail } from '@/types';

export default function DiseaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const diseaseId = parseInt(params.id as string);

  const { data: disease, isLoading, isError, error } = useQuery({
    queryKey: ['disease', diseaseId],
    queryFn: () => apiService.getDiseaseDetail(diseaseId),
    enabled: !!diseaseId && !isNaN(diseaseId),
  });

  const handleBack = () => {
    router.push('/diseases');
  };

  const handleChatAbout = () => {
    if (disease) {
      router.push(`/chat?q=${encodeURIComponent(`Tell me about ${disease.disease_name}`)}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress 
              size={60} 
              sx={{ 
                color: '#00d4ff',
                '& circle': {
                  strokeLinecap: 'round',
                },
                mb: 3,
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{
                color: '#00d4ff',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                fontWeight: 600,
              }}
            >
              Loading Disease Information...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (isError || !disease) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ 
            mb: 4,
            background: 'rgba(220, 38, 127, 0.1)',
            border: '1px solid rgba(220, 38, 127, 0.3)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            color: '#ff006e',
            '& .MuiAlert-icon': {
              color: '#ff006e',
              filter: 'drop-shadow(0 0 10px rgba(255, 0, 110, 0.5))',
            },
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Disease Not Found
          </Typography>
          <Typography variant="body2">
            The disease with ID {diseaseId} could not be found or there was an error loading the information.
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ 
              mt: 2,
              color: '#ff006e',
              borderColor: '#ff006e',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 110, 0.1)',
              },
            }}
            variant="outlined"
          >
            Back to Disease Database
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        sx={{ 
          mb: 3,
          '& .MuiLink-root': {
            color: '#00d4ff',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
            },
          },
          '& .MuiTypography-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        }}
      >
        <Link onClick={handleBack} sx={{ cursor: 'pointer' }}>
          Disease Database
        </Link>
        <Typography color="text.primary">{disease.disease_name}</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Card 
        sx={{
          mb: 4,
          background: 'rgba(17, 25, 40, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00d4ff 0%, #ff006e 50%, #7c3aed 100%)',
            borderRadius: '20px 20px 0 0',
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 64,
              height: 64,
              background: 'rgba(0, 212, 255, 0.1)',
              borderRadius: '16px',
              border: '2px solid rgba(0, 212, 255, 0.3)',
            }}>
              <HospitalIcon sx={{ 
                fontSize: 32, 
                color: '#00d4ff',
                filter: 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.6))',
              }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                sx={{
                  color: '#ffffff',
                  textShadow: '0 0 25px rgba(0, 212, 255, 0.4)',
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                {disease.disease_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Chip
                  label={`ID: ${disease.id}`}
                  sx={{
                    background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.2), rgba(255, 0, 110, 0.2))',
                    border: '1px solid rgba(0, 212, 255, 0.4)',
                    color: '#00d4ff',
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label={`Added: ${formatDate(disease.created_at)}`}
                  sx={{
                    background: 'rgba(124, 58, 237, 0.2)',
                    border: '1px solid rgba(124, 58, 237, 0.4)',
                    color: '#7c3aed',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      borderColor: '#00d4ff',
                      color: '#00d4ff',
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                    },
                  }}
                >
                  Back to Database
                </Button>
                <Button
                  startIcon={<ChatIcon />}
                  onClick={handleChatAbout}
                  variant="contained"
                  sx={{
                    borderRadius: '12px',
                    background: 'linear-gradient(45deg, #ff006e 0%, #7c3aed 100%)',
                    fontWeight: 700,
                    '&:hover': {
                      boxShadow: '0 0 25px rgba(255, 0, 110, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Ask AI About This
                </Button>
                {disease.source_url && (
                  <Button
                    startIcon={<LinkIcon />}
                    onClick={() => window.open(disease.source_url, '_blank')}
                    variant="outlined"
                    sx={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 165, 0, 0.4)',
                      color: '#ffa500',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        borderColor: '#ffa500',
                      },
                    }}
                  >
                    View Source
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Overview */}
        {disease.overview && (
          <Box>
            <Paper 
              sx={{
                p: 3,
                background: 'rgba(17, 25, 40, 0.8)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '16px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <InfoIcon sx={{ color: '#00d4ff' }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
                  Overview
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.7,
                  fontSize: '1.1rem',
                }}
              >
                {disease.overview}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Symptoms */}
        {disease.symptoms && (
          <Box>
            <Paper 
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(17, 25, 40, 0.8)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 0, 110, 0.2)',
                borderRadius: '16px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <WarningIcon sx={{ color: '#ff006e' }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
                  Symptoms
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                }}
              >
                {disease.symptoms}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Causes */}
        {disease.causes && (
          <Box>
            <Paper 
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(17, 25, 40, 0.8)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                borderRadius: '16px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <MedicalIcon sx={{ color: '#7c3aed' }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
                  Causes
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                }}
              >
                {disease.causes}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Risk Factors */}
        {disease.risk_factors && (
          <Box>
            <Paper 
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(17, 25, 40, 0.8)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 165, 0, 0.2)',
                borderRadius: '16px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <WarningIcon sx={{ color: '#ffa500' }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
                  Risk Factors
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                }}
              >
                {disease.risk_factors}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Complications */}
        {disease.complications && (
          <Box>
            <Paper 
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(17, 25, 40, 0.8)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(220, 38, 127, 0.2)',
                borderRadius: '16px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <ErrorIcon sx={{ color: '#dc2626' }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
                  Complications
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                }}
              >
                {disease.complications}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
}