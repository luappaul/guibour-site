'use client';

import dynamic from 'next/dynamic';
import ExcelNav from '@/components/ui/ExcelNav';

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: '#1E293B' }}>
      <ExcelNav />
      <main className="flex-1">
        <GameCanvas />
      </main>
    </div>
  );
}
