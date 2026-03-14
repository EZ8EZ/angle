// Launch date — Day 1
const LAUNCH_DATE = new Date('2025-03-14');

const NUM_ROUNDS = 3;

const ANGLES = [
  23, 37, 52, 67, 78, 103, 118, 141, 156, 197,
  214, 233, 248, 262, 289, 307, 322, 344,
];

function dateToDay(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const launch = new Date(LAUNCH_DATE.getFullYear(), LAUNCH_DATE.getMonth(), LAUNCH_DATE.getDate());
  return Math.floor((d.getTime() - launch.getTime()) / 86400000) + 1;
}

/** Seeded hash — different salt per round */
function seededHash(seed: number): number {
  let h = (seed * 2654435761) >>> 0;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = (h >>> 16) ^ h;
  return h >>> 0;
}

export function getDayNumber(): number {
  return dateToDay(new Date());
}

export function getNumRounds(): number {
  return NUM_ROUNDS;
}

/** Get the target angle for a specific round (0-indexed) */
export function getRoundAngle(round: number): number {
  const day = getDayNumber();
  const h = seededHash(day * 100 + round);
  return ANGLES[h % ANGLES.length];
}

/** Get random rotation offset for a specific round */
export function getRoundRotation(round: number): number {
  const day = getDayNumber();
  const h = seededHash(day * 100 + round + 50);
  return h % 360;
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

const STORAGE_KEY = 'angle-game-v2';

export interface RoundResult {
  guess: number;
  answer: number;
  rotation: number;
  score: number;
}

export interface GameState {
  dayNumber: number;
  currentRound: number; // 0-indexed, equals NUM_ROUNDS when complete
  rounds: RoundResult[];
  complete: boolean;
}

export interface Stats {
  gamesPlayed: number;
  streak: number;
  lastDay: number;
  bestScore: number; // best total (out of 300)
  totalScore: number;
  scores: number[]; // last 100 daily totals for distribution
}

export function emptyGameState(): GameState {
  return {
    dayNumber: getDayNumber(),
    currentRound: 0,
    rounds: [],
    complete: false,
  };
}

export function loadGameState(): GameState {
  if (typeof window === 'undefined') return emptyGameState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyGameState();
    const state = JSON.parse(raw) as GameState;
    if (state.dayNumber === getDayNumber()) return state;
    return emptyGameState();
  } catch {
    return emptyGameState();
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const STATS_KEY = 'angle-stats-v2';

const DEFAULT_STATS: Stats = {
  gamesPlayed: 0,
  streak: 0,
  lastDay: 0,
  bestScore: 0,
  totalScore: 0,
  scores: [],
};

export function loadStats(): Stats {
  if (typeof window === 'undefined') return { ...DEFAULT_STATS };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return JSON.parse(raw) as Stats;
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: Stats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordDayScore(totalScore: number): Stats {
  const stats = loadStats();
  const day = getDayNumber();
  if (stats.lastDay === day) return stats;

  stats.gamesPlayed += 1;
  stats.totalScore += totalScore;
  if (totalScore > stats.bestScore) stats.bestScore = totalScore;
  stats.streak = stats.lastDay === day - 1 ? stats.streak + 1 : 1;
  stats.lastDay = day;
  stats.scores = [...stats.scores.slice(-99), totalScore];
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
