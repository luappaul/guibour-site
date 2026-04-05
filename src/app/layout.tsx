import type { Metadata } from 'next';
import './globals.css';

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
  themeColor: '#00C8BE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="W.O.W" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Viewport — full screen on mobile, no zoom */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* Theme color for browser chrome */}
        <meta name="theme-color" content="#00C8BE" />
        <meta name="msapplication-TileColor" content="#1A3F78" />

        {/* Preconnect pour Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Luckiest+Guy&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        {/* Plausible Analytics — privacy-first, no cookies */}
        <script
          defer
          data-domain="guibour.fr"
          src="https://plausible.io/js/script.js"
        />
      </body>
    </html>
  );
}
