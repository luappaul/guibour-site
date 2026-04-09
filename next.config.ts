import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,

  // ── Compression Gzip/Brotli (actif par défaut sur Vercel, utile en self-host)
  compress: true,

  // ── En-têtes HTTP pour cache et sécurité ─────────────────────────────────
  async headers() {
    return [
      {
        // Assets statiques Next.js — cache long (immuables car hash dans le nom)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Pages publiques — cache court côté CDN, revalidation en arrière-plan
        source: '/(resultats|contact|shopping)',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        // En-têtes de sécurité sur toutes les routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // ── Experimental — React Compiler (Next 15) pour memoïsation auto
  // experimental: { reactCompiler: true },  // à activer si babel plugin installé

  // ── Images — pas d'images externes pour l'instant, on peut whitelist plus tard
  // images: { remotePatterns: [] },
};

export default nextConfig;
