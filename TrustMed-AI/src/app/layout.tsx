import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TrustMed-AI — Intelligent Medical Assistant',
  description:
    'Source-grounded medical AI assistant with ChromaDB retrieval, FAISS refinement, cross-encoder reranking, voice access, and 3D medical visuals.',
  icons: {
    icon: '/LOGO_doctor.png',
    shortcut: '/LOGO_doctor.png',
    apple: '/LOGO_doctor.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
