import type { Quote, ScoredQuote } from './types';

function parseNum(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Ranks quotes by a weighted blend of price and time.
 * Each dimension is min-max normalized across the entered quotes only
 * (there's no absolute "good price" — only better/worse than the alternatives on the table).
 */
export function scoreQuotes(quotes: Quote[], priceWeight: number): ScoredQuote[] {
  const parsed = quotes.map((q) => ({
    ...q,
    priceNum: parseNum(q.price),
    etaNum: parseNum(q.eta),
  }));

  const complete = parsed.filter((q) => q.priceNum !== null && q.etaNum !== null);

  if (complete.length < 2) {
    return parsed.map((q) => ({ ...q, score: null }));
  }

  const prices = complete.map((q) => q.priceNum as number);
  const etas = complete.map((q) => q.etaNum as number);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const minE = Math.min(...etas);
  const maxE = Math.max(...etas);

  return parsed.map((q) => {
    if (q.priceNum === null || q.etaNum === null) {
      return { ...q, score: null };
    }
    const priceScore = maxP === minP ? 1 : (maxP - q.priceNum) / (maxP - minP);
    const etaScore = maxE === minE ? 1 : (maxE - q.etaNum) / (maxE - minE);
    const combined = priceWeight * priceScore + (1 - priceWeight) * etaScore;
    return { ...q, score: Math.round(combined * 100) };
  });
}
