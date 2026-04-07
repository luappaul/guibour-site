'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME = "Guibour à l'appareil. Comment puis-je orienter votre demande ?";

const QUICK_TOPICS = [
  { label: '🛍 Boutique', message: 'Où est la boutique ?' },
  { label: '🎮 Le jeu', message: 'Comment jouer à W.O.W ?' },
  { label: '🎵 Musique', message: 'Où écouter ta musique ?' },
  { label: '📅 Concerts', message: 'Y a-t-il des concerts prévus ?' },
];

export default function GuibourChat() {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 50);
    }
  }, [messages, open]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.filter(
        (m) => !(m.role === 'assistant' && m.content === WELCOME)
      );
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connexion instable. Réessaie dans un instant.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const showQuickTopics = messages.length === 1;

  // Bulle BD
  useEffect(() => {
    if (open) { setShowBubble(false); return; }
    let timer: ReturnType<typeof setTimeout>;
    const tick = (visible: boolean) => {
      setShowBubble(visible);
      timer = setTimeout(() => tick(!visible), visible ? 4000 : 12000);
    };
    timer = setTimeout(() => tick(true), 3000);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <>
      {/* Bulle BD */}
      {showBubble && !open && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          background: 'white',
          color: '#1a1a1a',
          padding: '10px 14px',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          fontSize: '13px',
          fontWeight: 600,
          maxWidth: '200px',
          lineHeight: '1.4',
          zIndex: 9998,
          animation: 'bubblePop 0.3s ease-out',
          border: '2px solid #1a1a1a',
          pointerEvents: 'none',
        }}>
          Une question ? Demande à Guibot !
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            right: '20px',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '12px solid #1a1a1a',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-9px',
            right: '21px',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '10px solid white',
          }} />
        </div>
      )}
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#0B2818',
          border: '1px solid rgba(0,200,80,0.3)',
          borderRadius: '24px',
          padding: '10px 18px 10px 14px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          color: '#fff',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          letterSpacing: '2px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#122f1f';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,200,80,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#0B2818';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#00C851',
            display: 'block',
            boxShadow: '0 0 6px #00C851',
            flexShrink: 0,
          }}
        />
        GUIBOUR
      </button>

      {/* Fenêtre chat */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '24px',
            width: '360px',
            maxHeight: '520px',
            background: '#fff',
            borderRadius: '14px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.28)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            animation: 'guibourFadeUp 0.18s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#0B2818',
              padding: '13px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#00C851',
                display: 'block',
                boxShadow: '0 0 6px #00C851',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: '#fff',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '12px',
                  letterSpacing: '1.5px',
                }}
              >
                GUIBOUR
              </div>
              <div style={{ color: '#5a9a6a', fontSize: '10px', marginTop: '2px' }}>
                guibour@extranet.biz · en ligne
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#5a9a6a',
                cursor: 'pointer',
                fontSize: '15px',
                padding: '2px 4px',
                lineHeight: 1,
                borderRadius: '4px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5a9a6a')}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: '#f6f6f6',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '9px 13px',
                    borderRadius:
                      msg.role === 'user'
                        ? '14px 14px 3px 14px'
                        : '14px 14px 14px 3px',
                    background: msg.role === 'user' ? '#0B2818' : '#ffffff',
                    color: msg.role === 'user' ? '#e8f5e8' : '#1a1a1a',
                    fontSize: '13px',
                    lineHeight: '1.55',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 16px',
                    background: '#ffffff',
                    borderRadius: '14px 14px 14px 3px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map((n) => (
                    <span
                      key={n}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#aaa',
                        display: 'block',
                        animation: `guibourDot 1.2s ${n * 0.2}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sujets rapides */}
          {showQuickTopics && (
            <div
              style={{
                padding: '8px 12px',
                background: '#f0f0f0',
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                flexShrink: 0,
                borderTop: '1px solid #e8e8e8',
              }}
            >
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => send(t.message)}
                  style={{
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '12px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: '#333',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0B2818';
                    e.currentTarget.style.color = '#0B2818';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.color = '#333';
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Zone de saisie */}
          <div
            style={{
              padding: '10px 12px',
              background: '#fff',
              borderTop: '1px solid #ebebeb',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Votre message..."
              disabled={loading}
              style={{
                flex: 1,
                border: '1px solid #e0e0e0',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '13px',
                outline: 'none',
                background: '#fafafa',
                color: '#1a1a1a',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0B2818')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: '#0B2818',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading || !input.trim() ? 0.35 : 1,
                flexShrink: 0,
                transition: 'opacity 0.15s',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes guibourFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes guibourDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes bubblePop {
          from { opacity: 0; transform: scale(0.8) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
