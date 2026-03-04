'use client';

import ExcelNav from '@/components/ui/ExcelNav';

const products = [
  { name: 'T-shirt "Guibour Corp."', price: '29,99', desc: 'Le t-shirt officiel du bureau', emoji: '👔' },
  { name: 'Mug "Pause Cafe"', price: '14,99', desc: 'Pour des pauses cafe plus longues', emoji: '☕' },
  { name: 'Casquette "RTT"', price: '19,99', desc: 'Pour les jours ou vous ne travaillez pas', emoji: '🧢' },
  { name: 'Poster "Open Space"', price: '12,99', desc: 'Decorez votre vrai open space', emoji: '🖼' },
  { name: 'Stickers Pack', price: '7,99', desc: '10 stickers bureaucratiques', emoji: '📎' },
  { name: 'Hoodie "Dossier"', price: '49,99', desc: 'Pour les reunions du lundi', emoji: '🧥' },
];

export default function ShoppingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#1E293B' }}>
      <ExcelNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
          <div className="flex items-center gap-3 bg-[#217346] px-5 py-3">
            <div className="flex gap-2">
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#FF5F56' }} />
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#27C93F' }} />
            </div>
            <span className="text-sm font-bold text-white">Boutique.xlsx</span>
          </div>
          <div className="bg-[#F5F5F5] px-5 py-4">
            <p className="font-mono text-sm text-[#475569]">=CATALOGUE(merch, &quot;guibour&quot;)</p>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => (
            <div key={p.name} className="overflow-hidden rounded-xl bg-white shadow-lg transition-transform hover:scale-[1.02]">
              <div className="flex h-36 items-center justify-center bg-[#F8FAFC] text-5xl">
                {p.emoji}
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-[#1E293B]">{p.name}</h3>
                <p className="mt-1.5 text-sm text-[#94A3B8]">{p.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-xl font-bold text-[#217346]">{p.price} &euro;</span>
                  <span className="rounded-lg bg-[#F0F0F0] px-4 py-2 text-sm font-semibold text-[#94A3B8]">
                    Bientot
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
