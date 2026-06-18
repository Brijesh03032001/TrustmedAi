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
  { term: 'Cancer', icon: '🎗️' },
  { term: 'Anxiety', icon: '🌀' },
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        '&:hover': {
          borderColor: style.border,
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 24px rgba(0,0,0,0.08)`,
        },
      }}
      onClick={() => onView(disease.id || index)}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.25 }}>
          <HospitalIcon sx={{ fontSize: 15, color: style.text, mt: 0.3, flexShrink: 0 }} />
          <Typography
            variant="subtitle2"
            sx={{
              color: '#0f172a',
              fontWeight: 700,
              lineHeight: 1.3,
              fontSize: '0.88rem',
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
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              color: '#475569',
              fontSize: '0.7rem',
              fontWeight: 600,
              py: 0.6,
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
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
              borderRadius: '8px',
              bgcolor: '#2563eb',
              fontSize: '0.7rem',
              fontWeight: 700,
              py: 0.6,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' },
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
            src="/searchicon.png"
            alt="Search"
            sx={{ width: 34, height: 34, borderRadius: '10px', border: '1px solid #e2e8f0' }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Medical Search
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
              Search across 10,000+ conditions
            </Typography>
          </Box>
        </Box>

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
                  <CircularProgress size={15} sx={{ color: '#7c3aed' }} />
                ) : (
                  <SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                )}
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch} sx={{ color: '#94a3b8' }}>
                  <CloseIcon sx={{ fontSize: 15 }} />
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
              '&.Mui-focused fieldset': { borderColor: '#7c3aed', borderWidth: '2px' },
            },
            '& .MuiInputBase-input': {
              color: '#0f172a',
              '&::placeholder': { color: '#94a3b8' },
            },
          }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0.25 }}>
            <TrendingIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
              Popular:
            </Typography>
          </Box>
          {quickSearchTerms.map(({ term, icon }) => (
            <Chip
              key={term}
              label={`${icon} ${term}`}
              size="small"
              onClick={() => handleQuickSearch(term)}
              sx={{
                height: 24,
                fontSize: '0.7rem',
                bgcolor: searchQuery === term ? '#f5f3ff' : '#f8fafc',
                border: `1px solid ${searchQuery === term ? '#ddd6fe' : '#e2e8f0'}`,
                color: searchQuery === term ? '#7c3aed' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '& .MuiChip-label': { px: 0.875 },
                '&:hover': { bgcolor: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Results */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, minHeight: 0, bgcolor: '#f8fafc' }}>
        {/* Stats */}
        {searchStats && results.length > 0 && (
          <Fade in>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                Found{' '}
                <Box component="span" sx={{ color: '#7c3aed', fontWeight: 700 }}>
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
              <SearchIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 2 }} />
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
              component="img"
              src="/searchicon.png"
              alt="Search"
              sx={{
                width: 56,
                height: 56,
                mx: 'auto',
                mb: 2,
                opacity: 0.25,
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%,100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-8px)' },
                },
              }}
            />
            <Typography variant="h6" sx={{ color: '#475569', mb: 1, fontWeight: 600, fontSize: '1rem' }}>
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
                { icon: '🔍', title: 'Instant Search', desc: 'Real-time results as you type' },
                { icon: '🏥', title: '10K+ Conditions', desc: 'Comprehensive medical database' },
                { icon: '🤖', title: 'AI-Powered', desc: 'Ask follow-up questions via chat' },
              ].map((f) => (
                <Box
                  key={f.title}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>{f.icon}</Typography>
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
