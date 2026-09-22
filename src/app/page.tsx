'use client';

import { useEffect, useMemo, useState } from 'react';
import QuoteRow from '@/components/QuoteRow';
import WeightSlider from '@/components/WeightSlider';
import { scoreQuotes } from '@/lib/score';
import { loadWeight, saveWeight } from '@/lib/storage';
import type { Quote } from '@/lib/types';

const DEFAULT_QUOTES: Quote[] = [
  { id: 'uber', name: 'Uber', color: '#111111', isCustom: false, price: '', eta: '' },
  { id: 'lyft', name: 'Lyft', color: '#EA0B8C', isCustom: false, price: '', eta: '' },
  { id: 'waymo', name: 'Waymo', color: '#0A9B8F', isCustom: false, price: '', eta: '' },
];

const CUSTOM_COLORS = ['#6366F1', '#F59E0B', '#EF4444', '#0891B2', '#8B5CF6'];

function emptyCustomQuote(index: number): Quote {
  return {
    id: `custom-${Date.now()}-${index}`,
    name: '',
    color: CUSTOM_COLORS[index % CUSTOM_COLORS.length],
    isCustom: true,
    price: '',
    eta: '',
  };
}

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>(DEFAULT_QUOTES);
  const [weight, setWeight] = useState(0.5);
  const [customCount, setCustomCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWeight(loadWeight());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWeight(weight);
  }, [weight, hydrated]);

  const scored = useMemo(() => scoreQuotes(quotes, weight), [quotes, weight]);

  const bestId = useMemo(() => {
    let best: { id: string; score: number } | null = null;
    for (const q of scored) {
      if (q.score !== null && (best === null || q.score > best.score)) {
        best = { id: q.id, score: q.score };
      }
    }
    return best?.id ?? null;
  }, [scored]);

  const filledCount = scored.filter((q) => q.score !== null).length;

  function updateQuote(id: string, field: 'name' | 'price' | 'eta', value: string) {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  }

  function removeQuote(id: string) {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }

  function addCustomQuote() {
    setQuotes((prev) => [...prev, emptyCustomQuote(customCount)]);
    setCustomCount((c) => c + 1);
  }

  function resetAll() {
    setQuotes(DEFAULT_QUOTES);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-16 pt-8">
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">RideTab</h1>
          <p className="text-sm text-neutral-500">Enter each quote, get the best value.</p>
        </div>
        <button
          onClick={resetAll}
          className="text-xs font-medium text-neutral-400 hover:text-neutral-600"
        >
          Reset
        </button>
      </header>

      <WeightSlider weight={weight} onChange={setWeight} />

      <div className="mt-4 space-y-3">
        {scored.map((q) => (
          <QuoteRow
            key={q.id}
            quote={q}
            rank={q.id === bestId ? 0 : null}
            onChange={(field, value) => updateQuote(q.id, field, value)}
            onRemove={() => removeQuote(q.id)}
          />
        ))}
      </div>

      <button
        onClick={addCustomQuote}
        className="mt-3 w-full rounded-2xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
      >
        + Add another service
      </button>

      {filledCount < 2 && (
        <p className="mt-6 text-center text-xs text-neutral-400">
          Enter price &amp; ETA for at least two services to see a score.
        </p>
      )}

      <p className="mt-10 text-center text-[11px] leading-relaxed text-neutral-300">
        Score compares only the quotes you&apos;ve entered — it&apos;s not pulled live from any app.
        Check each app for the actual quote before you book.
      </p>
    </main>
  );
}
