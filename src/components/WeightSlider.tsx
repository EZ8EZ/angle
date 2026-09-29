interface Props {
  weight: number;
  onChange: (weight: number) => void;
}

export default function WeightSlider({ weight, onChange }: Props) {
  const pricePct = Math.round(weight * 100);
  const timePct = 100 - pricePct;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-neutral-400">
        <span>Cheaper</span>
        <span>Faster</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pricePct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-neutral-900"
      />
      <p className="mt-2 text-center text-xs text-neutral-500">
        Weighing price <span className="font-semibold text-neutral-800">{pricePct}%</span> · time{' '}
        <span className="font-semibold text-neutral-800">{timePct}%</span>
      </p>
    </div>
  );
}
