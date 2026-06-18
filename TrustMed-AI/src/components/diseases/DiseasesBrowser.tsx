'use client';

import React, { useState, useEffect } from 'react';
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
  Skeleton,
  Chip,
  Pagination,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalHospital as HospitalIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { apiService } from '../../lib/api';

const ITEMS_PER_PAGE = 12;

const categoryStyles: Record<string, { text: string; bg: string; border: string }> = {
  cardiovascular:  { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  endocrine:       { text: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  oncology:        { text: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  respiratory:     { text: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  neurological:    { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  mental_health:   { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  infectious:      { text: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  gynecological:   { text: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
  urological:      { text: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  dermatological:  { text: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  musculoskeletal: { text: '#be123c', bg: '#fff1f2', border: '#fecdd3' },
  ophthalmological:{ text: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  general:         { text: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
};

function getCategoryStyle(category: string) {
  return categoryStyles[category] || categoryStyles.general;
}

export function DiseasesBrowser() {
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allDiseases, setAllDiseases] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [diseasesData, categoriesData] = await Promise.all([
          apiService.searchDiseases('', 500),
          apiService.getDiseaseCategories(),
        ]);
        setAllDiseases(diseasesData.diseases || []);
        setCategories(categoriesData.categories || []);
        setIsError(false);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDiseases = allDiseases.filter((disease) => {
    const term = searchFilter.trim().toLowerCase();
    const matchesSearch =
      !term ||
      disease.name.toLowerCase().includes(term) ||
      (disease.description && disease.description.toLowerCase().includes(term)) ||
      (disease.category && disease.category.toLowerCase().includes(term));
    const matchesCategory = !selectedCategory || disease.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredDiseases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDiseases = filteredDiseases.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleChatAbout = (name: string) =>
    router.push(`/chat?q=${encodeURIComponent(`Tell me about ${name}`)}`);

  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: '12px' }}>
        Failed to load diseases. Please check that the backend server is running.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          pt: 3,
          pb: 2.5,
          borderBottom: '1px solid #f1f5f9',
          bgcolor: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box
            component="img"
            src="/DatabaseIcon.png"
            alt="Database"
            sx={{ width: 34, height: 34, borderRadius: '10px', border: '1px solid #e2e8f0' }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Disease Database
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
              {isLoading ? 'Loading...' : `${allDiseases.length} conditions indexed`}
            </Typography>
          </Box>
          {!isLoading && (
            <Chip
              label={`${filteredDiseases.length} results`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                bgcolor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          value={searchFilter}
          onChange={(e) => { setSearchFilter(e.target.value); setCurrentPage(1); }}
          placeholder="Search by name, description, or category..."
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </InputAdornment>
            ),
            endAdornment: searchFilter ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => { setSearchFilter(''); setCurrentPage(1); }}
                  sx={{ color: '#94a3b8' }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: '#f8fafc',
              fontSize: '0.88rem',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#94a3b8' },
              '&.Mui-focused fieldset': { borderColor: '#dc2626', borderWidth: '2px' },
            },
            '& .MuiInputBase-input': {
              color: '#0f172a',
              '&::placeholder': { color: '#94a3b8' },
            },
          }}
        />

        {/* Category filters */}
        {categories.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              label="All"
              size="small"
              onClick={() => handleCategorySelect('')}
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: !selectedCategory ? 700 : 500,
                bgcolor: !selectedCategory ? '#0f172a' : '#f8fafc',
                border: `1px solid ${!selectedCategory ? '#0f172a' : '#e2e8f0'}`,
                color: !selectedCategory ? '#ffffff' : '#475569',
                cursor: 'pointer',
                '& .MuiChip-label': { px: 0.875 },
                '&:hover': { bgcolor: !selectedCategory ? '#1e293b' : '#f1f5f9' },
              }}
            />
            {categories.map((cat) => {
              const style = getCategoryStyle(cat.name);
              const isSelected = selectedCategory === cat.name;
              return (
                <Chip
                  key={cat.name}
                  label={`${cat.display_name} (${cat.count})`}
                  size="small"
                  onClick={() => handleCategorySelect(cat.name)}
                  sx={{
                    height: 24,
                    fontSize: '0.68rem',
                    fontWeight: isSelected ? 700 : 500,
                    bgcolor: isSelected ? style.bg : '#f8fafc',
                    border: `1px solid ${isSelected ? style.border : '#e2e8f0'}`,
                    color: isSelected ? style.text : '#475569',
                    cursor: 'pointer',
                    '& .MuiChip-label': { px: 0.875 },
                    '&:hover': { bgcolor: style.bg, borderColor: style.border, color: style.text },
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, minHeight: 0, bgcolor: '#f8fafc' }}>
        {/* Loading */}
        {isLoading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Box
                key={i}
                sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}
              >
                <Skeleton variant="text" width="75%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width={80} height={18} sx={{ borderRadius: '6px', mb: 1.5 }} />
                <Skeleton variant="text" width="90%" height={14} />
                <Skeleton variant="text" width="60%" height={14} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant="rectangular" width="50%" height={28} sx={{ borderRadius: '8px' }} />
                  <Skeleton variant="rectangular" width="50%" height={28} sx={{ borderRadius: '8px' }} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Grid */}
        {!isLoading && paginatedDiseases.length > 0 && (
          <Fade in timeout={250}>
            <Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 2,
                  mb: 3,
                }}
              >
                {paginatedDiseases.map((disease, idx) => {
                  const style = getCategoryStyle(disease.category);
                  return (
                    <Card
                      key={`${disease.name}-${idx}`}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        '&:hover': {
                          borderColor: style.border,
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        },
                      }}
                      onClick={() => handleChatAbout(disease.name)}
                    >
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.25 }}>
                          <HospitalIcon sx={{ fontSize: 14, color: style.text, mt: 0.3, flexShrink: 0 }} />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: '#0f172a',
                              fontWeight: 700,
                              lineHeight: 1.3,
                              fontSize: '0.86rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {disease.name}
                          </Typography>
                        </Box>

                        <Chip
                          label={(disease.category || 'general').replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            alignSelf: 'flex-start',
                            mb: 1.25,
                            height: 18,
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            bgcolor: style.bg,
                            border: `1px solid ${style.border}`,
                            color: style.text,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />

                        {disease.description && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#64748b',
                              lineHeight: 1.5,
                              flex: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.75rem',
                            }}
                          >
                            {disease.description}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 0.875, mt: 1.75 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon sx={{ fontSize: '12px !important' }} />}
                            onClick={(e) => { e.stopPropagation(); handleChatAbout(disease.name); }}
                            sx={{
                              flex: 1,
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              color: '#475569',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              py: 0.5,
                              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                            }}
                          >
                            Learn
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ChatIcon sx={{ fontSize: '12px !important' }} />}
                            onClick={(e) => { e.stopPropagation(); handleChatAbout(disease.name); }}
                            sx={{
                              flex: 1,
                              borderRadius: '8px',
                              bgcolor: '#2563eb',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              py: 0.5,
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' },
                            }}
                          >
                            Ask AI
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    size="small"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#475569',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' },
                        '&.Mui-selected': {
                          bgcolor: '#dc2626',
                          color: '#ffffff',
                          borderColor: '#dc2626',
                          fontWeight: 700,
                          '&:hover': { bgcolor: '#b91c1c' },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {/* No results */}
        {!isLoading && filteredDiseases.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
              No conditions found
            </Typography>
            {searchFilter && (
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                No results for "{searchFilter}". Try different keywords.
              </Typography>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={() => { setSearchFilter(''); setSelectedCategory(''); setCurrentPage(1); }}
              sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569' }}
            >
              Clear filters
            </Button>
          </Box>
        )}
      </Box>

      {/* Disclaimer */}
      <Box
        sx={{
          px: 3,
          py: 1,
          borderTop: '1px solid #fde68a',
          bgcolor: '#fffbeb',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flexShrink: 0,
        }}
      >
        <WarningIcon sx={{ fontSize: 12, color: '#d97706', flexShrink: 0 }} />
        <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.67rem' }}>
          For informational purposes only. Consult a healthcare professional for medical advice.
        </Typography>
      </Box>
    </Box>
  );
}
