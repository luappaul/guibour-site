import { LevelConfig, BubbleSize, BubbleConfig, BonusType } from './gameTypes';

function b(size: BubbleSize, x: number, vx: number): BubbleConfig {
  return { size, x, vx };
}

const defaultWeights: Partial<Record<BonusType, number>> = {
  cafe: 20, biere: 10, argent: 20, temps: 15, pilule: 5, stagiaire: 5, cgt: 3, rtt: 5,
};

const hardWeights: Partial<Record<BonusType, number>> = {
  cafe: 15, biere: 15, argent: 15, temps: 20, pilule: 8, stagiaire: 8, cgt: 5, rtt: 8,
};

const extremeWeights: Partial<Record<BonusType, number>> = {
  cafe: 10, biere: 18, argent: 10, temps: 25, pilule: 10, stagiaire: 10, cgt: 8, rtt: 12,
};

export const LEVELS: LevelConfig[] = [
  // === Etages 00-04 : Tutorial / Facile ===
  {
    id: 0, name: 'Etage 00 — Accueil',
    background: '/game/backgrounds/bg-00.png',
    phrase: 'Bienvenue chez Guibour. Voici votre badge.',
    bubbles: [b(4, 0.5, 0.8)],
    timeLimit: 90, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },
  {
    id: 1, name: 'Etage 01 — Open Space',
    background: '/game/backgrounds/bg-01.png',
    phrase: 'Votre bureau est quelque part par la...',
    bubbles: [b(5, 0.3, 0.9)],
    timeLimit: 90, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },
  {
    id: 2, name: 'Etage 02 — Machine a cafe',
    background: '/game/backgrounds/bg-02.png',
    phrase: 'Le cafe est en panne. Comme d\'habitude.',
    bubbles: [b(4, 0.3, 0.8), b(4, 0.7, -0.8)],
    timeLimit: 90, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },
  {
    id: 3, name: 'Etage 03 — Salle de reunion',
    background: '/game/backgrounds/bg-03.png',
    phrase: 'Cette reunion aurait pu etre un email.',
    bubbles: [b(5, 0.4, 0.7), b(4, 0.7, -0.9)],
    timeLimit: 90, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },
  {
    id: 4, name: 'Etage 04 — Photocopieuse',
    background: '/game/backgrounds/bg-04.png',
    phrase: 'Bourrage papier. Encore.',
    bubbles: [b(5, 0.2, 0.8), b(5, 0.8, -0.8)],
    timeLimit: 85, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },

  // === Etages 05-09 : Moyen ===
  {
    id: 5, name: 'Etage 05 — Comptabilite',
    background: '/game/backgrounds/bg-05.png',
    phrase: 'Les chiffres ne mentent pas. Les comptables, si.',
    bubbles: [b(5, 0.3, 0.9), b(5, 0.7, -0.7)],
    timeLimit: 80, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },
  {
    id: 6, name: 'Etage 06 — Service juridique',
    background: '/game/backgrounds/bg-06.png',
    phrase: 'Lisez les petites lignes. Toutes.',
    bubbles: [b(6, 0.5, 0.8), b(4, 0.2, -0.9)],
    timeLimit: 80, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },
  {
    id: 7, name: 'Etage 07 — Ressources Inhumaines',
    background: '/game/backgrounds/bg-07.png',
    phrase: 'Votre entretien annuel est "en cours de planification".',
    bubbles: [b(6, 0.3, 0.8), b(5, 0.6, -0.9), b(4, 0.8, 0.7)],
    timeLimit: 80, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },
  {
    id: 8, name: 'Etage 08 — Marketing',
    background: '/game/backgrounds/bg-08.png',
    phrase: 'On va pivoter. Encore. Pour la 7e fois.',
    bubbles: [b(6, 0.2, 0.9), b(5, 0.5, -0.8), b(5, 0.8, 0.7)],
    timeLimit: 80, bonusWeights: defaultWeights, hasCeilingSpikes: true,
  },
  {
    id: 9, name: 'Etage 09 — Informatique',
    background: '/game/backgrounds/bg-09.png',
    phrase: 'Avez-vous essaye d\'eteindre et de rallumer ?',
    bubbles: [b(6, 0.3, 0.8), b(6, 0.7, -0.8)],
    timeLimit: 75, bonusWeights: hardWeights, hasCeilingSpikes: true,
  },

  // === Etages 10-14 : Difficile ===
  {
    id: 10, name: 'Etage 10 — Direction Generale',
    background: '/game/backgrounds/bg-10.png',
    phrase: 'Le DG est en "seminaire strategie" a Bali.',
    bubbles: [b(6, 0.2, 0.9), b(5, 0.5, -0.8), b(5, 0.8, 0.8)],
    timeLimit: 75, bonusWeights: hardWeights, hasCeilingSpikes: true,
  },
  {
    id: 11, name: 'Etage 11 — Archives',
    background: '/game/backgrounds/bg-11.png',
    phrase: 'Le dossier Dupont ? Il est sous le dossier Martin.',
    bubbles: [b(7, 0.5, 0.8), b(5, 0.2, -0.9)],
    timeLimit: 75, bonusWeights: hardWeights, hasCeilingSpikes: true,
  },
  {
    id: 12, name: 'Etage 12 — Cantine',
    background: '/game/backgrounds/bg-12.png',
    phrase: 'Menu du jour : mystere du chef.',
    bubbles: [b(6, 0.3, 0.9), b(6, 0.7, -0.8), b(5, 0.5, 0.7)],
    timeLimit: 75, bonusWeights: hardWeights, hasCeilingSpikes: true,
  },
  {
    id: 13, name: 'Etage 13 — Salle serveurs',
    background: '/game/backgrounds/bg-13.png',
    phrase: 'La clim est en panne. Les serveurs aussi.',
    bubbles: [b(7, 0.4, 0.8), b(5, 0.2, -0.9), b(5, 0.8, 0.7)],
    timeLimit: 70, bonusWeights: hardWeights, hasCeilingSpikes: true,
  },
  {
    id: 14, name: 'Etage 14 — Formation obligatoire',
    background: '/game/backgrounds/bg-14.png',
    phrase: 'Module 47 : "Le bien-etre au travail".',
    bubbles: [b(7, 0.3, 0.9), b(6, 0.7, -0.8), b(4, 0.5, 0.8)],
    timeLimit: 70, bonusWeights: hardWeights, hasCeilingSpikes: true,
  },

  // === Etages 15-19 : Tres difficile ===
  {
    id: 15, name: 'Etage 15 — Audit interne',
    background: '/game/backgrounds/bg-15.png',
    phrase: 'L\'audit de l\'audit est en cours d\'audit.',
    bubbles: [b(7, 0.2, 0.9), b(6, 0.5, -0.8), b(6, 0.8, 0.8), b(4, 0.4, -0.7)],
    timeLimit: 70, bonusWeights: hardWeights, hasCeilingSpikes: true,
  },
  {
    id: 16, name: 'Etage 16 — Communication',
    background: '/game/backgrounds/bg-16.png',
    phrase: 'La com\' communique qu\'elle va communiquer.',
    bubbles: [b(7, 0.3, 0.8), b(6, 0.6, -0.9), b(5, 0.8, 0.8), b(5, 0.2, -0.7)],
    timeLimit: 70, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },
  {
    id: 17, name: 'Etage 17 — R&D',
    background: '/game/backgrounds/bg-17.png',
    phrase: 'Le prototype sera pret. Un jour.',
    bubbles: [b(7, 0.2, 0.9), b(7, 0.8, -0.9), b(5, 0.5, 0.7)],
    timeLimit: 65, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },
  {
    id: 18, name: 'Etage 18 — Bureau des plaintes',
    background: '/game/backgrounds/bg-18.png',
    phrase: 'Votre plainte a ete classee. En B14.',
    bubbles: [b(7, 0.3, 0.8), b(6, 0.6, -0.9), b(6, 0.2, 0.7), b(5, 0.8, -0.8)],
    timeLimit: 65, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },
  {
    id: 19, name: 'Etage 19 — Syndicat',
    background: '/game/backgrounds/bg-19.png',
    phrase: 'La greve est dans le reglement interieur.',
    bubbles: [b(7, 0.2, 1.0), b(7, 0.8, -1.0), b(5, 0.4, 0.8), b(5, 0.6, -0.8)],
    timeLimit: 65, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },

  // === Etages 20-24 : Extreme ===
  {
    id: 20, name: 'Etage 20 — Conseil d\'administration',
    background: '/game/backgrounds/bg-20.png',
    phrase: 'Les decisions se prennent au golf.',
    bubbles: [b(7, 0.15, 1.0), b(7, 0.5, -0.9), b(6, 0.85, 0.8), b(6, 0.3, -0.7), b(5, 0.7, 0.9)],
    timeLimit: 60, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },
  {
    id: 21, name: 'Etage 21 — Bureau du PDG',
    background: '/game/backgrounds/bg-21.png',
    phrase: 'Le PDG est en visio. Depuis 2019.',
    bubbles: [b(7, 0.2, 1.0), b(7, 0.8, -1.0), b(6, 0.5, 0.9), b(6, 0.35, -0.8), b(5, 0.65, 0.8)],
    timeLimit: 60, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },
  {
    id: 22, name: 'Etage 22 — Terrasse VIP',
    background: '/game/backgrounds/bg-22.png',
    phrase: 'Vue imprenable. Salaire aussi.',
    bubbles: [b(7, 0.15, 1.0), b(7, 0.5, -1.0), b(7, 0.85, 0.9), b(5, 0.3, -0.8), b(5, 0.7, 0.8)],
    timeLimit: 60, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },
  {
    id: 23, name: 'Etage 23 — Le Dernier Etage',
    background: '/game/backgrounds/bg-23.png',
    phrase: 'Presque libre... presque.',
    bubbles: [b(7, 0.1, 1.1), b(7, 0.4, -1.0), b(7, 0.7, 0.9), b(6, 0.25, -0.8), b(6, 0.55, 0.8), b(5, 0.85, -0.9)],
    timeLimit: 60, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },
  {
    id: 24, name: 'Etage 24 — La Sortie',
    background: '/game/backgrounds/bg-24.png',
    phrase: 'C\'est maintenant ou jamais.',
    bubbles: [b(7, 0.1, 1.1), b(7, 0.35, -1.0), b(7, 0.6, 1.0), b(7, 0.85, -1.1), b(6, 0.25, 0.9), b(5, 0.5, -0.8)],
    timeLimit: 60, bonusWeights: extremeWeights, hasCeilingSpikes: true,
  },
];
