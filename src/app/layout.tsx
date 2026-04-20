import type { Metadata, Viewport } from 'next';
import './globals.css';
import GuibourChat from '@/components/ui/GuibourChat';
import CursorParticles from '@/components/ui/CursorParticles';
import ClickRipple from '@/components/ui/ClickRipple';
import PageTransition from '@/components/ui/PageTransition';
import VisitorCounter from '@/components/ui/VisitorCounter';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#00C8BE',
};

export const metadata: Metadata = {
  title: 'GUIBOUR SYSTEM — W.O.W 2026',
  description: 'GUIBOUR SYSTEM — Work Or Window. Le jeu bureaucratique le plus absurde du web. Survivez aux 25 étages de dossiers volants.',
  metadataBase: new URL('https://guibour.fr'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'W.O.W',
  },
  openGraph: {
    title: 'GUIBOUR SYSTEM — W.O.W 2026',
    description: 'Work Or Window — Survivez aux 25 étages de dossiers volants dans un open space Excel. Jeu de tir bureaucratique.',
    url: 'https://guibour.fr',
    siteName: 'GUIBOUR SYSTEM',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GUIBOUR SYSTEM W.O.W' }],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GUIBOUR SYSTEM — W.O.W 2026',
    description: 'Work Or Window — Survivez aux 25 étages de dossiers volants dans un open space Excel.',
    images: ['/og-image.png'],
  },
  keywords: ['jeu', 'game', 'guibour', 'bureaucratie', 'WOW', 'work or window', 'excel', 'open space'],
  authors: [{ name: 'Guibour', url: 'https://guibour.fr' }],
  robots: 'index, follow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon-globe.svg" />

        {/* Preconnect pour Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Luckiest+Guy&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
        <PageTransition>
        {children}
        </PageTransition>
        {/* Plausible Analytics — privacy-first, no cookies */}
        <script
          defer
          data-domain="guibour.fr"
          src="https://plausible.io/js/script.js"
        />
      <VisitorCounter />
      <ClickRipple />
      <CursorParticles />
      <GuibourChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
