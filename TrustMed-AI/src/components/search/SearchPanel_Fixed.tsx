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
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Skeleton,
  InputAdornment,
  Fade,
  Paper,
  Container,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalHospital as HospitalIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { apiService } from '../../lib/api';

const RESULTS_PER_PAGE = 8;

const quickSearchTerms = [
  'headache', 'diabetes', 'hypertension', 'asthma', 'arthritis',
  'depression', 'anxiety', 'migraine', 'allergies', 'flu'
];

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchStats, setSearchStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Load categories on component mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiService.getDiseaseCategories();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim() || query.trim().length < 2) {
        return { diseases: [], total_diseases: 0, search_time_ms: 0, query: '' };
      }
      return apiService.searchDiseases(query.trim(), 50);
    },
    onSuccess: (data) => {
      setResults(data.diseases || []);
      setCurrentPage(1); // Reset pagination on new search
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

  // Debounced search function
  const [searchTimeout, setSearchTimeout] = React.useState<NodeJS.Timeout | null>(null);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Clear results immediately if query is too short
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearchStats(null);
      return;
    }
    
    // Debounce the search
    const newTimeout = setTimeout(() => {
      searchMutation.mutate(query);
    }, 300);
    
    setSearchTimeout(newTimeout);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      cardiovascular: '#e74c3c',
      endocrine: '#3498db', 
      oncology: '#9b59b6',
      respiratory: '#1abc9c',
      neurological: '#f39c12',
      mental_health: '#2ecc71',
      infectious: '#e67e22',
      gynecological: '#e91e63',
      urological: '#8e44ad',
      dermatological: '#16a085',
      musculoskeletal: '#d35400',
      ophthalmological: '#7f8c8d',
      general: '#95a5a6'
    };
    return colors[category] || '#bdc3c7';
  };

  const handleSearchButton = () => {
    if (!searchQuery.trim()) return;
    searchMutation.mutate(searchQuery);
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    setSelectedCategory('');
    handleSearch(term);
  };

  const handleCategorySearch = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    searchMutation.mutate(categoryName);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setResults([]);
    setSearchStats(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchButton();
    }
  };

  const handleViewDisease = (id: number) => {
    router.push(`/diseases/${id}`);
  };

  const handleChatAbout = (condition: string) => {
    const queryText = `Tell me about ${condition}`;
    router.push(`/chat?q=${encodeURIComponent(queryText)}`);
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', py: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Height Main Search Section */}
      <Box
        sx={{
          flexShrink: 0,
          height: '400px', // Fixed height
          borderRadius: '24px 24px 0 0',
          background: `
            linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 70%, #0f1419 100%)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Main Content - Fixed Height */}
        <Box sx={{ px: 3, py: 4, height: '100%', overflowY: 'auto' }}>
          <Box
            sx={{
              maxWidth: 1000,
              mx: 'auto',
              background: 'rgba(17, 25, 40, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              borderRadius: '24px',
              p: { xs: 3, md: 4 },
              position: 'relative',
            }}
          >
            {/* Header Section with Chat Interface Style */}
            <Box
              sx={{
                background: `linear-gradient(135deg, rgba(0, 212, 255, 0.8) 0%, rgba(124, 58, 237, 0.8) 50%, rgba(255, 0, 110, 0.8) 100%)`,
                p: 2,
                color: 'white',
                position: 'relative',
                borderRadius: '16px',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box
                  component="img"
                  src="/searchicon.png"
                  alt="TrustMed-AI Search"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 255, 255, 0.6))',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                  TrustMed-AI Search Engine
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                🔬 Advanced medical search • 10,000+ conditions • AI-powered results
              </Typography>
            </Box>

            {/* Search Input */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search medical conditions, symptoms, diseases... (min 2 characters)"
                variant="outlined"
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        component="img"
                        src="/searchicon.png"
                        alt="Search"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))',
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: searchMutation.isPending ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} sx={{ color: '#00d4ff' }} />
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '12px',
                    '&:hover': {
                      borderColor: 'rgba(0, 212, 255, 0.5)',
                    },
                    '&.Mui-focused': {
                      borderColor: '#00d4ff',
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearchButton}
                disabled={!searchQuery.trim() || searchMutation.isPending}
                size="medium"
                sx={{
                  mt: 2,
                  px: 4,
                  py: 1,
                  borderRadius: '12px',
                  background: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 50%, #ff006e 100%)',
                  fontWeight: 600,
                  '&:hover': {
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                  },
                }}
              >
                {searchMutation.isPending ? <CircularProgress size={20} /> : 'SEARCH'}
              </Button>
            </Box>

            {/* Quick Search Terms */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#00d4ff', fontWeight: 600 }}>
                Quick Access:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {quickSearchTerms.slice(0, 6).map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    onClick={() => handleQuickSearch(term)}
                    size="small"
                    sx={{
                      cursor: 'pointer',
                      background: 'rgba(0, 212, 255, 0.1)',
                      color: '#00d4ff',
                      fontSize: '0.75rem',
                      '&:hover': {
                        background: 'rgba(0, 212, 255, 0.2)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Scrollable Results Section */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          background: 'rgba(10, 10, 15, 0.9)',
          borderRadius: '0 0 24px 24px',
          border: '1px solid rgba(0, 212, 255, 0.1)',
          borderTop: 'none',
        }}
      >
        {/* Search Results Content */}
        {results.length > 0 && (
          <Box sx={{ p: 3 }}>
            {/* Results Header */}
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                sx={{
                  color: '#00d4ff',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Search Results
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 1,
                }}
              >
                {results.length} conditions found
              </Typography>
            </Box>

            {/* Results Grid */}
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  sm: 'repeat(auto-fit, minmax(280px, 1fr))' 
                }, 
                gap: 2,
                mb: 2
              }}
            >
              {results
                .slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE)
                .map((disease, index) => (
                  <Card
                    key={`${disease.name}-${index}`}
                    sx={{
                      background: 'rgba(17, 25, 40, 0.8)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(0, 212, 255, 0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'rgba(0, 212, 255, 0.4)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(0, 212, 255, 0.2)',
                      },
                    }}
                    onClick={() => handleViewDisease(disease.id || index)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Disease Header */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                        <HospitalIcon 
                          sx={{ 
                            fontSize: 16,
                            color: '#00d4ff',
                            mt: 0.2,
                            flexShrink: 0,
                          }} 
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{
                              color: '#ffffff',
                              fontWeight: 600,
                              lineHeight: 1.2,
                              fontSize: '0.9rem',
                            }}
                          >
                            {disease.name}
                          </Typography>
                          
                          {/* Category Badge */}
                          {disease.category && (
                            <Chip
                              label={disease.category.replace('_', ' ')}
                              size="small"
                              sx={{
                                mt: 0.5,
                                height: '18px',
                                fontSize: '0.6rem',
                                background: `${getCategoryColor(disease.category)}20`,
                                color: getCategoryColor(disease.category),
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDisease(disease.id || index);
                          }}
                          sx={{ 
                            flex: 1,
                            borderColor: 'rgba(0, 212, 255, 0.3)',
                            color: '#00d4ff',
                            fontSize: '0.65rem',
                            py: 0.3,
                            minHeight: '24px',
                            '&:hover': {
                              borderColor: '#00d4ff',
                              background: 'rgba(0, 212, 255, 0.1)',
                            },
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatAbout(disease.name);
                          }}
                          sx={{ 
                            flex: 1,
                            background: 'linear-gradient(45deg, #ff006e 0%, #7c3aed 100%)',
                            fontSize: '0.65rem',
                            py: 0.3,
                            minHeight: '24px',
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(255, 0, 110, 0.4)',
                            },
                          }}
                        >
                          Ask AI
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
              ))}
            </Box>

            {/* Pagination Footer */}
            {results.length > RESULTS_PER_PAGE && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                pt: 2,
                borderTop: '1px solid rgba(0, 212, 255, 0.1)',
              }}>
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  size="small"
                  sx={{
                    minWidth: '32px',
                    color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#00d4ff',
                    fontSize: '14px',
                  }}
                >
                  ‹
                </Button>
                
                <Typography sx={{ 
                  color: '#ffffff', 
                  fontSize: '0.8rem',
                  px: 2
                }}>
                  {currentPage} / {Math.ceil(results.length / RESULTS_PER_PAGE)}
                </Typography>
                
                <Button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(results.length / RESULTS_PER_PAGE), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(results.length / RESULTS_PER_PAGE)}
                  size="small"
                  sx={{
                    minWidth: '32px',
                    color: currentPage >= Math.ceil(results.length / RESULTS_PER_PAGE) ? 'rgba(255,255,255,0.3)' : '#00d4ff',
                    fontSize: '14px',
                  }}
                >
                  ›
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* No Results Message */}
        {searchMutation.isSuccess && results.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
            <Typography variant="body2">No results found. Try different keywords.</Typography>
          </Box>
        )}

        {/* Welcome Message */}
        {!searchMutation.isPending && !searchMutation.isSuccess && !searchMutation.isError && (
          <Box sx={{ p: 4, textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
            <SearchIcon sx={{ fontSize: 48, color: '#00d4ff', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#00d4ff', mb: 1 }}>
              TrustMed-AI Search Ready
            </Typography>
            <Typography variant="body2">
              Enter a medical condition or symptom above to begin searching
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}