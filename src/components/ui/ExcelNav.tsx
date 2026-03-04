'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Guibureaucracy', icon: '▦' },
  { href: '/resultats', label: 'Resultats', icon: '📊' },
  { href: '/shopping', label: 'Boutique', icon: '🛒' },
  { href: '/contact', label: 'Contact', icon: '✉' },
];

export default function ExcelNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 flex items-end px-6 pt-5 pb-0"
      style={{ background: 'linear-gradient(to bottom, #3A4A5C, #2A3644)', gap: '6px' }}
    >
      {tabs.map(tab => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: '14px 32px',
              fontSize: '18px',
              fontWeight: active ? 700 : 600,
              borderRadius: '14px 14px 0 0',
              background: active ? '#F0F0F0' : '#475569',
              color: active ? '#1E293B' : '#CBD5E1',
              borderBottom: active ? '3px solid #F0F0F0' : 'none',
              marginBottom: active ? '-1px' : '0',
              transition: 'all 0.15s',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              letterSpacing: '0.02em',
            }}
          >
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
      <div className="flex-1 border-b border-[#475569]" />
    </nav>
  );
}
