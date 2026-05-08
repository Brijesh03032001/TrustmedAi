'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Fade,
  Tooltip,
  useTheme,
  alpha,
  Container,
  Stack,
  Grow,
  Slide,
  Link,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  AutoAwesome as SparkleIcon,
  WarningAmber as WarningIcon,
  FavoriteRounded as HeartIcon,
  Clear as ClearIcon,
  AccessTime as TimeIcon,
  TrendingUp as ConfidenceIcon,
  Source as SourceIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../../lib/api';
import { ChatMessage, TrustMedQueryResponse, MedicalLink } from '@/types';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: MedicalLink[];
  isTyping?: boolean;
  confidence?: number;
  intent?: string;
  responseTime?: number;
  sourcesCount?: number;
}

interface ChatInterfaceProps {
  initialMessage?: string;
}

const sampleQuestions = [
  "What are the symptoms of diabetes?",
  "How is hypertension diagnosed?",
  "What causes chronic fatigue syndrome?", 
  "Tell me about migraine treatments",
  "What are the risk factors for heart disease?",
  "How to prevent cardiovascular disease?",
  "What are the side effects of blood pressure medications?",
  "Signs of early stage kidney disease",
];

const TypingIndicator = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #00d4ff, #ff006e)',
              boxShadow: `0 0 20px ${i === 1 ? 'rgba(0, 212, 255, 0.8)' : 'rgba(255, 0, 110, 0.6)'}`,
              animation: 'cyberpunkTyping 1.6s ease-in-out infinite',
              animationDelay: `${i * 0.3}s`,
              '@keyframes cyberpunkTyping': {
                '0%, 60%, 100%': {
                  transform: 'translateY(0) scale(1)',
                  opacity: 0.6,
                  boxShadow: '0 0 10px rgba(0, 212, 255, 0.4)',
                },
                '30%': {
                  transform: 'translateY(-12px) scale(1.2)',
                  opacity: 1,
                  boxShadow: '0 0 30px rgba(255, 0, 110, 0.8)',
                },
              },
            }}
          />
        ))}
      </Box>
      <Typography 
        variant="body2" 
        sx={{ 
          ml: 1,
          color: 'rgba(0, 212, 255, 0.9)',
          textShadow: '0 0 15px rgba(0, 212, 255, 0.5)',
          fontStyle: 'italic',
          fontWeight: 500,
        }}
      >
        TrustMed-AI neural processing active...
      </Typography>
    </Box>
  );
};

export function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(initialMessage || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Health check query
  const { data: healthStatus, isError: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: apiService.healthCheck,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const chatMutation = useMutation({
    mutationFn: (query: string) => apiService.medicalQuery(query),
    onSuccess: (response: TrustMedQueryResponse) => {
      setMessages(prev => prev.map(msg => 
        msg.isTyping 
          ? {
              ...msg,
              content: response.answer,
              sources: response.links,
              confidence: response.confidence_score,
              intent: response.query_intent,
              responseTime: response.response_time_ms,
              sourcesCount: response.sources_count,
              isTyping: false,
            }
          : msg
      ));
    },
    onError: (error: any) => {
      setMessages(prev => prev.map(msg => 
        msg.isTyping 
          ? {
              ...msg,
              content: `Neural interface encountered an error: ${error.message}. Please try reinitializing your query.`,
              isTyping: false,
            }
          : msg
      ));
    },
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const typingMessage: Message = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    chatMutation.mutate(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSampleQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };



  const formatMarkdown = (text: string) => {
    // Basic markdown to HTML conversion for display
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/###\s(.*?)$/gm, '<h3>$1</h3>')
      .replace(/##\s(.*?)$/gm, '<h2>$1</h2>')
      .replace(/\n/g, '<br />');
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <Fade in key={message.id} timeout={300}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            mb: 3,
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          {!isUser && (
            <Avatar
              sx={{
                background: 'linear-gradient(45deg, #ff006e 0%, #7c3aed 100%)',
                width: 36,
                height: 36,
                mt: 0.5,
                border: '1px solid rgba(255, 0, 110, 0.4)',
                boxShadow: '0 0 20px rgba(255, 0, 110, 0.4)',
              }}
            >
              <AIIcon sx={{ fontSize: 20, color: 'white' }} />
            </Avatar>
          )}
          
          <Box sx={{ maxWidth: '75%' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                background: isUser 
                  ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(17, 25, 40, 0.95) 0%, rgba(26, 26, 46, 0.9) 100%)',
                color: '#ffffff',
                borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: isUser 
                  ? '1px solid rgba(0, 212, 255, 0.25)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                boxShadow: isUser
                  ? '0 8px 32px rgba(0, 212, 255, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)'
                  : '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isUser
                    ? '0 12px 40px rgba(0, 212, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)'
                    : '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25)',
                },
                '&::before': isUser ? {} : {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '20px 20px 20px 4px',
                  background: 'linear-gradient(45deg, rgba(255, 0, 110, 0.03), rgba(124, 58, 237, 0.03))',
                  zIndex: -1,
                },
              }}
            >
              {message.isTyping ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 0.4 }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #00d4ff, #ff006e)',
                          boxShadow: '0 0 12px rgba(0, 212, 255, 0.6)',
                          animation: 'modernTyping 1.4s ease-in-out infinite',
                          animationDelay: `${i * 0.2}s`,
                          '@keyframes modernTyping': {
                            '0%, 60%, 100%': {
                              transform: 'translateY(0) scale(0.8)',
                              opacity: 0.5,
                            },
                            '30%': {
                              transform: 'translateY(-8px) scale(1)',
                              opacity: 1,
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                      fontWeight: 500,
                    }}
                  >
                    TrustMed-AI is analyzing...
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: 1.6,
                    }}
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                  />
                  
                  {/* Perplexity-style Source Links */}
                  {message.sources && message.sources.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          mb: 1, 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Sources
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1 }}>
                        {message.sources.map((link, index) => (
                          <Link
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1.2,
                              py: 0.6,
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#ffffff',
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                borderColor: 'rgba(0, 212, 255, 0.5)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(0, 212, 255, 0.2)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: link.source_type === 'medicine' ? '#ff9800' :
                                          link.source_type === 'diseases' ? '#4caf50' :
                                          link.source_type === 'symptoms' ? '#f44336' :
                                          '#2196f3',
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="inherit">
                              {index + 1}
                            </Typography>
                          </Link>
                        ))}
                      </Box>
                      
                      {/* Source Details on Hover/Expand */}
                      <Box sx={{ mt: 1, display: 'none' /* Will be shown on expand */ }}>
                        {message.sources.map((link, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              [{index + 1}] {link.source_type}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                              {link.title}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Enhanced TrustMed-AI Metadata */}
                  {!isUser && !message.isTyping && (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
                      {message.intent && (
                        <Chip
                          label={message.intent}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: 'rgba(124, 58, 237, 0.15)',
                            color: '#a855f7',
                            border: '1px solid rgba(124, 58, 237, 0.3)',
                            borderRadius: '10px',
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                      {message.confidence !== undefined && (
                        <Chip
                          label={`${(message.confidence * 100).toFixed(0)}% confident`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: message.confidence > 0.7 ? 'rgba(76, 175, 80, 0.15)' : 
                                       message.confidence > 0.4 ? 'rgba(255, 152, 0, 0.15)' : 
                                       'rgba(244, 67, 54, 0.15)',
                            color: message.confidence > 0.7 ? '#4caf50' : 
                                  message.confidence > 0.4 ? '#ff9800' : 
                                  '#f44336',
                            border: `1px solid ${message.confidence > 0.7 ? 'rgba(76, 175, 80, 0.3)' : 
                                                  message.confidence > 0.4 ? 'rgba(255, 152, 0, 0.3)' : 
                                                  'rgba(244, 67, 54, 0.3)'}`,
                            borderRadius: '10px',
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                      {message.sourcesCount !== undefined && (
                        <Chip
                          label={`${message.sourcesCount} sources`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: 'rgba(0, 212, 255, 0.15)',
                            color: '#00d4ff',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            borderRadius: '10px',
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                      {message.responseTime !== undefined && (
                        <Chip
                          label={`${(message.responseTime / 1000).toFixed(1)}s`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                    </Box>
                  )}
                  
                  {!isUser && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Tooltip title="Copy response" arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(message.content)}
                          sx={{ 
                            opacity: 0.6,
                            color: 'rgba(255, 255, 255, 0.6)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '8px',
                            width: 28,
                            height: 28,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              opacity: 1,
                              background: 'rgba(255, 255, 255, 0.1)',
                              transform: 'scale(1.05)',
                            } 
                          }}
                        >
                          <CopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </>
              )}
            </Paper>

            {/* Timestamp */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                textAlign: isUser ? 'right' : 'left',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
            >
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>

          {isUser && (
            <Avatar
              sx={{
                background: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 100%)',
                width: 36,
                height: 36,
                mt: 0.5,
                border: '1px solid rgba(0, 212, 255, 0.4)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
              }}
            >
              <PersonIcon sx={{ fontSize: 20, color: 'white' }} />
            </Avatar>
          )}
        </Box>
      </Fade>
    );
  };

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
            radial-gradient(ellipse at top, rgba(0, 212, 255, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse at bottom, rgba(255, 0, 110, 0.06) 0%, transparent 70%),
            linear-gradient(135deg, rgba(17, 25, 40, 0.95) 0%, rgba(26, 26, 46, 0.9) 100%)
          `,
          backdropFilter: 'blur(20px)',
          boxShadow: `
            0 0 60px rgba(0, 212, 255, 0.3),
            0 0 120px rgba(255, 0, 110, 0.2),
            0px 20px 60px rgba(0,0,0,0.4)
          `,
          border: '1px solid rgba(0, 212, 255, 0.2)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '24px',
            background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1), rgba(255, 0, 110, 0.1))',
            opacity: 0.3,
            animation: 'borderPulse 3s ease-in-out infinite',
            zIndex: -1,
          },
          '@keyframes borderPulse': {
            '0%, 100%': { opacity: 0.3 },
            '50%': { opacity: 0.6 },
          },
        }}
      >
        {/* Cyberpunk Chat Header */}
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
              src="/ChatBotIcon.png"
              alt="TrustMed-AI ChatBot"
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
                Advanced Neural Medical Intelligence
              </Typography>
            </Box>
            
            {/* Health Status & Session Controls */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              {healthStatus && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: healthStatus.status === 'healthy' ? '#4caf50' : '#f44336',
                      boxShadow: `0 0 10px ${healthStatus.status === 'healthy' ? '#4caf50' : '#f44336'}`,
                      animation: healthStatus.status === 'healthy' ? 'healthyPulse 2s ease-in-out infinite' : 'none',
                      '@keyframes healthyPulse': {
                        '0%, 100%': { opacity: 0.8 },
                        '50%': { opacity: 1 },
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                     {healthStatus.active_sessions} Active
                  </Typography>
                </Box>
              )}
              {healthError && (
                <Typography variant="caption" sx={{ color: '#f44336' }}>
                  Neural Core Offline
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Description */}
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: 'rgba(255, 255, 255, 0.9)', 
              textAlign: 'center',
              fontSize: '1.1rem',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
              fontWeight: 400,
            }}
          >
            Powered by advanced neural architecture for precise medical insights and comprehensive health information analysis.
          </Typography>
        </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          py: 3,
          minHeight: 0,
        }}
      >
        {messages.length === 0 ? (
          /* Cyberpunk Welcome Screen */
          <Box sx={{ textAlign: 'center', mt: 4, position: 'relative' }}>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                mb: 4,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  animation: 'welcomePulse 2s ease-in-out infinite',
                  zIndex: -1,
                },
                '@keyframes welcomePulse': {
                  '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
                  '50%': { transform: 'translate(-50%, -50%) scale(1.2)' },
                },
              }}
            >
              <Box
                component="img"
                src="/ChatBotIcon.png"
                alt="TrustMed-AI ChatBot"
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  borderRadius: '50%',
                  filter: `
                    drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))
                    drop-shadow(0 0 30px rgba(0, 212, 255, 0.4))
                    brightness(1.2)
                    contrast(1.1)
                  `,
                  border: '2px solid rgba(0, 212, 255, 0.4)',
                  boxShadow: '0 0 50px rgba(0, 212, 255, 0.6)',
                }}
              />
            </Box>
            
            <Typography 
              variant="h3" 
              fontWeight="black" 
              sx={{
                mb: 2,
                background: 'linear-gradient(45deg, #00d4ff 0%, #ffffff 30%, #ff006e 60%, #7c3aed 100%)',
                backgroundSize: '300% 300%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'textShimmer 3s ease-in-out infinite',
                textShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
                '@keyframes textShimmer': {
                  '0%, 100%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                },
              }}
            >
              TrustMed-AI Chat
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                maxWidth: 600, 
                mx: 'auto',
                color: 'rgba(255, 255, 255, 0.8)',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                fontWeight: 400,
              }}
            >
              Advanced AI-powered medical intelligence system ready to assist with healthcare queries and medical insights.
            </Typography>

            {/* Cyberpunk Medical Disclaimer */}
            <Paper
              sx={{
                mb: 4,
                maxWidth: 700,
                mx: 'auto',
                p: 3,
                background: 'rgba(255, 0, 110, 0.1)',
                border: '1px solid rgba(255, 0, 110, 0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(15px)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '16px',
                  background: 'linear-gradient(45deg, rgba(255, 0, 110, 0.05), rgba(124, 58, 237, 0.05))',
                  zIndex: -1,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <WarningIcon sx={{ color: '#ff006e', fontSize: 28 }} />
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    color: '#ff006e',
                    textShadow: '0 0 15px rgba(255, 0, 110, 0.4)',
                  }}
                >
                  TrustMed-AI Health Advisory
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                  textShadow: '0 0 10px rgba(255, 0, 110, 0.2)',
                }}
              >
                TrustMed-AI Chat provides educational medical information based on comprehensive AI analysis from verified medical sources. 
                Always consult certified healthcare professionals for medical diagnosis, treatment, and professional medical advice.
              </Typography>
            </Paper>

            {/* Neon Sample Questions */}
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              sx={{ 
                mb: 3,
                color: '#00d4ff',
                textShadow: '0 0 30px rgba(0, 212, 255, 0.6)',
              }}
            >
              Initialize Query Protocol:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 900, mx: 'auto' }}>
              {sampleQuestions.map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  onClick={() => handleSampleQuestion(question)}
                  sx={{
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(15px)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    padding: '12px 16px',
                    height: 'auto',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 212, 255, 0.2)',
                      borderColor: 'rgba(0, 212, 255, 0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          /* Messages */
          messages.map(renderMessage)
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Modern Input Area */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, rgba(17, 25, 40, 0.98) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), rgba(255, 0, 110, 0.5), transparent)',
            animation: 'inputShimmer 3s ease-in-out infinite',
            '@keyframes inputShimmer': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 1 },
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            ref={inputRef}
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask TrustMed-AI anything about health and medicine..."
            variant="outlined"
            fullWidth
            disabled={chatMutation.isPending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px)',
                color: '#ffffff',
                fontSize: '0.95rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 212, 255, 0.4)',
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.08)',
                  '& fieldset': {
                    borderColor: 'rgba(0, 212, 255, 0.6)',
                    borderWidth: '1px',
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  },
                },
              },
              '& .MuiInputBase-input': {
                color: '#ffffff',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontStyle: 'normal',
                },
              },
            }}
          />
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || chatMutation.isPending}
            sx={{
              p: 1.5,
              borderRadius: '14px',
              background: chatMutation.isPending 
                ? 'rgba(60, 60, 80, 0.5)'
                : 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #ff006e 100%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                transition: 'left 0.6s',
              },
              '&:hover:not(:disabled)': {
                boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4), 0 0 20px rgba(255, 0, 110, 0.2)',
                transform: 'translateY(-2px) scale(1.02)',
                '&::before': {
                  left: '100%',
                },
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(0) scale(0.98)',
              },
              '&:disabled': {
                background: 'rgba(60, 60, 80, 0.3)',
                color: 'rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(60, 60, 80, 0.3)',
                cursor: 'not-allowed',
              },
            }}
          >
            {chatMutation.isPending ? (
              <CircularProgress 
                size={20} 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  '& circle': {
                    strokeLinecap: 'round',
                  },
                }} 
              />
            ) : (
              <SendIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>
        
        <Typography
          variant="body2"
          sx={{ 
            display: 'block', 
            mt: 1.5, 
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          Press Enter to send • Shift + Enter for new line • AI responses powered by TrustMed neural architecture
        </Typography>
      </Paper>
    </Box>
  </Container>
  );
}