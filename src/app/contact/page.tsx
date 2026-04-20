'use client';

import { useState, useRef } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';

export default function ContactPage() {
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const formRef               = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const form = e.currentTarget;
    const data = {
      name:    (form.elements.namedItem('name')    as HTMLInputElement).value,
      email:   (form.elements.namedItem('email')   as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Erreur serveur');
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0E2660' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=CONTACT("GUIBOUR") // W.O.W' breadcrumb="ETAGE 4 > CONTACT">
        <div style={{
          minHeight: 'calc(100vh - 52px)',
          backgroundImage: 'linear-gradient(rgba(0,255,235,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.04) 1px,transparent 1px)',
          backgroundSize: '56px 34px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px',
        }}>

          {sent ? (
            /* ── Confirmation ── */
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                border: '2px solid #00FFEE',
                boxShadow: '0 0 30px rgba(0,255,235,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', color: '#00FFEE',
              }}>✓</div>
              <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '32px', color: '#fff', letterSpacing: '4px' }}>
                MESSAGE ENVOYÉ
              </div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#fff', opacity: 0.5, letterSpacing: '3px' }}>
                LA DIRECTION VOUS RÉPONDRA APRÈS LA PAUSE CAFÉ.
              </div>
              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: '8px',
                  fontFamily: "'Lilita One', cursive", fontSize: '14px', letterSpacing: '3px',
                  color: '#fff', background: 'transparent',
                  border: '2px solid rgba(255,255,255,.3)', padding: '12px 32px',
                  cursor: 'pointer', transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'; }}
              >NOUVEAU MESSAGE</button>
            </div>

          ) : (
            /* ── Form ── */
            <div style={{ width: '100%', maxWidth: '560px' }}>

              {/* Title */}
              <div style={{ marginBottom: '36px' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#fff', opacity: 0.4, letterSpacing: '5px', marginBottom: '8px' }}>
                  04 / CONTACT
                </div>
                <div style={{
                  fontFamily: "'Lilita One', cursive",
                  fontSize: 'clamp(28px,5vw,42px)', color: '#fff',
                  letterSpacing: '4px', lineHeight: 1,
                }}>
                  NOUS CONTACTER
                </div>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelCss}>NOM / PSEUDO</label>
                    <input name="name" type="text" required placeholder="Votre nom..." style={inputCss} />
                  </div>
                  <div>
                    <label style={labelCss}>EMAIL</label>
                    <input name="email" type="email" required placeholder="votre@email.com" style={inputCss} />
                  </div>
                </div>

                <div>
                  <label style={labelCss}>OBJET</label>
                  <input name="subject" type="text" required placeholder="Sujet du message..." style={inputCss} />
                </div>

                <div>
                  <label style={labelCss}>MESSAGE</label>
                  <textarea
                    name="message" required rows={6} placeholder="Votre message..."
                    style={{ ...inputCss, resize: 'none', lineHeight: 1.7 }}
                  />
                </div>

                {error && (
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#FF4444',
                    letterSpacing: '1px', padding: '12px 16px',
                    background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.3)',
                  }}>⚠ {error}</div>
                )}

                <button
                  type="submit" disabled={sending}
                  style={{
                    marginTop: '8px',
                    fontFamily: "'Lilita One', cursive", fontSize: '17px', letterSpacing: '4px',
                    color: '#fff',
                    background: sending ? 'rgba(0,71,171,.4)' : '#0047AB',
                    border: '2px solid #5B9BD5',
                    padding: '15px 0',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    boxShadow: sending ? 'none' : '0 0 24px rgba(0,71,171,.4)',
                    transition: 'all .25s ease',
                    opacity: sending ? 0.6 : 1,
                    textShadow: '1px 2px 0 rgba(0,0,0,.4)',
                  }}
                  onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = '#1B5EBB'; e.currentTarget.style.boxShadow = '0 0 38px rgba(0,71,171,.6)'; } }}
                  onMouseLeave={e => { if (!sending) { e.currentTarget.style.background = '#0047AB'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,71,171,.4)'; } }}
                >
                  {sending ? 'ENVOI...' : 'ENVOYER →'}
                </button>

              </form>
            </div>
          )}

        </div>
      </ExcelChrome>
      <style>{`
        ::placeholder { color: rgba(0,0,0,.35) !important; }
      `}</style>
    </div>
  );
}

const labelCss: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '11px',
  color: '#ffffff',
  letterSpacing: '3px',
  marginBottom: '8px',
  opacity: 0.85,
};

const inputCss: React.CSSProperties = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid rgba(255,255,255,.2)',
  padding: '12px 16px',
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '12px',
  color: '#0E2660',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'box-shadow .2s',
};
