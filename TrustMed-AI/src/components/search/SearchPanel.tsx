'use client';

import React, { useState, useRef } from 'react';
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
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalHospital as HospitalIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  TrendingUp as TrendingIcon,
  WarningAmber as WarningIcon,
  MonitorHeart as HeartIcon,
  Medication as MedicationIcon,
  Psychology as BrainIcon,
  PsychologyAlt as PsychologyIcon,
  Vaccines as VaccinesIcon,
  Biotech as BiotechIcon,
  HealthAndSafety as ShieldIcon,
  Coronavirus as VirusIcon,
  Healing as HealingIcon,
  AutoAwesome as SparkleIcon,
  LocalPharmacy as PharmacyIcon,
} from '@mui/icons-material';
import { apiService } from '../../lib/api';

const RESULTS_PER_PAGE = 9;

const quickSearchTerms = [
  { term: 'Diabetes', Icon: BiotechIcon, color: '#2563eb' },
  { term: 'Hypertension', Icon: HeartIcon, color: '#dc2626' },
  { term: 'Asthma', Icon: HealingIcon, color: '#0891b2' },
  { term: 'Migraine', Icon: BrainIcon, color: '#d97706' },
  { term: 'Arthritis', Icon: ShieldIcon, color: '#be123c' },
  { term: 'Depression', Icon: PsychologyIcon, color: '#16a34a' },
  { term: 'Cancer', Icon: VaccinesIcon, color: '#7c3aed' },
  { term: 'Anxiety', Icon: SparkleIcon, color: '#0e7490' },
];

const categoryColors: Record<string, { text: string; bg: string; border: string }> = {
  cardiovascular: { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  endocrine:      { text: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  oncology:       { text: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  respiratory:    { text: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  neurological:   { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  mental_health:  { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  infectious:     { text: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  gynecological:  { text: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
  urological:     { text: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  dermatological: { text: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  musculoskeletal:{ text: '#be123c', bg: '#fff1f2', border: '#fecdd3' },
  ophthalmological:{ text: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  general:        { text: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
};

function getCategoryStyle(category: string) {
  return categoryColors[category] || categoryColors.general;
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
    urological: BiotechIcon,
    dermatological: HealingIcon,
    musculoskeletal: ShieldIcon,
    ophthalmological: SparkleIcon,
    general: HospitalIcon,
  };
  return icons[category] || HospitalIcon;
}

function SearchAmbientBackdrop() {
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
          'linear-gradient(135deg, rgba(239,246,255,0.96) 0%, rgba(255,255,255,0.72) 48%, rgba(236,254,255,0.68) 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-48px',
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.095) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.095) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          animation: 'searchGridDrift 32s linear infinite',
          maskImage: 'radial-gradient(circle at 50% 20%, black 0%, rgba(0,0,0,0.72) 36%, rgba(0,0,0,0.28) 76%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(115deg, rgba(37,99,235,0.12), transparent 30%, rgba(6,182,212,0.15) 58%, transparent 82%)',
          animation: 'searchLightSweep 13s ease-in-out infinite alternate',
        },
        '@keyframes searchGridDrift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(42px, 42px, 0)' },
        },
        '@keyframes searchLightSweep': {
          '0%': { opacity: 0.35, transform: 'translateX(-4%)' },
          '100%': { opacity: 0.85, transform: 'translateX(4%)' },
        },
      }}
    />
  );
}

function DiseaseCard({
  disease,
  index,
  onView,
  onChat,
}: {
  disease: any;
  index: number;
  onView: (id: number) => void;
  onChat: (name: string) => void;
}) {
  const style = getCategoryStyle(disease.category);
  const CategoryIcon = getCategoryIcon(disease.category);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(255,255,255,0.86)',
        border: '1px solid rgba(226,232,240,0.92)',
        borderRadius: '18px',
        transition: 'all 0.22s ease',
        cursor: 'pointer',
        boxShadow: '0 10px 26px rgba(15,23,42,0.05)',
        backdropFilter: 'blur(14px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${style.bg}, transparent 42%)`,
          opacity: 0,
          transition: 'opacity 0.22s ease',
        },
        '&:hover': {
          borderColor: style.border,
          transform: 'translateY(-5px) scale(1.01)',
          boxShadow: `0 20px 46px ${style.text}1f`,
        },
        '&:hover::before': {
          opacity: 0.85,
        },
      }}
      onClick={() => onView(disease.id || index)}
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
            height: 20,
            fontSize: '0.62rem',
            fontWeight: 700,
            bgcolor: style.bg,
            border: `1px solid ${style.border}`,
            color: style.text,
            borderRadius: '999px',
            '& .MuiChip-label': { px: 0.75 },
          }}
        />

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
            fontSize: '0.77rem',
          }}
        >
          {disease.description || 'Click to learn more about this medical condition.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.875, mt: 1.75 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon sx={{ fontSize: '13px !important' }} />}
            onClick={(e) => { e.stopPropagation(); onView(disease.id || index); }}
            sx={{
              flex: 1,
              borderRadius: '999px',
              border: '1px solid #e2e8f0',
              color: '#475569',
              fontSize: '0.7rem',
              fontWeight: 600,
              py: 0.6,
              '&:hover': { bgcolor: '#f8fafc', borderColor: style.border, color: style.text },
            }}
          >
            Details
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<ChatIcon sx={{ fontSize: '13px !important' }} />}
            onClick={(e) => { e.stopPropagation(); onChat(disease.name); }}
            sx={{
              flex: 1,
              borderRadius: '999px',
              bgcolor: style.text,
              fontSize: '0.7rem',
              fontWeight: 700,
              py: 0.6,
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
}

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchStats, setSearchStats] = useState<{ total: number; searchTime: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim() || query.trim().length < 2) {
        return { diseases: [], total_diseases: 0, search_time_ms: 0 };
      }
      return apiService.searchDiseases(query.trim(), 100);
    },
    onSuccess: (data) => {
      setResults(data.diseases || []);
      setCurrentPage(1);
      setSearchStats({
        total: data.total_diseases || data.diseases?.length || 0,
        searchTime: data.search_time_ms || 0,
      });
    },
    onError: () => {
      setResults([]);
      setSearchStats(null);
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearchStats(null);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => searchMutation.mutate(query), 350);
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    searchMutation.mutate(term);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setSearchStats(null);
    setCurrentPage(1);
  };

  const handleViewDisease = (id: number) => router.push(`/diseases/${id}`);
  const handleChatAbout = (name: string) =>
    router.push(`/chat?q=${encodeURIComponent(`Tell me about ${name}`)}`);

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const paginatedResults = results.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

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
      <SearchAmbientBackdrop />

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
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(239,246,255,0.96), rgba(236,254,255,0.96))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.25,
              border: '1px solid rgba(191,219,254,0.9)',
              boxShadow: '0 12px 30px rgba(37,99,235,0.25)',
              animation: 'searchIconPulse 2.8s ease-in-out infinite',
              '@keyframes searchIconPulse': {
                '0%,100%': { transform: 'scale(1)', boxShadow: '0 12px 30px rgba(37,99,235,0.22)' },
                '50%': { transform: 'scale(1.05)', boxShadow: '0 16px 38px rgba(6,182,212,0.30)' },
              },
            }}
          >
            <Box
              component="img"
              src="/searchicon.png"
              alt="Medical search"
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                transform: 'scale(1.12)',
                display: 'block',
              }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0f172a', lineHeight: 1.2, fontSize: '1.18rem' }}>
              Medical Search
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
              Search conditions, symptoms, and clinical topics
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'relative',
            mb: 2,
            borderRadius: '20px',
            p: '2px',
            background:
              'linear-gradient(90deg, rgba(37,99,235,0.95), rgba(6,182,212,0.95), rgba(124,58,237,0.95), rgba(37,99,235,0.95))',
            backgroundSize: '260% 100%',
            animation: 'searchGlowBorder 5s linear infinite',
            boxShadow: '0 14px 34px rgba(37,99,235,0.16)',
            '@keyframes searchGlowBorder': {
              '0%': { backgroundPosition: '0% 50%' },
              '100%': { backgroundPosition: '260% 50%' },
            },
          }}
        >
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search conditions, symptoms, diseases..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {searchMutation.isPending ? (
                    <CircularProgress size={18} sx={{ color: '#2563eb' }} />
                  ) : (
                    <SearchIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                  )}
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch} sx={{ color: '#64748b' }}>
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

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0.25 }}>
            <TrendingIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
              Popular:
            </Typography>
          </Box>
          {quickSearchTerms.map(({ term, Icon, color }) => (
            <Chip
              key={term}
              icon={
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: `${color}18`,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: '4px !important',
                  }}
                >
                  <Icon sx={{ fontSize: 13 }} />
                </Box>
              }
              label={term}
              size="small"
              onClick={() => handleQuickSearch(term)}
              sx={{
                height: 30,
                fontSize: '0.76rem',
                bgcolor: searchQuery === term ? `${color}12` : 'rgba(255,255,255,0.72)',
                border: `1px solid ${searchQuery === term ? `${color}55` : 'rgba(226,232,240,0.9)'}`,
                color: searchQuery === term ? color : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderRadius: '999px',
                backdropFilter: 'blur(10px)',
                '& .MuiChip-label': { px: 1, fontWeight: 700 },
                '&:hover': {
                  bgcolor: `${color}12`,
                  borderColor: `${color}55`,
                  color,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 18px ${color}20`,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Results */}
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
        {/* Stats */}
        {searchStats && results.length > 0 && (
          <Fade in>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                px: 1.5,
                py: 1,
                borderRadius: '14px',
                bgcolor: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(219,234,254,0.85)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                Found{' '}
                <Box component="span" sx={{ color: '#2563eb', fontWeight: 800 }}>
                  {results.length}
                </Box>{' '}
                results
                {searchStats.searchTime > 0 && (
                  <Box component="span" sx={{ color: '#94a3b8' }}>
                    {' '}· {(searchStats.searchTime / 1000).toFixed(2)}s
                  </Box>
                )}
              </Typography>
              {totalPages > 1 && (
                <Typography variant="caption" sx={{ color: '#94a3b8', ml: 'auto', fontSize: '0.7rem' }}>
                  Page {currentPage} of {totalPages}
                </Typography>
              )}
            </Box>
          </Fade>
        )}

        {/* Grid */}
        {results.length > 0 && (
          <Fade in timeout={300}>
            <Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' },
                  gap: 2,
                  mb: 3,
                }}
              >
                {paginatedResults.map((disease, idx) => (
                  <DiseaseCard
                    key={`${disease.name}-${idx}`}
                    disease={disease}
                    index={idx}
                    onView={handleViewDisease}
                    onChat={handleChatAbout}
                  />
                ))}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    sx={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontSize: '0.78rem',
                      '&:hover': { borderColor: '#7c3aed', color: '#7c3aed', bgcolor: '#f5f3ff' },
                      '&.Mui-disabled': { opacity: 0.4 },
                    }}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
                    <IconButton
                      key={page}
                      size="small"
                      onClick={() => setCurrentPage(page)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: currentPage === page ? 700 : 400,
                        bgcolor: currentPage === page ? '#7c3aed' : 'transparent',
                        color: currentPage === page ? '#ffffff' : '#475569',
                        border: currentPage === page ? 'none' : '1px solid #e2e8f0',
                        '&:hover': { bgcolor: currentPage === page ? '#6d28d9' : '#f5f3ff' },
                      }}
                    >
                      {page}
                    </IconButton>
                  ))}
                  {totalPages > 7 && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', alignSelf: 'center', px: 0.5 }}>
                      ...{totalPages}
                    </Typography>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    sx={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontSize: '0.78rem',
                      '&:hover': { borderColor: '#7c3aed', color: '#7c3aed', bgcolor: '#f5f3ff' },
                      '&.Mui-disabled': { opacity: 0.4 },
                    }}
                  >
                    Next
                  </Button>
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {/* No results */}
        {searchMutation.isSuccess && results.length === 0 && searchQuery && (
          <Fade in>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  mx: 'auto',
                  mb: 2,
                  borderRadius: '50%',
                  bgcolor: 'rgba(254,242,242,0.85)',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  boxShadow: '0 16px 36px rgba(220,38,38,0.12)',
                }}
              >
                <SearchIcon sx={{ fontSize: 34 }} />
              </Box>
              <Typography variant="h6" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                No results found
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                No conditions match "{searchQuery}". Try different keywords.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={clearSearch}
                sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569' }}
              >
                Clear search
              </Button>
            </Box>
          </Fade>
        )}

        {/* Empty state */}
        {!searchMutation.isPending && !searchMutation.isSuccess && !searchMutation.isError && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Box
              sx={{
                width: 76,
                height: 76,
                mx: 'auto',
                mb: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 18px 44px rgba(37,99,235,0.22)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%,100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-8px)' },
                },
              }}
            >
              <BiotechIcon sx={{ fontSize: 34 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#0f172a', mb: 1, fontWeight: 800, fontSize: '1.12rem' }}>
              Search Medical Conditions
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 360, mx: 'auto', lineHeight: 1.6, fontSize: '0.83rem' }}>
              Type at least 2 characters to search our database, or click a popular term above.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' },
                gap: 1.5,
                mt: 4,
                maxWidth: 560,
                mx: 'auto',
              }}
            >
              {[
                { Icon: SearchIcon, title: 'Instant Search', desc: 'Real-time results as you type', color: '#2563eb' },
                { Icon: HospitalIcon, title: '10K+ Conditions', desc: 'Comprehensive medical database', color: '#0891b2' },
                { Icon: PharmacyIcon, title: 'AI Follow-Up', desc: 'Ask follow-up questions via chat', color: '#7c3aed' },
              ].map((f) => (
                <Box
                  key={f.title}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.76)',
                    border: '1px solid rgba(219,234,254,0.85)',
                    textAlign: 'center',
                    boxShadow: '0 10px 24px rgba(37,99,235,0.06)',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 16px 36px ${f.color}18`,
                      borderColor: `${f.color}45`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      mx: 'auto',
                      mb: 1,
                      borderRadius: '50%',
                      bgcolor: `${f.color}12`,
                      color: f.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <f.Icon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, display: 'block', mb: 0.25 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                    {f.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
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
