// 'use client';

import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Footer } from '@/components/layout/footer';
import { TopLoader } from '@/components/layout/top-loader';
import { LanguageProvider } from '@/components/layout/language-provider';
import { Suspense } from 'react';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | IsabiFine AI',
    default: 'IsabiFine AI - Your Health Companion in Nigeria',
  },
  description: 'Quickly find health facilities, get AI-powered health insights, and manage your health journey in Nigeria. Your reliable health partner.',
  keywords: ['health nigeria', 'find hospital nigeria', 'ai health assistant', 'emergency services nigeria', 'isabifine', 'health facilities', 'medical help'],
  authors: [{ name: 'IsabiFine AI Team' }],
  openGraph: {
    title: 'IsabiFine AI - Your Health Companion in Nigeria',
    description: 'Quickly find health facilities, get AI-powered health insights, and manage your health journey in Nigeria. Your reliable health partner.',
    url: 'https://isabifine.ai',
    siteName: 'IsabiFine AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IsabiFine AI navigating health facilities on a map.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IsabiFine AI - Your Health Companion in Nigeria',
    description: 'Quickly find health facilities, get AI-powered health insights, and manage your health journey in Nigeria. Your reliable health partner.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <LanguageProvider>
          <TopLoader />
          <Suspense fallback={<div className="h-1 w-full bg-gray-200 animate-pulse" />}>
            <div className="flex-grow">
              {children}
            </div>
          </Suspense>
          <Footer />
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
