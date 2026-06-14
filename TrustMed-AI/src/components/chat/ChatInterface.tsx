'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Fade,
  Tooltip,
  Link,
  Button,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  WarningAmber as WarningIcon,
  CheckCircle as CheckIcon,
  AddComment as NewChatIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../../lib/api';
import { MedicalLink, ReActStep, TrustMedQueryResponse } from '@/types';
import { RobotAnimationMode, RobotAvatar3D } from './RobotAvatar3D';

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
  reactTrace?: ReActStep[];
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

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/###\s(.*?)$/gm, '<h4 style="margin:14px 0 6px;color:#1d4ed8;font-size:1rem;font-weight:700">$1</h4>')
    .replace(/##\s(.*?)$/gm, '<h3 style="margin:16px 0 8px;color:#1d4ed8;font-weight:700;font-size:1.05rem">$1</h3>')
    .replace(/^-\s(.+)$/gm, '<li style="margin:4px 0;padding-left:4px;color:#334155">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin:10px 0;padding-left:22px">$&</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
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
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mt: 0.25,
              flexShrink: 0,
              bgcolor: '#2563eb',
              boxShadow: '0 2px 10px rgba(37,99,235,0.3)',
            }}
          >
            <AIIcon sx={{ fontSize: 20 }} />
          </Avatar>
        )}

        <Box sx={{ maxWidth: '76%', minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: isUser ? 2 : 2.5,
              bgcolor: isUser ? '#2563eb' : '#ffffff',
              borderRadius: isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
              border: isUser ? 'none' : '1px solid #e2e8f0',
              boxShadow: isUser
                ? '0 4px 16px rgba(37,99,235,0.28)'
                : '0 2px 8px rgba(0,0,0,0.06)',
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
                    lineHeight: 1.7,
                    fontSize: '1rem',
                    wordBreak: 'break-word',
                    '& strong': { fontWeight: 700 },
                    '& h3, & h4': { fontWeight: 700 },
                    '& ul': { listStyle: 'disc' },
                  }}
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                />

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Typography
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        mb: 1,
                        display: 'block',
                      }}
                    >
                      Sources
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {message.sources.map((link, idx) => (
                        <Link
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: '20px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            transition: 'all 0.15s',
                            '&:hover': { bgcolor: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' },
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor:
                                link.source_type === 'medicine' ? '#d97706'
                                : link.source_type === 'diseases' ? '#16a34a'
                                : link.source_type === 'symptoms' ? '#dc2626'
                                : '#2563eb',
                              flexShrink: 0,
                            }}
                          />
                          [{idx + 1}] {link.title?.slice(0, 30) || link.source_type}
                        </Link>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Metadata chips */}
                {!isUser && (
                  <Box sx={{ mt: 1.75, display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                    {message.reactTrace && message.reactTrace.length > 0 && (
                      <Tooltip
                        title={message.reactTrace.map((step) => `${step.thought} ${step.observation}`).join(' ')}
                        placement="top"
                      >
                        <Chip
                          label={`ReAct ${message.reactTrace.map((step) => step.action).join(' -> ')}`}
                          size="small"
                          sx={{
                            height: 28,
                            maxWidth: 280,
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            bgcolor: '#ecfeff',
                            color: '#0e7490',
                            border: '1px solid #a5f3fc',
                            '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                          }}
                        />
                      </Tooltip>
                    )}
                    {message.confidence !== undefined && (
                      <Chip
                        label={`${(message.confidence * 100).toFixed(0)}% confidence`}
                        size="small"
                        sx={{
                          height: 28,
                          fontSize: '0.8125rem',
                          fontWeight: 600,
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
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mt: 0.25,
              flexShrink: 0,
              bgcolor: '#475569',
              color: '#ffffff',
            }}
          >
            <PersonIcon sx={{ fontSize: 20 }} />
          </Avatar>
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
                reactTrace: response.react_trace,
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
  const robotMode: RobotAnimationMode = speakingMessageId
    ? 'speaking'
    : isRecording || isTranscribing
      ? 'recording'
      : chatMutation.isPending
        ? 'thinking'
        : 'idle';

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid #f1f5f9',
          bgcolor: '#ffffff',
          flexShrink: 0,
          minHeight: 72,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <RobotAvatar3D size={48} compact mode={robotMode} />
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
          <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: '1.1rem' }}>
            TrustMed-AI Assistant
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mt: 0.25 }}>
            {isOnline ? 'RAG-powered medical AI · Online' : 'Offline · Check backend connection'}
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
            bgcolor: '#fef2f2',
            border: '1px solid #fecaca',
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
              border: '1px solid #e2e8f0',
              px: 1.5,
              py: 0.75,
              textTransform: 'none',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
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
      <Box sx={{ flex: 1, overflowY: 'auto', py: 3, minHeight: 0, bgcolor: '#f8fafc' }}>
        {messages.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: 3,
              py: 4,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                mb: 3,
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%,100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-10px)' },
                },
              }}
            >
              <RobotAvatar3D size={112} mode={robotMode} />
            </Box>

            <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 700, mb: 1.25, fontSize: '1.5rem' }}>
              How can I help you today?
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: '#64748b', mb: 4, maxWidth: 420, lineHeight: 1.7, fontSize: '1rem' }}
            >
              Ask me about symptoms, conditions, or treatments. I&apos;ll provide AI-powered answers
              with verified sources from Mayo Clinic.
            </Typography>

            {/* 2-column suggestion grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 1.25,
                width: '100%',
                maxWidth: 560,
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
                    borderRadius: '14px',
                    bgcolor: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                    '&:hover': {
                      bgcolor: '#eff6ff',
                      borderColor: '#bfdbfe',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.12)',
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

      {/* Disclaimer bar */}
      <Box
        sx={{
          px: 3,
          py: 1,
          bgcolor: '#fffbeb',
          borderTop: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <WarningIcon sx={{ fontSize: 14, color: '#d97706', flexShrink: 0 }} />
        <Typography sx={{ color: '#92400e', fontSize: '0.8125rem', lineHeight: 1.4 }}>
          For informational purposes only. Not a substitute for professional medical advice. In emergencies, call 911.
        </Typography>
      </Box>

      {/* Input area */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#ffffff', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <Box
            sx={{
              position: 'relative',
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 10,
                bottom: 8,
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              <RobotAvatar3D size={38} compact mode={robotMode} />
            </Box>
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
                  borderRadius: '16px',
                  bgcolor: '#f8fafc',
                  fontSize: '1rem',
                  py: 0.5,
                  pl: '56px',
                  minHeight: 48,
                  alignItems: 'center',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#94a3b8' },
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
                borderRadius: '14px',
                transition: 'all 0.15s ease',
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
              borderRadius: '14px',
              transition: 'all 0.15s ease',
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
