export default function ServiceDot({ color, letter }: { color: string; letter: string }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {letter}
    </span>
  );
}
