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
  MonitorHeart as HeartIcon,
  Biotech as BiotechIcon,
  Vaccines as VaccinesIcon,
  Healing as HealingIcon,
  Psychology as BrainIcon,
  PsychologyAlt as PsychologyIcon,
  Coronavirus as VirusIcon,
  HealthAndSafety as ShieldIcon,
  AutoAwesome as SparkleIcon,
  Science as ScienceIcon,
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

function getCategoryIcon(category: string) {
  const icons: Record<string, typeof HospitalIcon> = {
    cardiovascular: HeartIcon,
    endocrine: BiotechIcon,
    oncology: VaccinesIcon,
    respiratory: HealingIcon,
    neurological: BrainIcon,
    mental_health: PsychologyIcon,
    infectious: VirusIcon,
    gynecological: ShieldIcon,
    urological: ScienceIcon,
    dermatological: HealingIcon,
    musculoskeletal: ShieldIcon,
    ophthalmological: SparkleIcon,
    general: HospitalIcon,
  };
  return icons[category] || HospitalIcon;
}

function DiseasesAmbientBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        bgcolor: '#f8fbff',
        background:
          'linear-gradient(135deg, rgba(255,247,237,0.45) 0%, rgba(239,246,255,0.94) 38%, rgba(255,255,255,0.72) 64%, rgba(236,254,255,0.68) 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-48px',
          backgroundImage:
            'linear-gradient(rgba(220,38,38,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          animation: 'diseaseGridDrift 34s linear infinite',
          maskImage: 'radial-gradient(circle at 50% 18%, black 0%, rgba(0,0,0,0.78) 34%, rgba(0,0,0,0.30) 78%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(120deg, rgba(220,38,38,0.10), transparent 28%, rgba(37,99,235,0.12) 58%, transparent 84%)',
          animation: 'diseaseLightSweep 14s ease-in-out infinite alternate',
        },
        '@keyframes diseaseGridDrift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(46px, 46px, 0)' },
        },
        '@keyframes diseaseLightSweep': {
          '0%': { opacity: 0.35, transform: 'translateX(-4%)' },
          '100%': { opacity: 0.85, transform: 'translateX(4%)' },
        },
      }}
    />
  );
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
      className="relative h-full overflow-hidden rounded-[24px]"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        bgcolor: 'rgba(255,255,255,0.74)',
        borderRadius: '24px',
        border: '1px solid rgba(191,219,254,0.92)',
        overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(15,23,42,0.10)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <DiseasesAmbientBackdrop />

      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          pt: 3,
          pb: 2.5,
          borderBottom: '1px solid rgba(219,234,254,0.9)',
          bgcolor: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(18px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(254,242,242,0.96), rgba(239,246,255,0.96))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.25,
              border: '1px solid rgba(191,219,254,0.9)',
              boxShadow: '0 14px 34px rgba(220,38,38,0.18)',
              animation: 'databasePulse 3s ease-in-out infinite',
              '@keyframes databasePulse': {
                '0%,100%': { transform: 'scale(1)', boxShadow: '0 14px 34px rgba(220,38,38,0.18)' },
                '50%': { transform: 'scale(1.05)', boxShadow: '0 18px 42px rgba(37,99,235,0.24)' },
              },
            }}
          >
            <Box
              component="img"
              src="/DatabaseIcon.png"
              alt="Disease database"
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                transform: 'scale(1.18)',
                display: 'block',
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0f172a', lineHeight: 1.2, fontSize: '1.18rem' }}>
              Disease Database
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
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
                bgcolor: 'rgba(254,242,242,0.9)',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: '999px',
                fontWeight: 800,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}
        </Box>

        {/* Search */}
        <Box
          sx={{
            position: 'relative',
            mb: 2,
            borderRadius: '20px',
            p: '2px',
            background:
              'linear-gradient(90deg, rgba(220,38,38,0.92), rgba(37,99,235,0.94), rgba(6,182,212,0.90), rgba(220,38,38,0.92))',
            backgroundSize: '260% 100%',
            animation: 'diseaseGlowBorder 5.5s linear infinite',
            boxShadow: '0 14px 34px rgba(37,99,235,0.14)',
            '@keyframes diseaseGlowBorder': {
              '0%': { backgroundPosition: '0% 50%' },
              '100%': { backgroundPosition: '260% 50%' },
            },
          }}
        >
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
                  <SearchIcon sx={{ fontSize: 20, color: '#dc2626' }} />
                </InputAdornment>
              ),
              endAdornment: searchFilter ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => { setSearchFilter(''); setCurrentPage(1); }}
                    sx={{ color: '#64748b' }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.96)',
                fontSize: '0.96rem',
                minHeight: 52,
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'transparent' },
                '&.Mui-focused fieldset': { borderColor: 'transparent' },
              },
              '& .MuiInputBase-input': {
                color: '#0f172a',
                fontWeight: 600,
                '&::placeholder': { color: '#94a3b8', fontWeight: 500 },
              },
            }}
          />
        </Box>

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
                bgcolor: !selectedCategory ? '#0f172a' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${!selectedCategory ? '#0f172a' : 'rgba(226,232,240,0.9)'}`,
                color: !selectedCategory ? '#ffffff' : '#475569',
                cursor: 'pointer',
                borderRadius: '999px',
                transition: 'all 0.15s ease',
                '& .MuiChip-label': { px: 0.875 },
                '&:hover': { bgcolor: !selectedCategory ? '#1e293b' : '#f1f5f9', transform: 'translateY(-2px)' },
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
                    bgcolor: isSelected ? style.bg : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${isSelected ? style.border : 'rgba(226,232,240,0.9)'}`,
                    color: isSelected ? style.text : '#475569',
                    cursor: 'pointer',
                    borderRadius: '999px',
                    transition: 'all 0.15s ease',
                    '& .MuiChip-label': { px: 0.875 },
                    '&:hover': {
                      bgcolor: style.bg,
                      borderColor: style.border,
                      color: style.text,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 18px ${style.text}18`,
                    },
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          minHeight: 0,
          bgcolor: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Loading */}
        {isLoading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: 'rgba(255,255,255,0.76)',
                  border: '1px solid rgba(226,232,240,0.9)',
                  backdropFilter: 'blur(12px)',
                }}
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
                  const CategoryIcon = getCategoryIcon(disease.category);
                  return (
                    <Card
                      key={`${disease.name}-${idx}`}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'rgba(255,255,255,0.86)',
                        border: '1px solid rgba(226,232,240,0.92)',
                        borderRadius: '18px',
                        cursor: 'pointer',
                        transition: 'all 0.22s ease',
                        boxShadow: '0 10px 26px rgba(15,23,42,0.05)',
                        backdropFilter: 'blur(14px)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(135deg, ${style.bg}, transparent 44%)`,
                          opacity: 0,
                          transition: 'opacity 0.22s ease',
                        },
                        '&:hover': {
                          borderColor: style.border,
                          transform: 'translateY(-5px) scale(1.01)',
                          boxShadow: `0 20px 46px ${style.text}1f`,
                        },
                        '&:hover::before': {
                          opacity: 0.86,
                        },
                      }}
                      onClick={() => handleChatAbout(disease.name)}
                    >
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.25, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.25 }}>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              bgcolor: style.bg,
                              border: `1px solid ${style.border}`,
                              color: style.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: `0 8px 18px ${style.text}20`,
                            }}
                          >
                            <CategoryIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: '#0f172a',
                              fontWeight: 800,
                              lineHeight: 1.3,
                              fontSize: '0.94rem',
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
                            borderRadius: '999px',
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
                              borderRadius: '999px',
                              border: '1px solid #e2e8f0',
                              color: '#475569',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              py: 0.5,
                              '&:hover': { bgcolor: '#f8fafc', borderColor: style.border, color: style.text },
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
                              borderRadius: '999px',
                              bgcolor: style.text,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              py: 0.5,
                              boxShadow: 'none',
                              '&:hover': { bgcolor: style.text, filter: 'brightness(0.92)', boxShadow: `0 8px 18px ${style.text}35` },
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
                        borderRadius: '999px',
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
            <Box
              sx={{
                width: 78,
                height: 78,
                mx: 'auto',
                mb: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(254,242,242,0.85)',
                border: '1px solid #fecaca',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 16px 36px rgba(220,38,38,0.12)',
              }}
            >
              <SearchIcon sx={{ fontSize: 34 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#0f172a', mb: 1, fontWeight: 800 }}>
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
              sx={{ borderRadius: '999px', border: '1px solid #e2e8f0', color: '#475569', px: 2 }}
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
          bgcolor: 'rgba(255,251,235,0.86)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(14px)',
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
