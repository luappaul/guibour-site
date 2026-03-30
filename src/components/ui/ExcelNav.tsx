'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sphere from './Sphere';

const tabs = [
  { href: '/', label: 'JOUER', icon: '▶' },
  { href: '/resultats', label: 'CLASSEMENT', icon: '📊' },
  { href: '/shopping', label: 'MERCH', icon: '🛒' },
  { href: '/contact', label: 'CONTACT', icon: '✉' },
];

export default function ExcelNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        width: '48px',
        overflow: 'hidden',
        transition: 'width 0.25s ease',
        background: '#0D1A0D',
        borderRight: '2px solid #2A6040',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 14px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={e => { e.currentTarget.style.width = '200px'; }}
      onMouseLeave={e => { e.currentTarget.style.width = '48px'; }}
    >
      {/* Logo area — sphère + texte */}
      <div style={{
        padding: '12px 0',
        borderBottom: '1px solid #2A6040',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingLeft: '10px',
        flexShrink: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <Sphere size={28} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: '13px',
            color: '#7AEC7A',
            letterSpacing: '2px',
            lineHeight: 1.1,
          }}>GUIBOUR</div>
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: '9px',
            color: '#FFE033',
            letterSpacing: '3px',
          }}>SYSTEM</div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '8px' }}>
        {tabs.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '11px',
                letterSpacing: '2px',
                color: active ? '#7AEC7A' : '#3A8040',
                textDecoration: 'none',
                borderLeft: active ? '3px solid #7AEC7A' : '3px solid transparent',
                background: active ? 'rgba(58,128,64,0.2)' : 'transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color = '#7AEC7A';
                  e.currentTarget.style.background = 'rgba(58,128,64,0.12)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color = '#3A8040';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0, width: '20px', textAlign: 'center' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom JOUER button */}
      <div style={{
        borderTop: '1px solid #2A6040',
        padding: '12px 10px',
        flexShrink: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'Bangers', cursive",
            fontSize: '15px',
            letterSpacing: '4px',
            color: '#fff',
            textDecoration: 'none',
            background: '#2A6040',
            border: '1px solid #7AEC7A',
            padding: '10px 12px',
            boxShadow: '0 0 14px rgba(122,236,122,.18)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#3A8040';
            e.currentTarget.style.boxShadow = '0 0 22px rgba(122,236,122,.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#2A6040';
            e.currentTarget.style.boxShadow = '0 0 14px rgba(122,236,122,.18)';
          }}
        >
          <span style={{ fontSize: '14px', flexShrink: 0 }}>🎮</span>
          <span>JOUER</span>
        </Link>
      </div>
    </nav>
  );
}
