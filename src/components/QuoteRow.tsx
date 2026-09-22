import type { ScoredQuote } from '@/lib/types';
import ServiceDot from './ServiceDot';

interface Props {
  quote: ScoredQuote;
  rank: number | null;
  onChange: (field: 'name' | 'price' | 'eta', value: string) => void;
  onRemove: () => void;
}

export default function QuoteRow({ quote, rank, onChange, onRemove }: Props) {
  const isBest = rank === 0 && quote.score !== null;
  const letter = (quote.name.trim()[0] || '?').toUpperCase();

  return (
    <div
      className={`rounded-2xl border p-3 transition-colors ${
        isBest ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <ServiceDot color={quote.color} letter={letter} />

        {quote.isCustom ? (
          <input
            value={quote.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Service name"
            className="min-w-0 flex-1 border-b border-dashed border-neutral-300 bg-transparent pb-0.5 text-sm font-medium text-neutral-900 outline-none focus:border-neutral-500"
          />
        ) : (
          <span className="flex-1 text-sm font-medium text-neutral-900">{quote.name}</span>
        )}

        {isBest && (
          <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            Best value
          </span>
        )}

        {quote.isCustom && (
          <button
            onClick={onRemove}
            aria-label={`Remove ${quote.name || 'service'}`}
            className="shrink-0 text-neutral-300 hover:text-neutral-500"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Price
          </span>
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-neutral-400">
            <span className="mr-1 text-neutral-400">$</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={quote.price}
              onChange={(e) => onChange('price', e.target.value)}
              className="w-full min-w-0 bg-transparent text-base outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            ETA
          </span>
          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-neutral-400">
            <input
              inputMode="numeric"
              placeholder="0"
              value={quote.eta}
              onChange={(e) => onChange('eta', e.target.value)}
              className="w-full min-w-0 bg-transparent text-base outline-none"
            />
            <span className="ml-1 text-neutral-400">min</span>
          </div>
        </label>
      </div>

      {quote.score !== null && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${quote.score}%`, backgroundColor: isBest ? '#059669' : '#a3a3a3' }}
            />
          </div>
          <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-neutral-500">
            {quote.score}
          </span>
        </div>
      )}
    </div>
  );
}
