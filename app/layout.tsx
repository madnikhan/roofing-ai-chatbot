import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';
import ChatWidget from '@/components/ChatWidget';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Roofing AI Chatbot - Professional Roofing Assistant',
    template: '%s | Roofing AI Chatbot',
  },
  description: 'AI-powered chatbot for roofing companies with emergency detection and lead qualification. Get instant help with your roofing needs 24/7.',
  keywords: [
    'roofing',
    'chatbot',
    'AI assistant',
    'roofing emergency',
    'roof repair',
    'roofing services',
    'lead qualification',
    'roofing contractor',
    'roof inspection',
    'roofing quote',
  ],
  authors: [{ name: 'Roofing AI Chatbot' }],
  creator: 'Roofing AI Chatbot',
  publisher: 'Roofing AI Chatbot',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Roofing AI Chatbot',
    title: 'Roofing AI Chatbot - Professional Roofing Assistant',
    description: 'AI-powered chatbot for roofing companies with emergency detection and lead qualification. Get instant help with your roofing needs 24/7.',
    // Add og-image.png (1200x630 pixels) to /public folder when ready
    // images: [
    //   {
    //     url: '/og-image.png',
    //     width: 1200,
    //     height: 630,
    //     alt: 'Roofing AI Chatbot',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofing AI Chatbot - Professional Roofing Assistant',
    description: 'AI-powered chatbot for roofing companies with emergency detection and lead qualification.',
    // Add og-image.png to /public folder when ready
    // images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Icons - Add these files to /public folder when ready:
  // - icon-192x192.png (192x192 pixels)
  // - icon-512x512.png (512x512 pixels)
  // - apple-icon.png (180x180 pixels)
  // icons: {
  //   icon: [
  //     { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
  //     { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
  //   ],
  //   apple: [
  //     { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  //   ],
  // },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#2563eb' },
      { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
    ],
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Roofing AI" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundaryWrapper>
          {children}
          {/* Chat Widget - Available on all pages */}
          <ChatWidget />
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}

