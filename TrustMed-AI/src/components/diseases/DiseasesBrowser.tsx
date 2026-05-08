'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Skeleton,
  Chip,
  Pagination,
  Paper,
  alpha,
  Container,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalHospital as HospitalIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { apiService } from '../../lib/api';

const ITEMS_PER_PAGE = 12;

export function DiseasesBrowser() {
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allDiseases, setAllDiseases] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  // Load diseases and categories
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [diseasesData, categoriesData] = await Promise.all([
          apiService.searchDiseases('', 500), // Load more diseases
          apiService.getDiseaseCategories()
        ]);
        setAllDiseases(diseasesData.diseases || []);
        setCategories(categoriesData.categories || []);
        setIsError(false);
        setError(null);
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsError(true);
        setError(error instanceof Error ? error : new Error('Failed to load data'));
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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

  // Filter diseases based on search and category
  const filteredDiseases = allDiseases.filter((disease) => {
    const searchTerm = searchFilter.trim().toLowerCase();
    const matchesSearch = !searchTerm || 
      disease.name.toLowerCase().includes(searchTerm) ||
      (disease.description && disease.description.toLowerCase().includes(searchTerm)) ||
      (disease.category && disease.category.toLowerCase().includes(searchTerm));
    const matchesCategory = !selectedCategory || disease.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Paginate results
  const totalPages = Math.ceil(filteredDiseases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDiseases = filteredDiseases.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleViewDisease = (id: number) => {
    router.push(`/diseases/${id}`);
  };

  const handleChatAbout = (name: string) => {
    router.push(`/chat?q=${encodeURIComponent(`Tell me about ${name}`)}`);
  };

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Failed to load diseases: {error?.message || 'Unknown error'}
      </Alert>
    );
  }

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
        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 4,
            px: { xs: 2, md: 3 },
          }}
        >
          {/* Premium Glass Container */}
          <Box
            sx={{
              maxWidth: 1400,
          mx: 'auto',
          background: 'rgba(17, 25, 40, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.15)',
          borderRadius: '32px',
          p: { xs: 3, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
          boxShadow: `
            0 32px 80px rgba(0, 0, 0, 0.6),
            0 0 80px rgba(0, 212, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.03) 0%, transparent 50%, rgba(255, 0, 110, 0.02) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
    <Box>
      {/* Header Section with Chat Interface Style */}
      <Box
        sx={{
          background: `
            linear-gradient(135deg, rgba(0, 212, 255, 0.8) 0%, rgba(124, 58, 237, 0.8) 50%, rgba(255, 0, 110, 0.8) 100%),
            linear-gradient(45deg, rgba(17, 25, 40, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)
          `,
          backgroundBlendMode: 'overlay',
          p: 3,
          color: 'white',
          position: 'relative',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Box
            component="img"
            src="/DatabaseIcon.png"
            alt="TrustMed-AI Database"
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              filter: `
                drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))
                drop-shadow(0 0 30px rgba(0, 212, 255, 0.4))
                brightness(1.2)
                contrast(1.1)
              `,
              border: '2px solid rgba(0, 212, 255, 0.4)',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
              position: 'relative',
              animation: 'avatarGlow 3s ease-in-out infinite',
              '@keyframes avatarGlow': {
                '0%, 100%': { 
                  boxShadow: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.3)' 
                },
                '50%': { 
                  boxShadow: '0 0 40px rgba(0, 212, 255, 0.7), 0 0 80px rgba(0, 212, 255, 0.4)' 
                },
              },
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h4" 
              fontWeight="black" 
              sx={{ 
                mb: 0.5,
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
                fontSize: '1.1rem',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                fontWeight: 500,
              }}
            >
              Medical Database Explorer
            </Typography>
          </Box>
        </Box>
      </Box>

        {/* Category Filter Buttons */}
        {categories.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                color: '#7c3aed',
                textShadow: '0 0 25px rgba(124, 58, 237, 0.6)',
                fontWeight: 700,
              }}
            >
              Filter by Category:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                label="All Categories"
                onClick={() => {
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                sx={{
                  cursor: 'pointer',
                  background: !selectedCategory ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${!selectedCategory ? '#00d4ff' : 'rgba(255, 255, 255, 0.15)'}`,
                  color: !selectedCategory ? '#00d4ff' : 'rgba(255, 255, 255, 0.9)',
                  fontWeight: !selectedCategory ? 700 : 500,
                  '&:hover': {
                    background: 'rgba(0, 212, 255, 0.15)',
                    borderColor: '#00d4ff',
                  },
                }}
              />
              {categories.map((category) => (
                <Chip
                  key={category.name}
                  label={`${category.display_name} (${category.count})`}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setCurrentPage(1);
                  }}
                  sx={{
                    cursor: 'pointer',
                    background: selectedCategory === category.name 
                      ? `linear-gradient(45deg, ${getCategoryColor(category.name)}40, ${getCategoryColor(category.name)}20)`
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${selectedCategory === category.name ? getCategoryColor(category.name) : 'rgba(255, 255, 255, 0.15)'}`,
                    color: selectedCategory === category.name ? getCategoryColor(category.name) : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: selectedCategory === category.name ? 700 : 500,
                    fontSize: '0.8rem',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${getCategoryColor(category.name)}30, ${getCategoryColor(category.name)}15)`,
                      borderColor: getCategoryColor(category.name),
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Database Search Filter */}
        <TextField
          fullWidth
          value={searchFilter}
          onChange={handleSearchChange}
          placeholder="Search conditions by name, description, or category..."
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: '#00d4ff',
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
          }}
          sx={{
            maxWidth: 500,
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              background: 'rgba(17, 25, 40, 0.8)',
              backdropFilter: 'blur(15px)',
              fontSize: '1.1rem',
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

      {/* Stats */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<HospitalIcon />}
          label={`${allDiseases.length} Total Conditions`}
          variant="outlined"
          sx={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            color: '#00d4ff',
            fontWeight: 600,
          }}
        />
        <Chip
          icon={<FilterIcon />}
          label={`${filteredDiseases.length} Results Found`}
          variant="outlined"
          sx={{
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            color: '#7c3aed',
            fontWeight: 600,
          }}
        />
        {selectedCategory && (
          <Chip
            label={`Category: ${categories.find(c => c.name === selectedCategory)?.display_name}`}
            variant="outlined"
            sx={{
              background: `linear-gradient(45deg, ${getCategoryColor(selectedCategory)}40, ${getCategoryColor(selectedCategory)}20)`,
              border: `1px solid ${getCategoryColor(selectedCategory)}60`,
              color: getCategoryColor(selectedCategory),
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {[...Array(12)].map((_, index) => (
            <Card key={index}>
              <CardContent>
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Skeleton variant="rectangular" width={100} height={32} />
                  <Skeleton variant="rectangular" width={80} height={32} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Diseases Grid */}
      {!isLoading && paginatedDiseases.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
          {paginatedDiseases.map((disease, index) => (
            <Card
              key={`${disease.name}-${index}`}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(17, 25, 40, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 212, 255, 0.15)',
                borderRadius: '24px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
                },
              }}
              onClick={() => handleChatAbout(disease.name)}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                {/* Disease Name */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                  <HospitalIcon 
                    sx={{ 
                      mt: 0.5, 
                      fontSize: 20,
                      color: '#00d4ff',
                      filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))',
                    }} 
                  />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    component="div"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.3,
                      color: '#ffffff',
                      textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                    }}
                  >
                    {disease.name}
                  </Typography>
                </Box>

                {/* Category Badge */}
                <Box sx={{ mb: 2 }}>
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
                {disease.description && (
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
                      fontSize: '0.85rem',
                    }}
                  >
                    {disease.description}
                  </Typography>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChatAbout(disease.name);
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
      )}

      {/* No Results */}
      {!isLoading && filteredDiseases.length === 0 && searchFilter && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Conditions Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No conditions match your search for "{searchFilter}". Try different keywords.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setSearchFilter('')}
          >
            Clear Filter
          </Button>
        </Paper>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
        </Box>
      </Box>
      </Box>
    </Container>
  );
}