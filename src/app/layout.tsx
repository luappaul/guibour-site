import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GUIBOUR SYSTEM — guibour.fr',
  description: 'GUIBOUR SYSTEM — Le jeu bureaucratique le plus absurde du web. Survivez aux dossiers volants dans un open space Excel.',
  metadataBase: new URL('https://guibour.fr'),
  openGraph: {
    title: 'GUIBOUR SYSTEM — guibour.fr',
    description: 'Survivez aux dossiers volants dans un open space Excel.',
    url: 'https://guibour.fr',
    siteName: 'guibour.fr',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GUIBOUR SYSTEM — guibour.fr',
    description: 'Survivez aux dossiers volants dans un open space Excel.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Oxanium:wght@200;300;400;500;600;700;800&family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
