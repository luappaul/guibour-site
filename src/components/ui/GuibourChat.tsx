'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LiveFeedEvent {
  pseudo: string;
  event: string;
  level: number;
  timestamp: number;
}

interface LiveBubble extends LiveFeedEvent {
  id: string;
  visible: boolean;
}

const WELCOME = "GUIBOT EN LIGNE. Comment puis-je orienter votre demande ?";

const QUICK_TOPICS = [
  { label: '🛍 Boutique', message: 'Où est la boutique ?' },
  { label: '🎮 Le jeu', message: 'Comment jouer à W.O.W ?' },
  { label: '🎵 Musique', message: 'Où écouter ta musique ?' },
  { label: '📅 Concerts', message: 'Y a-t-il des concerts prévus ?' },
];

export default function GuibourChat() {
  const [gameActive, setGameActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const onChange = () => {
      setGameActive(document.body.dataset.gameActive === 'true');
    };
    onChange();
    const observer = new MutationObserver(onChange);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-game-active'] });
    return () => observer.disconnect();
  }, []);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Live Feed ──────────────────────────────────────────────────────────
  const [liveBubbles, setLiveBubbles] = useState<LiveBubble[]>([]);
  const chatActiveRef = useRef(false); // true when user is chatting

  // Track chat activity: pause live feed when user interacts
  useEffect(() => {
    chatActiveRef.current = open && (messages.length > 1 || loading);
  }, [open, messages, loading]);

  // SSE connection for live feed
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let mounted = true;

    try {
      eventSource = new EventSource('/api/live-feed');
      eventSource.onmessage = (e) => {
        if (!mounted) return;
        try {
          const events: LiveFeedEvent[] = JSON.parse(e.data);
          if (events.length === 0) return;
          // Don't show if user is chatting
          if (chatActiveRef.current) return;

          // Add new bubbles (max 3 visible)
          const newBubbles: LiveBubble[] = events.slice(-3).map((ev, i) => ({
            ...ev,
            id: `${ev.timestamp}-${i}`,
            visible: true,
          }));

          setLiveBubbles(prev => {
            const merged = [...prev.filter(b => b.visible), ...newBubbles].slice(-3);
            return merged;
          });

          // Auto-remove after 4 seconds
          newBubbles.forEach(b => {
            setTimeout(() => {
              if (!mounted) return;
              setLiveBubbles(prev =>
                prev.map(pb => pb.id === b.id ? { ...pb, visible: false } : pb)
              );
              // Clean up after fade
              setTimeout(() => {
                if (!mounted) return;
                setLiveBubbles(prev => prev.filter(pb => pb.id !== b.id));
              }, 500);
            }, 4000);
          });
        } catch { /* ignore parse errors */ }
      };
    } catch { /* SSE not available */ }

    return () => {
      mounted = false;
      eventSource?.close();
    };
  }, []);

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
        { role: 'assistant', content: 'CONNEXION INSTABLE — Réessaie dans un instant.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const showQuickTopics = messages.length === 1;

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

  // Guibot masqué pendant le jeu
  if (gameActive) return null;

  return (
    <>
      {/* Bulle BD — style DA */}
      {showBubble && !open && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          background: '#0E2660',
          color: '#A8D8FF',
          padding: '12px 16px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.45), 0 0 16px rgba(0,120,255,0.15)',
          fontSize: '12px',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 600,
          letterSpacing: '1px',
          maxWidth: '210px',
          lineHeight: '1.4',
          zIndex: 9998,
          animation: 'bubblePop 0.3s ease-out',
          border: '1px solid rgba(0,150,255,0.3)',
          pointerEvents: 'none',
        }}>
          UNE QUESTION ?<br />
          <span style={{ color: '#fff', fontSize: '11px' }}>Demande à GUIBOT !</span>
          <div style={{
            position: 'absolute',
            bottom: '-10px',
            right: '22px',
            width: 0, height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '10px solid rgba(0,150,255,0.3)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            right: '23px',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '9px solid #0E2660',
          }} />
        </div>
      )}

      {/* Live feed bubbles — events from other players */}
      {!open && liveBubbles.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          zIndex: 9997,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}>
          {liveBubbles.map((b) => (
            <div key={b.id} style={{
              background: '#0A1E40',
              color: '#A8D8FF',
              padding: '8px 12px',
              borderRadius: '8px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 10px rgba(0,120,255,0.12)',
              fontSize: '11px',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.5px',
              maxWidth: '240px',
              lineHeight: '1.4',
              border: '1px solid rgba(0,150,255,0.25)',
              animation: b.visible ? 'liveFeedPop 0.35s ease-out' : 'liveFeedFade 0.5s ease-out forwards',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              <span style={{ marginRight: '4px' }}>🏢</span>
              <span style={{ color: '#00C8BE', fontWeight: 700 }}>{b.pseudo}</span>
              {' '}{b.event}
            </div>
          ))}
        </div>
      )}

      {/* Bouton flottant — style DA */}
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
          background: '#0E2660',
          border: '1px solid rgba(0,150,255,0.35)',
          borderRadius: '24px',
          padding: '12px 24px 12px 16px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(0,100,255,0.12)',
          color: '#fff',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          letterSpacing: '2px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1A3F78';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,100,255,0.3)';
          e.currentTarget.style.borderColor = 'rgba(0,180,255,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#0E2660';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(0,100,255,0.12)';
          e.currentTarget.style.borderColor = 'rgba(0,150,255,0.35)';
        }}
      >
        <span style={{
          width: 7, height: 7,
          borderRadius: '50%',
          background: '#00C8BE',
          display: 'block',
          boxShadow: '0 0 6px #00C8BE',
          flexShrink: 0,
        }} />
        GUIBOT
      </button>

      {/* Fenêtre chat — style DA */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '76px',
          right: '24px',
          width: '360px',
          maxHeight: '520px',
          background: '#060F1E',
          borderRadius: '8px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 32px rgba(0,80,200,0.12)',
          border: '1px solid rgba(0,150,255,0.2)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Orbitron', sans-serif",
          animation: 'guibourFadeUp 0.18s ease',
        }}>
          {/* Header */}
          <div style={{
            background: '#0E2660',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
            borderBottom: '1px solid rgba(0,150,255,0.2)',
          }}>
            <span style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#00C8BE',
              display: 'block',
              boxShadow: '0 0 8px #00C8BE',
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#fff',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '12px',
                letterSpacing: '2px',
                fontWeight: 700,
              }}>
                GUIBOT
              </div>
              <div style={{ color: '#A8D8FF', fontSize: '11px', marginTop: '2px', letterSpacing: '1px', opacity: 0.8 }}>
                ASSISTANT IA · EN LIGNE
              </div>
            </div>
            {/* Badge DA */}
            <div style={{
              background: 'rgba(0,200,190,0.12)',
              border: '1px solid rgba(0,200,190,0.3)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '11px',
              color: '#00C8BE',
              letterSpacing: '1px',
              fontFamily: "'Orbitron', sans-serif",
            }}>
              v1.0
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none',
                color: '#5B9BD5', cursor: 'pointer',
                fontSize: '15px', padding: '2px 4px',
                lineHeight: 1, borderRadius: '4px',
                transition: 'color 0.15s', fontFamily: 'system-ui',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5B9BD5')}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: '#060F1E',
            backgroundImage: 'linear-gradient(rgba(0,72,171,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,72,171,.04) 1px, transparent 1px)',
            backgroundSize: '28px 18px',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  background: msg.role === 'user'
                    ? '#0E2660'
                    : '#0D1F3C',
                  color: msg.role === 'user' ? '#A8D8FF' : '#C8E4FF',
                  fontSize: '12px',
                  fontFamily: "'Orbitron', sans-serif",
                  lineHeight: '1.6',
                  boxShadow: msg.role === 'user'
                    ? '0 2px 8px rgba(0,80,200,0.25)'
                    : '0 1px 4px rgba(0,0,0,0.3)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(0,150,255,0.2)'
                    : '1px solid rgba(0,100,180,0.15)',
                  whiteSpace: 'pre-wrap',
                  letterSpacing: '0.3px',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  background: '#0D1F3C',
                  borderRadius: '12px 12px 12px 3px',
                  border: '1px solid rgba(0,100,180,0.15)',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                }}>
                  {[0, 1, 2].map((n) => (
                    <span key={n} style={{
                      width: 5, height: 5,
                      borderRadius: '50%',
                      background: '#00C8BE',
                      display: 'block',
                      animation: `guibourDot 1.2s ${n * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sujets rapides */}
          {showQuickTopics && (
            <div style={{
              padding: '8px 10px',
              background: '#0A1628',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              flexShrink: 0,
              borderTop: '1px solid rgba(0,100,180,0.2)',
            }}>
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => send(t.message)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(0,150,255,0.3)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: '#A8D8FF',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '0.5px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,150,255,0.12)';
                    e.currentTarget.style.borderColor = '#00C8BE';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(0,150,255,0.3)';
                    e.currentTarget.style.color = '#A8D8FF';
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Zone de saisie */}
          <div style={{
            padding: '12px 12px',
            background: '#0A1628',
            borderTop: '1px solid rgba(0,100,180,0.2)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Message..."
              disabled={loading}
              style={{
                flex: 1,
                border: '1px solid rgba(0,150,255,0.25)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '11px',
                outline: 'none',
                background: '#060F1E',
                color: '#A8D8FF',
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '0.5px',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#00C8BE')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,150,255,0.25)')}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim()
                  ? 'rgba(0,80,150,0.2)'
                  : '#0E2660',
                border: '1px solid rgba(0,150,255,0.3)',
                borderRadius: '8px',
                width: '36px', height: '36px',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading || !input.trim() ? 0.4 : 1,
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#00C8BE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes liveFeedPop {
          from { opacity: 0; transform: scale(0.7) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes liveFeedFade {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-8px); }
        }
      `}</style>
    </>
  );
}
