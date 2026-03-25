'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const tabs = [
  { href: '/', label: 'ACCUEIL' },
  { href: '/resultats', label: 'RÉSULTATS' },
  { href: '/shopping', label: 'MERCH' },
  { href: '/contact', label: 'CONTACT' },
];

export default function ExcelNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      height: '48px',
      padding: '0 24px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '2px solid #C8D8E8',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', marginRight: 'auto' }}>
        <Logo variant="horizontal" size="sm" />
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '0' }}>
        {tabs.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '3px',
                color: active ? '#00A89D' : '#607888',
                textDecoration: 'none',
                padding: '0 18px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                borderRight: '1px solid #C8D8E8',
                transition: 'color 0.2s',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
        {/* JOUER button */}
        <Link
          href="/"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '3px',
            color: '#fff',
            textDecoration: 'none',
            padding: '0 22px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '14px',
            background: '#0047AB',
            border: '1px solid #00A89D',
            boxShadow: '0 0 20px rgba(0,71,171,0.15), inset 0 0 20px rgba(0,71,171,0.05)',
          }}
        >
          JOUER
        </Link>
      </div>
    </nav>
  );
}
