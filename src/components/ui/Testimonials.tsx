'use client';

import { useState, useEffect, useCallback } from 'react';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  stars: number;
}

const TESTIMONIALS: Testimonial[] = [
  { name: 'Jean-Michel D.', role: 'Directeur des Synergies', text: "J'ai perdu 3 heures de ma vie sur ce jeu. Mon manager m'a demandé si j'avais fini le rapport. Non.", stars: 5 },
  { name: 'Sandrine B.', role: 'Stagiaire Éternelle', text: "Je suis arrivée à l'étage 24 et j'ai pleuré quand une bulle m'a touchée. Vraiment pleuré.", stars: 5 },
  { name: 'Patrick R.', role: 'DRH Adjoint', text: "Ce jeu m'a fait réaliser que ma carrière est aussi absurde que ces 25 étages.", stars: 4 },
  { name: 'Nathalie K.', role: 'Cheffe de Projet (en burnout)', text: "J'ai battu le record du bureau. Personne ne m'a félicitée. Comme dans la vraie vie.", stars: 5 },
  { name: 'François T.', role: 'Consultant Senior', text: "La réunion de 14h a été annulée grâce à ce jeu. Merci GUIBOUR.", stars: 5 },
  { name: 'Mélanie P.', role: "Chargée de Com' Interne", text: "J'ai partagé le lien à toute l'équipe. Productivité en chute libre. Ambiance au top.", stars: 5 },
  { name: 'Karim L.', role: 'Développeur Full-Stack', text: "Le code derrière ce jeu est mieux structuré que notre prod. Respect.", stars: 4 },
  { name: 'Isabelle M.', role: 'Assistante de Direction', text: "Mon boss m'a surprise en train de jouer. Il a voulu essayer. Il est toujours dessus.", stars: 5 },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Responsive: detect visible count
  useEffect(() => {
    function updateCount() {
      const w = window.innerWidth;
      if (w < 600) setVisibleCount(1);
      else if (w < 900) setVisibleCount(2);
      else setVisibleCount(3);
    }
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const totalSets = Math.ceil(TESTIMONIALS.length / visibleCount);

  const advance = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % totalSets);
      setIsTransitioning(false);
    }, 400);
  }, [totalSets]);

  // Auto-rotate every 5s
  useEffect(() => {
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance]);

  const startIdx = (currentIndex % totalSets) * visibleCount;
  const visibleTestimonials = TESTIMONIALS.slice(startIdx, startIdx + visibleCount);
  // If we don't have enough to fill, wrap around
  while (visibleTestimonials.length < visibleCount && visibleTestimonials.length < TESTIMONIALS.length) {
    const wrapIdx = (startIdx + visibleTestimonials.length) % TESTIMONIALS.length;
    visibleTestimonials.push(TESTIMONIALS[wrapIdx]);
  }

  return (
    <div style={{ marginTop: 48, width: '100%', maxWidth: 960, margin: '48px auto 0' }}>
      {/* Title */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 9,
        color: '#2B5090',
        letterSpacing: 4,
        textAlign: 'center',
        marginBottom: 24,
        textTransform: 'uppercase',
      }}>
        CE QUE LES EMPLOYÉS DISENT
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
        gap: 16,
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.4s ease',
        padding: '0 8px',
      }}>
        {visibleTestimonials.map((t, i) => (
          <div key={`${currentIndex}-${i}`} style={{
            background: 'rgba(5,15,45,.6)',
            border: '1px solid rgba(0,200,190,.2)',
            borderRadius: 4,
            padding: '20px 18px 16px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative quote */}
            <span style={{
              position: 'absolute',
              top: 8,
              left: 12,
              fontFamily: 'Georgia, serif',
              fontSize: 40,
              color: 'rgba(0,200,190,.15)',
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}>«</span>
            <span style={{
              position: 'absolute',
              bottom: 4,
              right: 12,
              fontFamily: 'Georgia, serif',
              fontSize: 40,
              color: 'rgba(0,200,190,.15)',
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}>»</span>

            {/* Stars */}
            <div style={{ marginBottom: 8, fontSize: 12, lineHeight: 1 }}>
              {'⭐'.repeat(t.stars)}
            </div>

            {/* Text */}
            <p style={{
              fontStyle: 'italic',
              color: '#A8D8FF',
              fontSize: 13,
              lineHeight: 1.5,
              margin: '0 0 14px',
              position: 'relative',
              zIndex: 1,
            }}>
              {t.text}
            </p>

            {/* Author */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 9,
                color: '#fff',
                letterSpacing: 1,
              }}>
                {t.name}
              </div>
              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 9,
                color: '#00C8BE',
                letterSpacing: 1,
                marginTop: 2,
              }}>
                {t.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        marginTop: 16,
      }}>
        {Array.from({ length: totalSets }).map((_, i) => (
          <span key={i} style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: i === currentIndex % totalSets ? '#00C8BE' : 'rgba(0,200,190,.2)',
            transition: 'background 0.3s ease',
            display: 'inline-block',
          }} />
        ))}
      </div>
    </div>
  );
}
