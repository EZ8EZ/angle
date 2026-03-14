// Launch date — Day 1
const LAUNCH_DATE = new Date('2025-03-14');

const ANGLES = [
  23, 37, 52, 67, 78, 103, 118, 141, 156, 197,
  214, 233, 248, 262, 289, 307, 322, 344,
];

function dateToDay(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const launch = new Date(LAUNCH_DATE.getFullYear(), LAUNCH_DATE.getMonth(), LAUNCH_DATE.getDate());
  return Math.floor((d.getTime() - launch.getTime()) / 86400000) + 1;
}

/** Simple seeded hash for consistent daily pick */
function seededIndex(dayNumber: number, len: number): number {
  let h = dayNumber * 2654435761;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = (h >>> 16) ^ h;
  return Math.abs(h) % len;
}

export function getDayNumber(): number {
  return dateToDay(new Date());
}

export function getTodayAngle(): number {
  const day = getDayNumber();
  return ANGLES[seededIndex(day, ANGLES.length)];
}

export function computeScore(guess: number, answer: number): number {
  let diff = Math.abs(guess - answer);
  if (diff > 180) diff = 360 - diff;
  if (diff >= 45) return 0;
  return Math.round(100 * (1 - diff / 45));
}

export function getAngularDifference(guess: number, answer: number): number {
  let diff = Math.abs(guess - answer);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// ---------- localStorage persistence ----------

const STORAGE_KEY = 'angle-game';

export interface GameState {
  dayNumber: number;
  guess: number | null;
  score: number | null;
  answer: number | null;
}

export interface Stats {
  gamesPlayed: number;
  streak: number;
  lastDay: number;
  bestScore: number;
  totalScore: number;
  scores: number[]; // last 100 scores for distribution
}

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    if (state.dayNumber === getDayNumber()) return state;
    return null; // stale day
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const STATS_KEY = 'angle-stats';

export function loadStats(): Stats {
  if (typeof window === 'undefined')
    return { gamesPlayed: 0, streak: 0, lastDay: 0, bestScore: 0, totalScore: 0, scores: [] };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { gamesPlayed: 0, streak: 0, lastDay: 0, bestScore: 0, totalScore: 0, scores: [] };
    return JSON.parse(raw) as Stats;
  } catch {
    return { gamesPlayed: 0, streak: 0, lastDay: 0, bestScore: 0, totalScore: 0, scores: [] };
  }
}

export function saveStats(stats: Stats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordScore(score: number): Stats {
  const stats = loadStats();
  const day = getDayNumber();
  if (stats.lastDay === day) return stats; // already recorded

  stats.gamesPlayed += 1;
  stats.totalScore += score;
  if (score > stats.bestScore) stats.bestScore = score;
  stats.streak = stats.lastDay === day - 1 ? stats.streak + 1 : 1;
  stats.lastDay = day;
  stats.scores = [...stats.scores.slice(-99), score];
  saveStats(stats);
  return stats;
}

export function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
