'use client';

import { ChatInterface } from '../../components/chat/ChatInterface';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

function ChatPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  return <ChatInterface initialMessage={initialQuery} />;
}

function LoadingFallback() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function Chat() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChatPage />
    </Suspense>
  );
}
