'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Fade,
  Tooltip,
  Link,
  Button,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  CheckCircle as CheckIcon,
  AddComment as NewChatIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  VolumeUp as VolumeIcon,
  MedicalServices as MedicalIcon,
  Verified as VerifiedIcon,
  OpenInNew as OpenInNewIcon,
  Bolt as BoltIcon,
  AutoAwesome as DemoIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../../lib/api';
import { MedicalLink, TrustMedQueryResponse } from '@/types';
import { DoctorAnimationMode, DoctorAvatar3D } from './DoctorAvatar3D';

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

const suggestionChips = [
  { emoji: '🩺', text: 'Symptoms of diabetes' },
  { emoji: '💊', text: 'Hypertension treatment' },
  { emoji: '🧠', text: 'Migraine causes' },
  { emoji: '❤️', text: 'Heart disease risks' },
  { emoji: '🫁', text: 'Asthma management' },
  { emoji: '🦴', text: 'Arthritis types' },
];

const demoAssistantSources: MedicalLink[] = [
  {
    title: 'Heart disease symptoms and causes',
    url: 'https://www.mayoclinic.org/diseases-conditions/heart-disease/symptoms-causes/syc-20353118',
    source_type: 'diseases',
    relevance_score: 0.91,
  },
  {
    title: 'High blood pressure treatment',
    url: 'https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/diagnosis-treatment/drc-20373417',
    source_type: 'medicine',
    relevance_score: 0.86,
  },
];

const demoAssistantAnswer = `Heart disease risk is influenced by several clinical and lifestyle factors:

- Age increases risk, especially for men after 45 and women after 55.
- Family history can make heart disease more likely.
- High blood pressure, high cholesterol, diabetes, and obesity are major contributors.
- Smoking, physical inactivity, poor diet, and chronic stress can worsen cardiovascular risk.
- Managing blood pressure and cholesterol early can reduce long-term complications.

The most useful next step is to track blood pressure, review family history, and discuss personalized screening with a clinician.`;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function TypingDots() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
      <Box sx={{ display: 'flex', gap: 0.75 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#2563eb',
              opacity: 0.5,
              animation: 'typingBounce 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
              '@keyframes typingBounce': {
                '0%,60%,100%': { transform: 'translateY(0)', opacity: 0.3 },
                '30%': { transform: 'translateY(-7px)', opacity: 1 },
              },
            }}
          />
        ))}
      </Box>
      <Typography sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
        TrustMed AI is thinking...
      </Typography>
    </Box>
  );
}

function ChatAmbientBackdrop() {
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
          'linear-gradient(135deg, rgba(239,246,255,0.92) 0%, rgba(255,255,255,0.72) 45%, rgba(236,254,255,0.62) 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-40px',
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.085) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.085) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.82), rgba(0,0,0,0.28), rgba(0,0,0,0.72))',
          animation: 'trustmedGridDrift 30s linear infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(115deg, rgba(37,99,235,0.10), transparent 30%, rgba(6,182,212,0.12) 58%, transparent 82%)',
          animation: 'trustmedLightSweep 12s ease-in-out infinite alternate',
        },
        '@keyframes trustmedGridDrift': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(44px, 44px, 0)' },
        },
        '@keyframes trustmedLightSweep': {
          '0%': { opacity: 0.35, transform: 'translateX(-4%)' },
          '100%': { opacity: 0.85, transform: 'translateX(4%)' },
        },
      }}
    />
  );
}

function getSourcePalette(sourceType?: string) {
  if (sourceType === 'medicine') {
    return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Medicine' };
  }
  if (sourceType === 'diseases') {
    return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Disease' };
  }
  if (sourceType === 'symptoms') {
    return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Symptom' };
  }
  return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Clinical' };
}

function getGenerationDelay(token: string) {
  if (/[.!?]\s*$/.test(token)) return 135;
  if (/[,;:]\s*$/.test(token)) return 75;
  if (/\n/.test(token)) return 90;
  return 34;
}

function useGeneratedText(content: string, enabled: boolean) {
  const [displayedContent, setDisplayedContent] = useState(enabled ? '' : content);
  const [isComplete, setIsComplete] = useState(!enabled);

  useEffect(() => {
    if (!enabled || !content) {
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }

    const tokens = content.match(/\S+\s*/g) || [];
    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    setDisplayedContent('');
    setIsComplete(false);

    const revealNextToken = () => {
      index += 1;
      setDisplayedContent(tokens.slice(0, index).join(''));

      if (index >= tokens.length) {
        setIsComplete(true);
        return;
      }

      timeoutId = setTimeout(revealNextToken, getGenerationDelay(tokens[index - 1]));
    };

    timeoutId = setTimeout(revealNextToken, 160);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [content, enabled]);

  return { displayedContent, isComplete };
}

function AnimatedMarkdownResponse({ content, isGenerating }: { content: string; isGenerating: boolean }) {
  return (
    <>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p style={{ margin: '0 0 0.42rem 0' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '0.08rem 0 0.42rem 0', padding: 0 }}>{children}</ul>,
          li: ({ children }) => <li style={{ margin: '0 0 0.16rem 0' }}>{children}</li>,
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          h2: ({ children }) => (
            <h2 style={{ margin: '0.7rem 0 0.3rem', fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.28 }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ margin: '0.65rem 0 0.28rem', fontSize: '1rem', fontWeight: 750, lineHeight: 1.28 }}>
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isGenerating && (
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 7,
            height: 18,
            ml: 0.25,
            mb: -0.3,
            borderRadius: '999px',
            bgcolor: '#2563eb',
            animation: 'generatedCursorBlink 0.9s ease-in-out infinite',
            '@keyframes generatedCursorBlink': {
              '0%,100%': { opacity: 0.15 },
              '50%': { opacity: 1 },
            },
          }}
        />
      )}
    </>
  );
}

function MessageBubble({
  message,
  onSpeak,
  isSpeaking,
}: {
  message: Message;
  onSpeak: (message: Message) => void;
  isSpeaking: boolean;
}) {
  const isUser = message.type === 'user';
  const [copied, setCopied] = useState(false);
  const shouldGenerateText = !isUser && !message.isTyping && Boolean(message.content);
  const { displayedContent, isComplete: isGenerationComplete } = useGeneratedText(message.content, shouldGenerateText);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Fade in timeout={250}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 3,
          alignItems: 'flex-start',
          gap: 1.5,
          px: 2,
        }}
      >
        {!isUser && (
          <Box
            sx={{
              width: 48,
              height: 48,
              mt: 0.25,
              flexShrink: 0,
              borderRadius: '18px',
              background: 'linear-gradient(145deg, #2563eb 0%, #06b6d4 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 16px 32px rgba(37,99,235,0.24)',
              border: '1px solid rgba(255,255,255,0.72)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: -5,
                borderRadius: '22px',
                border: '1px solid rgba(37,99,235,0.18)',
                animation: 'assistantIconPulse 2.4s ease-in-out infinite',
              },
              '@keyframes assistantIconPulse': {
                '0%,100%': { opacity: 0.45, transform: 'scale(0.98)' },
                '50%': { opacity: 0.95, transform: 'scale(1.08)' },
              },
            }}
          >
            <MedicalIcon sx={{ fontSize: 24 }} />
          </Box>
        )}

        <Box sx={{ maxWidth: { xs: '86%', md: isUser ? '72%' : '82%' }, minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: isUser ? 2 : { xs: 2.25, md: 3 },
              bgcolor: isUser ? '#2563eb' : 'rgba(255,255,255,0.94)',
              background: isUser
                ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.92) 100%)',
              borderRadius: isUser ? '20px 20px 6px 20px' : '24px 24px 24px 8px',
              border: isUser ? 'none' : '1px solid rgba(191,219,254,0.9)',
              backdropFilter: isUser ? 'none' : 'blur(16px)',
              boxShadow: isUser
                ? '0 4px 16px rgba(37,99,235,0.28)'
                : '0 18px 48px rgba(37,99,235,0.12)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': !isUser
                ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #2563eb, #06b6d4, #22c55e)',
                  }
                : undefined,
            }}
          >
            {message.isTyping ? (
              <TypingDots />
            ) : (
              <>
                <Typography
                  component="div"
                  sx={{
                    color: isUser ? '#ffffff' : '#1e293b',
                    lineHeight: 1.58,
                    fontSize: isUser ? '1rem' : '1.02rem',
                    wordBreak: 'break-word',
                    letterSpacing: 0,
                    '& strong': { fontWeight: 700 },
                    '& p:last-child': { mb: 0 },
                    '& ul:last-child': { mb: 0 },
                    '& ul': {
                      listStyle: 'none',
                    },
                    '& li': {
                      position: 'relative',
                      pl: '1.35rem',
                    },
                    '& li:last-child': {
                      mb: 0,
                    },
                    '& li::before': {
                      content: '""',
                      position: 'absolute',
                      left: 2,
                      top: '0.68em',
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                      boxShadow: '0 0 0 3px rgba(37,99,235,0.10)',
                    },
                  }}
                >
                  {isUser ? message.content : (
                    <AnimatedMarkdownResponse
                      content={displayedContent}
                      isGenerating={shouldGenerateText && !isGenerationComplete}
                    />
                  )}
                </Typography>

                {/* Sources */}
                {isGenerationComplete && message.sources && message.sources.length > 0 && (
                  <Box sx={{ mt: 2.75, pt: 2.25, borderTop: '1px solid rgba(226,232,240,0.9)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #eff6ff, #ecfeff)',
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        <VerifiedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#0f172a', fontSize: '0.84rem', fontWeight: 850, letterSpacing: 0 }}>
                          Verified Sources
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', lineHeight: 1.2 }}>
                          Retrieval-backed references used for this answer
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
                      {message.sources.map((link, idx) => {
                        const palette = getSourcePalette(link.source_type);
                        const title = link.title || link.source_type || 'Medical Resource';

                        return (
                          <Link
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.25,
                              minWidth: 0,
                              p: 1.25,
                              borderRadius: '16px',
                              textDecoration: 'none',
                              bgcolor: 'rgba(248,250,252,0.82)',
                              border: '1px solid #e2e8f0',
                              color: '#334155',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: palette.bg,
                                borderColor: palette.border,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 14px 28px ${palette.color}1f`,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                color: palette.color,
                                bgcolor: palette.bg,
                                border: `1px solid ${palette.border}`,
                                fontWeight: 850,
                                fontSize: '0.82rem',
                              }}
                            >
                              {idx + 1}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  color: '#1e293b',
                                  fontSize: '0.9rem',
                                  fontWeight: 750,
                                  lineHeight: 1.25,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {title}
                              </Typography>
                              <Typography sx={{ color: palette.color, fontSize: '0.72rem', fontWeight: 750, mt: 0.25 }}>
                                {palette.label} reference
                              </Typography>
                            </Box>
                            <OpenInNewIcon sx={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }} />
                          </Link>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Metadata chips */}
                {!isUser && isGenerationComplete && (
                  <Box sx={{ mt: 1.75, display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                    {message.confidence !== undefined && (
                      <Chip
                        icon={<BoltIcon sx={{ fontSize: '15px !important', color: 'inherit !important' }} />}
                        label={`${(message.confidence * 100).toFixed(0)}% confidence`}
                        size="small"
                        sx={{
                          height: 30,
                          fontSize: '0.8125rem',
                          fontWeight: 750,
                          bgcolor: message.confidence > 0.7 ? '#f0fdf4' : message.confidence > 0.4 ? '#fffbeb' : '#fef2f2',
                          color: message.confidence > 0.7 ? '#16a34a' : message.confidence > 0.4 ? '#d97706' : '#dc2626',
                          border: `1px solid ${message.confidence > 0.7 ? '#bbf7d0' : message.confidence > 0.4 ? '#fde68a' : '#fecaca'}`,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    )}
                    {message.intent && (
                      <Chip
                        label={message.intent}
                        size="small"
                        sx={{
                          height: 28,
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          bgcolor: '#f5f3ff',
                          color: '#7c3aed',
                          border: '1px solid #ddd6fe',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    )}
                    {message.sourcesCount !== undefined && message.sourcesCount > 0 && (
                      <Chip
                        label={`${message.sourcesCount} sources`}
                        size="small"
                        sx={{
                          height: 28,
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    )}
                    {message.responseTime !== undefined && (
                      <Chip
                        label={`${(message.responseTime / 1000).toFixed(1)}s`}
                        size="small"
                        sx={{
                          height: 28,
                          fontSize: '0.8125rem',
                          bgcolor: '#f8fafc',
                          color: '#94a3b8',
                          border: '1px solid #e2e8f0',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    )}
                    <Tooltip title={isSpeaking ? 'Playing audio...' : 'Listen to response'} placement="top">
                      <IconButton
                        size="small"
                        onClick={() => onSpeak(message)}
                        disabled={isSpeaking}
                        sx={{
                          width: 28,
                          height: 28,
                          color: isSpeaking ? '#2563eb' : '#cbd5e1',
                          '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' },
                          '&.Mui-disabled': { color: '#93c5fd' },
                        }}
                      >
                        {isSpeaking ? (
                          <CircularProgress size={14} sx={{ color: '#2563eb' }} />
                        ) : (
                          <VolumeIcon sx={{ fontSize: 15 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={copied ? 'Copied!' : 'Copy response'} placement="top">
                      <IconButton
                        size="small"
                        onClick={handleCopy}
                        sx={{
                          width: 28,
                          height: 28,
                          ml: 'auto',
                          color: copied ? '#16a34a' : '#cbd5e1',
                          '&:hover': { color: '#64748b', bgcolor: '#f1f5f9' },
                        }}
                      >
                        {copied ? <CheckIcon sx={{ fontSize: 15 }} /> : <CopyIcon sx={{ fontSize: 15 }} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </>
            )}
          </Paper>

          <Typography
            sx={{
              display: 'block',
              mt: 0.5,
              textAlign: isUser ? 'right' : 'left',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              px: 0.75,
            }}
          >
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>

        {isUser && (
          <Box
            sx={{
              width: 40,
              height: 40,
              mt: 0.25,
              flexShrink: 0,
              bgcolor: '#475569',
              color: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ fontSize: 20 }} />
          </Box>
        )}
      </Box>
    </Fade>
  );
}

export function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(initialMessage || '');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialSentRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      activeAudioRef.current?.pause();
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    };
  }, []);

  const { data: healthStatus, isError: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: apiService.healthCheck,
    refetchInterval: 30000,
    retry: 1,
  });

  const chatMutation = useMutation({
    mutationFn: (query: string) => apiService.medicalQuery(query),
    onSuccess: (response: TrustMedQueryResponse) => {
      setMessages((prev) =>
        prev.map((msg) =>
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
        )
      );
    },
    onError: (error: unknown) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isTyping
            ? {
                ...msg,
                content: `Sorry, I encountered an error: ${getErrorMessage(error)}. Please check that the backend server is running and try again.`,
                isTyping: false,
              }
            : msg
        )
      );
    },
  });

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      const typingMsg: Message = {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, userMsg, typingMsg]);
      chatMutation.mutate(text.trim());
      setInputValue('');
    },
    [chatMutation]
  );

  useEffect(() => {
    if (initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleDemoResponse = () => {
    setMessages([
      {
        id: `demo-user-${Date.now()}`,
        type: 'user',
        content: 'What are the key risks for heart disease?',
        timestamp: new Date(),
      },
      {
        id: `demo-ai-${Date.now()}`,
        type: 'assistant',
        content: demoAssistantAnswer,
        timestamp: new Date(),
        sources: demoAssistantSources,
        confidence: 0.88,
        intent: 'clinical_background',
        responseTime: 2400,
        sourcesCount: demoAssistantSources.length,
      },
    ]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const showAssistantNotice = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `notice-${Date.now()}`,
        type: 'assistant',
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showAssistantNotice('Voice input is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const result = await apiService.speechToText(audioBlob);
          setInputValue(result.transcript);
          inputRef.current?.focus();
        } catch (error: unknown) {
          showAssistantNotice(`Voice transcription failed: ${getErrorMessage(error)}`);
        } finally {
          setIsTranscribing(false);
          mediaRecorderRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error: unknown) {
      showAssistantNotice(`Microphone access failed: ${getErrorMessage(error)}`);
      setIsRecording(false);
    }
  }, [showAssistantNotice]);

  const handleVoiceInput = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleSpeak = useCallback(async (message: Message) => {
    if (!message.content || message.isTyping) return;

    try {
      activeAudioRef.current?.pause();
      setSpeakingMessageId(message.id);
      const audioBlob = await apiService.textToSpeech(message.content);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setSpeakingMessageId(null);
        activeAudioRef.current = null;
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setSpeakingMessageId(null);
        activeAudioRef.current = null;
        showAssistantNotice('Audio playback failed.');
      };

      await audio.play();
    } catch (error: unknown) {
      setSpeakingMessageId(null);
      showAssistantNotice(`Text-to-speech failed: ${getErrorMessage(error)}`);
    }
  }, [showAssistantNotice]);

  const isOnline = !healthError && healthStatus?.status === 'healthy';
  const doctorMode: DoctorAnimationMode = speakingMessageId
    ? 'speaking'
    : isRecording || isTranscribing
      ? 'recording'
      : chatMutation.isPending
        ? 'thinking'
        : 'idle';

  return (
    <Box
      className="relative h-full overflow-hidden rounded-[24px]"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        bgcolor: 'rgba(255,255,255,0.72)',
        borderRadius: '24px',
        border: '1px solid rgba(191,219,254,0.92)',
        overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(15,23,42,0.10)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <ChatAmbientBackdrop />

      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(219,234,254,0.85)',
          bgcolor: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(18px)',
          flexShrink: 0,
          minHeight: 72,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src="/ChatBotIcon.png"
            alt="TrustMed-AI"
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '2px solid #dbeafe',
              boxShadow: '0 2px 10px rgba(37,99,235,0.18)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isOnline ? '#16a34a' : '#dc2626',
              border: '2px solid #ffffff',
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2, fontSize: '1.18rem', letterSpacing: 0 }}>
            TrustMed-AI Assistant
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mt: 0.25 }}>
            {isOnline ? 'Clinical RAG assistant · Voice enabled · Online' : 'Offline · Check backend connection'}
          </Typography>
        </Box>

        {/* Powered by badge */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.625,
            borderRadius: '20px',
            bgcolor: 'rgba(254,242,242,0.88)',
            border: '1px solid #fecaca',
            boxShadow: '0 8px 24px rgba(220,38,38,0.08)',
          }}
        >
          <Box
            component="img"
            src="/LOGO_doctor.png"
            alt="Mayo Clinic"
            sx={{ width: 18, height: 18, borderRadius: '50%' }}
          />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#dc2626' }}>
            Powered by Mayo Clinic
          </Typography>
        </Box>

        <Tooltip title="Preview answer styling">
          <Button
            size="small"
            startIcon={<DemoIcon sx={{ fontSize: 16 }} />}
            onClick={handleDemoResponse}
            sx={{
              display: { xs: 'none', lg: 'inline-flex' },
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#0e7490',
              border: '1px solid #a5f3fc',
              px: 1.5,
              py: 0.75,
              textTransform: 'none',
              bgcolor: 'rgba(236,254,255,0.78)',
              '&:hover': {
                bgcolor: '#ecfeff',
                borderColor: '#67e8f9',
                boxShadow: '0 10px 22px rgba(6,182,212,0.12)',
              },
            }}
          >
            Demo Response
          </Button>
        </Tooltip>

        {/* New Chat button */}
        <Tooltip title="New conversation">
          <Button
            size="small"
            startIcon={<NewChatIcon sx={{ fontSize: 16 }} />}
            onClick={handleNewChat}
            sx={{
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#475569',
              border: '1px solid #cbd5e1',
              px: 1.5,
              py: 0.75,
              textTransform: 'none',
              bgcolor: 'rgba(255,255,255,0.76)',
              '&:hover': { bgcolor: '#eff6ff', borderColor: '#93c5fd', color: '#2563eb' },
            }}
          >
            New Chat
          </Button>
        </Tooltip>

        {messages.length > 0 && (
          <Tooltip title="Clear chat">
            <IconButton
              size="small"
              onClick={handleNewChat}
              sx={{ color: '#cbd5e1', width: 36, height: 36, '&:hover': { color: '#dc2626', bgcolor: '#fef2f2' } }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Messages area */}
      <Box
        className="relative"
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 3,
          minHeight: 0,
          bgcolor: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 3, md: 5, lg: 7 },
              py: 4,
              textAlign: { xs: 'center', lg: 'left' },
              position: 'relative',
              gap: { xs: 3, lg: 6 },
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', lg: '52%' },
                maxWidth: 620,
                order: { xs: 2, lg: 1 },
              }}
            >
              <Chip
                label={isOnline ? 'Doctor mode online' : 'Doctor mode offline'}
                size="small"
                sx={{
                  mb: 1.5,
                  bgcolor: isOnline ? 'rgba(240,253,244,0.92)' : 'rgba(254,242,242,0.92)',
                  color: isOnline ? '#15803d' : '#b91c1c',
                  border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}`,
                  fontWeight: 800,
                }}
              />

              <Typography
                variant="h4"
                sx={{
                  color: '#0f172a',
                  fontWeight: 850,
                  mb: 1.25,
                  fontSize: { xs: '1.8rem', md: '2.25rem' },
                  letterSpacing: 0,
                  maxWidth: 560,
                  mx: { xs: 'auto', lg: 0 },
                }}
              >
                Talk to your AI medical guide
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                  mb: 4,
                  maxWidth: 540,
                  mx: { xs: 'auto', lg: 0 },
                  lineHeight: 1.75,
                  fontSize: '1.02rem',
                }}
              >
                Ask symptoms, conditions, medicines, or follow-up questions. I&apos;ll answer with retrieval-backed
                sources, voice support, and a clear next-step summary.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 1.25,
                  width: '100%',
                  maxWidth: 560,
                  mx: { xs: 'auto', lg: 0 },
                }}
              >
                {suggestionChips.map((chip) => (
                <Box
                  key={chip.text}
                  onClick={() => sendMessage(chip.text)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 2.5,
                    py: 1.5,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.78)',
                    border: '1.5px solid rgba(191,219,254,0.82)',
                    backdropFilter: 'blur(14px)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                    boxShadow: '0 10px 24px rgba(37,99,235,0.06)',
                    '&:hover': {
                      bgcolor: 'rgba(239,246,255,0.95)',
                      borderColor: '#93c5fd',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 16px 36px rgba(37,99,235,0.14)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>
                    {chip.emoji}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: '#334155', lineHeight: 1.4 }}>
                    {chip.text}
                  </Typography>
                </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                width: { xs: '100%', lg: '48%' },
                minHeight: { xs: 320, md: 440, lg: 650 },
                order: { xs: 1, lg: 2 },
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: { xs: 280, md: 430, lg: 560 },
                  height: { xs: 280, md: 430, lg: 560 },
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(191,219,254,0.72), rgba(219,234,254,0.18) 58%, transparent 70%)',
                  filter: 'blur(2px)',
                  animation: 'doctorHeroAura 4.8s ease-in-out infinite',
                  pointerEvents: 'none',
                },
                '@keyframes doctorHeroAura': {
                  '0%,100%': { transform: 'scale(0.96)', opacity: 0.7 },
                  '50%': { transform: 'scale(1.06)', opacity: 1 },
                },
              }}
            >
              <DoctorAvatar3D size="min(52vw, 720px)" mode="idle" framed={false} interactive />
            </Box>
          </Box>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onSpeak={handleSpeak}
                isSpeaking={speakingMessageId === msg.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input area */}
      <Box
        sx={{
          px: 2.5,
          pt: messages.length > 0 ? 4.25 : 2,
          pb: 2,
          borderTop: '1px solid rgba(219,234,254,0.9)',
          bgcolor: 'rgba(255,255,255,0.9)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(18px)',
        }}
      >
        {messages.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 18, sm: 28 },
              top: -36,
              width: 86,
              height: 86,
              zIndex: 3,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 16px 24px rgba(37,99,235,0.18))',
              animation: 'smallDoctorStand 2.8s ease-in-out infinite',
              '@keyframes smallDoctorStand': {
                '0%,100%': { transform: 'translateY(0) rotate(-1deg)' },
                '50%': { transform: 'translateY(-8px) rotate(1deg)' },
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 15,
                right: 15,
                bottom: 7,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'rgba(37,99,235,0.14)',
                filter: 'blur(5px)',
                zIndex: -1,
              },
            }}
          >
            <DoctorAvatar3D size={86} compact mode={doctorMode} framed={false} />
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <Box
            sx={{
              position: 'relative',
              flex: 1,
              minWidth: 0,
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              maxRows={5}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'Listening...' : isTranscribing ? 'Transcribing voice...' : 'Ask a medical question...'}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '18px',
                  bgcolor: 'rgba(248,250,252,0.96)',
                  fontSize: '1rem',
                  py: 0.5,
                  pl: 1,
                  minHeight: 48,
                  alignItems: 'center',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused': {
                    bgcolor: '#ffffff',
                    boxShadow: '0 0 0 5px rgba(37,99,235,0.08)',
                  },
                  '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '2px' },
                },
                '& .MuiInputBase-input': {
                  color: '#0f172a',
                  fontSize: '1rem',
                  '&::placeholder': { color: '#94a3b8' },
                },
                '& textarea': {
                  lineHeight: 1.5,
                  py: 0.5,
                },
              }}
            />
          </Box>
          <Tooltip title={isRecording ? 'Stop recording' : 'Ask by voice'}>
            <IconButton
              onClick={handleVoiceInput}
              disabled={isTranscribing || chatMutation.isPending}
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                bgcolor: isRecording ? '#dc2626' : '#f8fafc',
                color: isRecording ? '#ffffff' : '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                transition: 'all 0.15s ease',
                boxShadow: isRecording ? '0 12px 26px rgba(220,38,38,0.22)' : '0 8px 18px rgba(15,23,42,0.05)',
                '&:hover': {
                  bgcolor: isRecording ? '#b91c1c' : '#eff6ff',
                  color: isRecording ? '#ffffff' : '#2563eb',
                  borderColor: isRecording ? '#b91c1c' : '#bfdbfe',
                },
                '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' },
              }}
            >
              {isTranscribing ? (
                <CircularProgress size={18} sx={{ color: '#94a3b8' }} />
              ) : isRecording ? (
                <StopIcon sx={{ fontSize: 20 }} />
              ) : (
                <MicIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || chatMutation.isPending || isRecording || isTranscribing}
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              bgcolor: inputValue.trim() && !chatMutation.isPending ? '#2563eb' : '#f1f5f9',
              color: inputValue.trim() && !chatMutation.isPending ? '#ffffff' : '#cbd5e1',
              borderRadius: '16px',
              transition: 'all 0.15s ease',
              boxShadow: inputValue.trim() && !chatMutation.isPending ? '0 14px 28px rgba(37,99,235,0.24)' : 'none',
              '&:hover': {
                bgcolor: inputValue.trim() ? '#1d4ed8' : '#f1f5f9',
                transform: inputValue.trim() ? 'scale(1.05)' : 'none',
              },
              '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' },
            }}
          >
            {chatMutation.isPending ? (
              <CircularProgress size={18} sx={{ color: '#94a3b8' }} />
            ) : (
              <SendIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>
        <Typography sx={{ color: '#cbd5e1', fontSize: '0.8rem', mt: 0.75, display: 'block', textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line · Mic to ask by voice
        </Typography>
      </Box>
    </Box>
  );
}
