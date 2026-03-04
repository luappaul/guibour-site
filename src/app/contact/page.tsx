'use client';

import { useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ background: '#1E293B' }}>
      <ExcelNav />
      <main className="mx-auto max-w-2xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
          <div className="flex items-center gap-3 bg-[#217346] px-5 py-3">
            <div className="flex gap-2">
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#FF5F56' }} />
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#27C93F' }} />
            </div>
            <span className="text-sm font-bold text-white">Contact.xlsx</span>
          </div>
          <div className="bg-[#F5F5F5] px-5 py-4">
            <p className="font-mono text-sm text-[#475569]">=SI(message&lt;&gt;&quot;&quot;, ENVOYER(), &quot;En attente...&quot;)</p>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="border-b border-[#E2E8F0] px-6 py-4">
            <h2 className="text-lg font-bold text-[#1E293B]">Nouveau message</h2>
            <p className="text-xs text-[#94A3B8]">Envoyez un memo a la direction de Guibour Corp.</p>
          </div>

          {sent ? (
            <div className="px-6 py-12 text-center">
              <p className="text-4xl">📨</p>
              <p className="mt-3 text-lg font-bold text-[#1E293B]">Memo envoye !</p>
              <p className="mt-1 text-sm text-[#94A3B8]">
                La direction vous repondra apres la pause cafe.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 cursor-pointer rounded-lg px-6 py-2 text-sm font-bold text-white"
                style={{ background: '#217346' }}
              >
                Nouveau memo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">De :</label>
                <input
                  type="email"
                  required
                  placeholder="votre@email.com"
                  className="w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#217346]/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Objet :</label>
                <input
                  type="text"
                  required
                  placeholder="Sujet du memo..."
                  className="w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#217346]/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Message :</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Votre message..."
                  className="w-full resize-none rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#217346] focus:ring-2 focus:ring-[#217346]/30"
                />
              </div>
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: 'linear-gradient(to bottom, #27AE60, #1E8C4D)' }}
              >
                Envoyer le memo
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
