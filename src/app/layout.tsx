import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'guibour.fr — Guibureaucracy',
  description: 'Guibureaucracy — Le jeu bureaucratique le plus absurde du web. Survivez aux dossiers volants dans un open space Excel.',
  metadataBase: new URL('https://guibour.fr'),
  openGraph: {
    title: 'guibour.fr — Guibureaucracy',
    description: 'Survivez aux dossiers volants dans un open space Excel.',
    url: 'https://guibour.fr',
    siteName: 'guibour.fr',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'guibour.fr — Guibureaucracy',
    description: 'Survivez aux dossiers volants dans un open space Excel.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
