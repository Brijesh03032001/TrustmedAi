'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  InputAdornment,
  Fade,
  Container,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalHospital as HospitalIcon,
  Visibility as VisibilityIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { apiService } from '../../lib/api';

const RESULTS_PER_PAGE = 9;

const quickSearchTerms = [
  { term: 'Diabetes', icon: '🩸' },
  { term: 'Hypertension', icon: '❤️' },
  { term: 'Asthma', icon: '🫁' },
  { term: 'Migraine', icon: '🧠' },
  { term: 'Arthritis', icon: '🦴' },
  { term: 'Depression', icon: '💭' },
];

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim() || query.trim().length < 2) {
        return { diseases: [], total_diseases: 0, search_time_ms: 0, query: '' };
      }
      return apiService.searchDiseases(query.trim(), 100);
    },
    onSuccess: (data) => {
      setResults(data.diseases || []);
      setCurrentPage(1);
      setSearchStats({
        total: data.total_diseases || data.diseases?.length || 0,
        searchTime: data.search_time_ms || 0,
        query: data.query || searchQuery
      });
    },
    onError: (error) => {
      console.error('Search failed:', error);
      setResults([]);
      setSearchStats(null);
    },
  });

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearchStats(null);
      return;
    }
    
    const newTimeout = setTimeout(() => {
      searchMutation.mutate(query);
    }, 400);
    
    setSearchTimeout(newTimeout);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      cardiovascular: '#ef4444',
      endocrine: '#3b82f6', 
      oncology: '#a855f7',
      respiratory: '#14b8a6',
      neurological: '#f59e0b',
      mental_health: '#10b981',
      infectious: '#f97316',
      gynecological: '#ec4899',
      urological: '#8b5cf6',
      dermatological: '#06b6d4',
      musculoskeletal: '#f43f5e',
      ophthalmological: '#6366f1',
      general: '#64748b'
    };
    return colors[category] || '#64748b';
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    searchMutation.mutate(term);
  };

  const handleViewDisease = (id: number) => {
    router.push(`/diseases/${id}`);
  };

  const handleChatAbout = (condition: string) => {
    const queryText = `Tell me about ${condition}`;
    router.push(`/chat?q=${encodeURIComponent(queryText)}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setSearchStats(null);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const paginatedResults = results.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  return (
    <Container maxWidth="lg" sx={{ height: '100%', py: 0 }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          background: `
            radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120, 119, 198, 0.4) 0%, transparent 60%),
            radial-gradient(ellipse 80% 80% at 80% 20%, rgba(255, 0, 110, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 80% 80% at 40% 40%, rgba(0, 212, 255, 0.25) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 70%, #0f1419 100%)
          `,
          position: 'relative',
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
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 0, 110, 0.03) 0%, transparent 50%)
            `,
            opacity: 0.6,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Header Section - Fixed */}
        <Box
          sx={{
            flexShrink: 0,
            background: `
              linear-gradient(135deg, rgba(0, 212, 255, 0.8) 0%, rgba(124, 58, 237, 0.8) 50%, rgba(255, 0, 110, 0.8) 100%),
              linear-gradient(45deg, rgba(17, 25, 40, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)
            `,
            backgroundBlendMode: 'overlay',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #00d4ff 0%, #7c3aed 50%, #ff006e 100%)',
              animation: 'headerGlow 2s ease-in-out infinite alternate',
            },
            '@keyframes headerGlow': {
              '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' },
              '100%': { boxShadow: '0 0 40px rgba(255, 0, 110, 0.5)' },
            },
          }}
        >
        <Box sx={{ position: 'relative', zIndex: 1, px: 4, py: 3 }}>
          {/* Logo & Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
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
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                  fontWeight: 500,
                }}
              >
                <SparkleIcon sx={{ fontSize: 16 }} />
                Advanced Medical Intelligence • 10,000+ Conditions
              </Typography>
            </Box>
          </Box>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative' }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search medical conditions, symptoms, diseases..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon 
                      sx={{ 
                        color: '#00d4ff',
                        fontSize: 28,
                        filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))',
                        animation: 'inputIconGlow 2s ease-in-out infinite',
                        '@keyframes inputIconGlow': {
                          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))' },
                          '50%': { filter: 'drop-shadow(0 0 12px rgba(0, 212, 255, 0.8))' },
                        },
                      }} 
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchMutation.isPending ? (
                      <CircularProgress size={24} sx={{ color: '#00d4ff' }} />
                    ) : searchQuery ? (
                      <IconButton size="small" onClick={clearSearch}>
                        <CloseIcon sx={{ color: '#ff006e' }} />
                      </IconButton>
                    ) : null}
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(17, 25, 40, 0.8)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  py: 0.5,
                  '& fieldset': {
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00d4ff',
                    boxShadow: '0 0 25px rgba(0, 212, 255, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00d4ff',
                    borderWidth: '2px',
                    boxShadow: '0 0 35px rgba(0, 212, 255, 0.5)',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#ffffff',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1rem',
                  },
                },
              }}
            />
          </Box>

          {/* Quick Search Chips */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5, 
              justifyContent: 'center',
              mt: 2.5,
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#00d4ff',
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 700,
                textShadow: '0 0 15px rgba(0, 212, 255, 0.5)',
              }}
            >
              <TrendingIcon sx={{ fontSize: 16 }} /> Popular:
            </Typography>
            {quickSearchTerms.map(({ term, icon }) => (
              <Chip
                key={term}
                label={`${icon} ${term}`}
                onClick={() => handleQuickSearch(term)}
                sx={{
                  backgroundColor: 'rgba(0, 212, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(0, 212, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.25)',
                    borderColor: '#00d4ff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
        </Box>

        {/* Results Section - Scrollable */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 4,
            py: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 212, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(0, 212, 255, 0.5)',
            },
          },
        }}
      >
        {/* Search Results */}
        {results.length > 0 && (
          <Fade in timeout={500}>
            <Box>
              {/* Results Header */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#00d4ff',
                    fontWeight: 700,
                    mb: 0.5,
                    textShadow: '0 0 25px rgba(0, 212, 255, 0.6)',
                  }}
                >
                  Search Results
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Found <strong style={{ color: '#ff006e' }}>{results.length}</strong> medical conditions
                </Typography>
              </Box>

              {/* Results Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                  maxWidth: 1400,
                  mx: 'auto',
                }}
              >
                {paginatedResults.map((disease, index) => (
                  <Card
                    key={`${disease.name}-${index}`}
                    sx={{
                      background: 'rgba(17, 25, 40, 0.9)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '24px',
                      border: '1px solid rgba(0, 212, 255, 0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(255, 255, 255, 0.05),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      `,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, transparent, ${getCategoryColor(disease.category)}60, transparent)`,
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '24px',
                        background: `linear-gradient(135deg, ${getCategoryColor(disease.category)}08, transparent 50%, rgba(255, 0, 110, 0.05))`,
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                        zIndex: 0,
                      },
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        borderColor: getCategoryColor(disease.category),
                        boxShadow: [
                          '0 24px 80px rgba(0, 0, 0, 0.6)',
                          `0 0 60px ${getCategoryColor(disease.category)}40`,
                          '0 0 120px rgba(0, 212, 255, 0.2)',
                          'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        ].join(', '),
                        '&::before': {
                          opacity: 1,
                        },
                        '&::after': {
                          opacity: 1,
                        },
                        '& .action-buttons': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                    onClick={() => handleViewDisease(disease.id || index)}
                  >
                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      {/* Disease Icon & Name */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                          <HospitalIcon 
                            sx={{ 
                              fontSize: 22,
                              color: '#00d4ff',
                              filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))',
                              mt: 0.5,
                            }} 
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              lineHeight: 1.3,
                              flex: 1,
                              textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {disease.name}
                          </Typography>
                        </Box>

                        {/* Category Badge */}
                        <Chip
                          label={disease.category?.replace('_', ' ').toUpperCase() || 'GENERAL'}
                          size="small"
                          sx={{
                            background: `linear-gradient(45deg, ${getCategoryColor(disease.category)}40, ${getCategoryColor(disease.category)}20)`,
                            border: `1px solid ${getCategoryColor(disease.category)}60`,
                            color: getCategoryColor(disease.category),
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            backdropFilter: 'blur(10px)',
                            boxShadow: `0 0 15px ${getCategoryColor(disease.category)}30`,
                          }}
                        />
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.4,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '48px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {disease.description || 'Click to learn more about this medical condition from our comprehensive database.'}
                      </Typography>

                      {/* Action Buttons */}
                      <Box
                        className="action-buttons"
                        sx={{
                          display: 'flex',
                          gap: 1.5,
                          opacity: 0.8,
                          transform: 'translateY(4px)',
                          transition: 'all 0.3s ease',
                          pt: 2,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDisease(disease.id || index);
                          }}
                          sx={{
                            flex: 1,
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 212, 255, 0.4)',
                            color: '#00d4ff',
                            background: 'rgba(0, 212, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            py: 1,
                            '&:hover': {
                              background: 'rgba(0, 212, 255, 0.15)',
                              borderColor: '#00d4ff',
                              boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          LEARN
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ChatIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatAbout(disease.name);
                          }}
                          sx={{
                            flex: 1,
                            borderRadius: '12px',
                            background: 'linear-gradient(45deg, #ff006e 0%, #7c3aed 100%)',
                            border: '1px solid rgba(255, 0, 110, 0.4)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            py: 1,
                            '&:hover': {
                              boxShadow: '0 0 25px rgba(255, 0, 110, 0.5)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          ASK AI
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    mt: 4,
                  }}
                >
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outlined"
                    sx={{
                      minWidth: '100px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 212, 255, 0.4)',
                      color: '#00d4ff',
                      background: 'rgba(0, 212, 255, 0.05)',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'rgba(0, 212, 255, 0.15)',
                        borderColor: '#00d4ff',
                        boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                      },
                      '&:disabled': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.3)',
                        background: 'transparent',
                      },
                    }}
                  >
                    Previous
                  </Button>

                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontWeight: 600,
                      px: 2,
                      textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                    }}
                  >
                    Page {currentPage} of {totalPages}
                  </Typography>

                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    variant="contained"
                    sx={{
                      minWidth: '100px',
                      borderRadius: '12px',
                      background: 'linear-gradient(45deg, #ff006e 0%, #7c3aed 100%)',
                      border: '1px solid rgba(255, 0, 110, 0.4)',
                      fontWeight: 600,
                      '&:hover': {
                        boxShadow: '0 0 30px rgba(255, 0, 110, 0.5)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Next
                  </Button>
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {/* No Results */}
        {searchMutation.isSuccess && results.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <SearchIcon
              sx={{
                fontSize: 80,
                color: '#00d4ff',
                mb: 2,
                filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.5))',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: '#ffffff',
                mb: 1,
                fontWeight: 700,
                textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
              }}
            >
              No Results Found
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              We couldn't find any conditions matching your search. Try different keywords or browse our popular searches above.
            </Typography>
          </Box>
        )}

        {/* Welcome State */}
        {!searchMutation.isPending && !searchMutation.isSuccess && !searchMutation.isError && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Box
              component="img"
              src="/searchicon.png"
              alt="Search"
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 3,
                filter: `
                  drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))
                  drop-shadow(0 0 40px rgba(255, 0, 110, 0.4))
                  brightness(1.2)
                  contrast(1.1)
                `,
                animation: 'searchIconFloat 3s ease-in-out infinite',
                '@keyframes searchIconFloat': {
                  '0%, 100%': { 
                    transform: 'translateY(0) scale(1)',
                    filter: `
                      drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))
                      drop-shadow(0 0 40px rgba(255, 0, 110, 0.4))
                      brightness(1.2)
                      contrast(1.1)
                    `,
                  },
                  '50%': { 
                    transform: 'translateY(-10px) scale(1.05)',
                    filter: `
                      drop-shadow(0 0 30px rgba(0, 212, 255, 0.8))
                      drop-shadow(0 0 60px rgba(255, 0, 110, 0.6))
                      brightness(1.3)
                      contrast(1.15)
                    `,
                  },
                },
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: '#ffffff',
                mb: 2,
                fontWeight: 700,
                textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
              }}
            >
              Start Your Medical Search
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.7,
                mb: 6,
              }}
            >
              Enter a medical condition, symptom, or disease name in the search bar above to access our comprehensive medical database.
            </Typography>

            {/* Feature Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 3,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  p: 4,
                  background: 'rgba(17, 25, 40, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 212, 255, 0.25)',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0, 212, 255, 0.3)',
                    borderColor: '#00d4ff',
                  },
                }}
              >
                <Typography 
                  variant="h2" 
                  sx={{ 
                    mb: 2, 
                    color: '#00d4ff', 
                    textShadow: '0 0 30px rgba(0, 212, 255, 0.6)',
                    fontWeight: 700,
                  }}
                >
                  10K+
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Medical Conditions
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.85rem',
                  }}
                >
                  Comprehensive database coverage
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 4,
                  background: 'rgba(17, 25, 40, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(124, 58, 237, 0.3)',
                    borderColor: '#7c3aed',
                  },
                }}
              >
                <Typography 
                  variant="h2" 
                  sx={{ 
                    mb: 2, 
                    color: '#7c3aed', 
                    textShadow: '0 0 30px rgba(124, 58, 237, 0.6)',
                    fontWeight: 700,
                  }}
                >
                  13
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Medical Categories
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.85rem',
                  }}
                >
                  Organized by specialty
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        </Box>
      </Box>
    </Container>
  );
}
