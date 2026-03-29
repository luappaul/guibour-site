'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        background: '#060E00',
        borderRight: '2px solid #1B4332',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 12px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={e => { e.currentTarget.style.width = '200px'; }}
      onMouseLeave={e => { e.currentTarget.style.width = '48px'; }}
    >
      {/* Logo area */}
      <div style={{
        padding: '14px 0',
        borderBottom: '1px solid #1B4332',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingLeft: '12px',
        flexShrink: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>🏢</span>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: '13px',
            color: '#5CDB5C',
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
                color: active ? '#5CDB5C' : '#2C5F2E',
                textDecoration: 'none',
                borderLeft: active ? '3px solid #5CDB5C' : '3px solid transparent',
                background: active ? 'rgba(44,95,46,0.2)' : 'transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color = '#5CDB5C';
                  e.currentTarget.style.background = 'rgba(44,95,46,0.1)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color = '#2C5F2E';
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
        borderTop: '1px solid #1B4332',
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
            color: '#5CDB5C',
            textDecoration: 'none',
            background: '#1B4332',
            border: '1px solid #2C5F2E',
            padding: '10px 12px',
            boxShadow: '0 0 12px rgba(92,219,92,0.15)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#2C5F2E';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(92,219,92,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#1B4332';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(92,219,92,0.15)';
          }}
        >
          <span style={{ fontSize: '14px', flexShrink: 0 }}>🎮</span>
          <span>JOUER</span>
        </Link>
      </div>
    </nav>
  );
}
