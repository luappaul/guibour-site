'use client';

import { useEffect, useState } from 'react';

// Cible : 1er juin 2026, 18h00 heure de Paris (UTC+2 en été)
const TARGET = new Date('2026-06-01T18:00:00+02:00').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = TARGET - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <div style={{ position: 'relative', lineHeight: 1 }}>
        {/* Segments éteints — fond fantôme LED */}
        <span style={{
          fontFamily   : "'DSEG7', monospace",
          fontSize     : 'clamp(22px, 3.5vw, 36px)',
          color        : 'rgba(255,40,40,0.12)',
          letterSpacing: '2px',
          position     : 'absolute',
          top: 0, left: 0,
          userSelect   : 'none',
        }}>88</span>
        {/* Segments allumés */}
        <span style={{
          fontFamily   : "'DSEG7', monospace",
          fontSize     : 'clamp(22px, 3.5vw, 36px)',
          color        : '#FF2222',
          letterSpacing: '2px',
          textShadow   : '0 0 8px rgba(255,34,34,.7), 0 0 20px rgba(255,34,34,.35)',
          position     : 'relative',
          zIndex       : 1,
        }}>{value}</span>
      </div>
      <span style={{
        fontFamily   : "'Orbitron', sans-serif",
        fontSize     : '6px',
        color        : 'rgba(255,60,60,0.45)',
        letterSpacing: '2px',
        marginTop    : '1px',
      }}>{label}</span>
    </div>
  );
}

function Sep() {
  return (
    <span style={{
      fontFamily : "'DSEG7', monospace",
      fontSize   : 'clamp(22px, 3.5vw, 36px)',
      color      : '#FF2222',
      textShadow : '0 0 8px rgba(255,34,34,.6)',
      lineHeight : 1,
      marginBottom: '10px',
      opacity    : 0.7,
      userSelect : 'none',
    }}>:</span>
  );
}

export default function Countdown() {
  const [t, setT] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setT(computeTimeLeft());
    const id = setInterval(() => setT(computeTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!t) return null;
  if (t.expired) return null;

  const isUrgent = t.days < 7;

  return (
    <div style={{
      position      : 'fixed',
      bottom        : 0,
      left          : '48px',
      right         : 0,
      zIndex        : 30,
      background    : 'rgba(3, 6, 16, 0.97)',
      borderTop     : `1px solid rgba(255,34,34,${isUrgent ? '0.55' : '0.25'})`,
      boxShadow     : `0 -4px 30px rgba(255,20,20,${isUrgent ? '0.18' : '0.08'})`,
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      gap           : 'clamp(16px, 3vw, 48px)',
      padding       : '10px 24px',
      flexWrap      : 'wrap',
    }}>

      {/* PRIX */}
      <div style={{
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'flex-start',
        gap          : '2px',
        borderRight  : '1px solid rgba(255,34,34,0.15)',
        paddingRight : 'clamp(12px, 2vw, 32px)',
      }}>
        <div style={{
          fontFamily   : "'Orbitron', sans-serif",
          fontSize     : 'clamp(7px, 1vw, 9px)',
          color        : '#FFD700',
          letterSpacing: '3px',
          fontWeight   : 700,
          textShadow   : '0 0 10px rgba(255,215,0,.4)',
        }}>🏆 CONCERT PRIVÉ</div>
        <div style={{
          fontFamily   : "'Lilita One', cursive",
          fontSize     : 'clamp(11px, 1.8vw, 16px)',
          color        : '#FFFFFF',
          letterSpacing: '1px',
          lineHeight   : 1,
        }}>1ER DU CLASSEMENT</div>
        <div style={{
          fontFamily   : "'Orbitron', sans-serif",
          fontSize     : 'clamp(6px, 0.8vw, 8px)',
          color        : 'rgba(160,180,220,0.5)',
          letterSpacing: '2px',
        }}>W.O.W SAISON 1</div>
      </div>

      {/* CHRONO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Digit value={pad(t.days)}    label="JOURS"  />
        <Sep />
        <Digit value={pad(t.hours)}   label="HEURES" />
        <Sep />
        <Digit value={pad(t.minutes)} label="MIN"    />
        <Sep />
        <Digit value={pad(t.seconds)} label="SEC"    />
      </div>

      {/* DATE */}
      <div style={{
        display      : 'flex',
        flexDirection: 'column',
        alignItems   : 'flex-end',
        gap          : '2px',
        borderLeft   : '1px solid rgba(255,34,34,0.15)',
        paddingLeft  : 'clamp(12px, 2vw, 32px)',
      }}>
        <div style={{
          fontFamily   : "'Orbitron', sans-serif",
          fontSize     : 'clamp(7px, 1vw, 9px)',
          color        : 'rgba(160,180,220,0.5)',
          letterSpacing: '2px',
        }}>FIN DU CONCOURS</div>
        <div style={{
          fontFamily   : "'Orbitron', sans-serif",
          fontSize     : 'clamp(11px, 1.8vw, 16px)',
          color        : '#FFFFFF',
          letterSpacing: '2px',
          fontWeight   : 700,
          lineHeight   : 1,
        }}>01 JUIN 2026</div>
        <div style={{
          fontFamily   : "'Orbitron', sans-serif",
          fontSize     : 'clamp(6px, 0.8vw, 8px)',
          color        : 'rgba(160,180,220,0.5)',
          letterSpacing: '2px',
        }}>18H00 — PARIS</div>
      </div>
    </div>
  );
}
