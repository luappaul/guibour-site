'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import GlobeIcon from './GlobeIcon';
import { playClick } from '@/lib/sounds';

const mainTabs = [
  { href: '/',          label: 'JOUER À W.O.W',  icon: '/icons/icon-play.png'    },
  { href: '/resultats', label: 'CLASSEMENT',       icon: '/icons/icon-trophy.png'  },
  { href: '/jukebox',   label: 'SALLE D\'ÉCOUTE',  icon: '/icons/icon-music.png'   },
  { href: '/shopping',  label: 'BOUTIQUE',          icon: '/icons/icon-shop.png'    },
  { href: '/contact',   label: 'CONTACT',           icon: '/icons/icon-contact.png' },
];

const legalLinks = [
  { href: '/cgv', label: 'CGV' },
  { href: '/mentions-legales', label: 'MENTIONS' },
];

export default function ExcelNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0, zIndex: 50,
        width: '48px', overflow: 'hidden',
        transition: 'width 0.25s ease',
        background: '#0D2B5E',
        borderRight: '2px solid #1B3A6B',
        display: 'flex', flexDirection: 'column',
        boxShadow: '2px 0 16px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={e => { e.currentTarget.style.width = '200px'; }}
      onMouseLeave={e => { e.currentTarget.style.width = '48px'; }}
    >
      {/* Logo */}
      <a href="/" onClick={playClick} style={{
        padding: '12px 0', borderBottom: '1px solid #1B3A6B',
        display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px',
        flexShrink: 0, overflow: 'hidden', whiteSpace: 'nowrap',
        textDecoration: 'none', cursor: 'pointer',
      }}>
        <GlobeIcon size={28} color="#00C8BE" />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: '#FFFFFF', letterSpacing: '2px', lineHeight: 1.1, textShadow: '0 0 10px rgba(255,255,255,.5)' }}>GUIBOUR</div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', fontWeight: 400, color: '#00D4CC', letterSpacing: '3px', marginTop: '-1px' }}>SYSTEM</div>
        </div>
      </a>

      {/* Main nav links */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '8px', overflowY: 'auto' }}>
        {mainTabs.map(tab => {
          const active = pathname === tab.href;
          const isWow = tab.label === 'JOUER À W.O.W';
          return (
            <Link key={tab.href} href={tab.href} onClick={playClick} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0 10px 11px',
              fontFamily: "'Lilita One', cursive", fontSize: '13px', letterSpacing: '2px',
              color: active ? '#A8D8FF' : '#3C5A7A',
              textDecoration: 'none',
              borderLeft: active ? '3px solid #0047AB' : '3px solid transparent',
              background: active ? 'rgba(0,71,171,0.22)' : 'transparent',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap', overflow: 'hidden',
              textShadow: '1px 2px 0 rgba(0,0,0,0.55)',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#A8D8FF'; e.currentTarget.style.background = 'rgba(0,71,171,0.12)'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#3C5A7A'; e.currentTarget.style.background = 'transparent'; } }}
            >
              {/* Icône PNG — visible collapsed + expanded */}
              <span className={active ? 'nav-icon nav-icon--active' : 'nav-icon'} style={{ flexShrink: 0 }}>
                <Image src={tab.icon} alt="" width={22} height={22} style={{ display: 'block' }} />
              </span>
              {/* Label — masqué collapsed */}
              <span style={{ overflow: 'hidden' }}>
                {isWow ? (
                  <>JOUER À{' '}<span style={{ color: '#00C8BE', textShadow: '1px 2px 0 #003A38' }}>W.O.W</span></>
                ) : tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Legal links — very discreet, icon-only when collapsed */}
      <div style={{ borderTop: '1px solid #1B3A6B', padding: '6px 0', flexShrink: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {legalLinks.map(link => (
          <Link key={link.href} href={link.href} onClick={playClick} style={{
            display: 'block', padding: '5px 14px',
            fontFamily: "'Orbitron', sans-serif", fontSize: '8px', letterSpacing: '2px',
            color: '#1E3F6E', textDecoration: 'none', overflow: 'hidden',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#3C5A7A'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#1E3F6E'; }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Bottom JOUER button */}
      <div style={{ borderTop: '1px solid #1B3A6B', padding: '12px 10px', flexShrink: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <Link href="/" onClick={playClick} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Lilita One', cursive", fontSize: '13px', letterSpacing: '2px',
          color: '#fff', textDecoration: 'none',
          background: 'linear-gradient(135deg, #0047AB, #007B8A)',
          border: '1px solid #5B9BD5', padding: '10px 12px',
          boxShadow: '0 0 14px rgba(0,71,171,.25)', transition: 'all 0.2s ease', gap: '4px',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #1B5EBB, #008B9A)'; e.currentTarget.style.boxShadow = '0 0 22px rgba(0,71,171,.45)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0047AB, #007B8A)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(0,71,171,.25)'; }}
        >
          JOUER À <span style={{ color: '#00C8BE', marginLeft: '4px', textShadow: '1px 2px 0 #003A38' }}>W.O.W</span>
        </Link>
      </div>
    </nav>
  );
}
