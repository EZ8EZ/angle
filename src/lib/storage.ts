const WEIGHT_KEY = 'ridetab:priceWeight';
const CUSTOM_SERVICES_KEY = 'ridetab:customServices';

export function loadWeight(): number {
  if (typeof window === 'undefined') return 0.5;
  const raw = window.localStorage.getItem(WEIGHT_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : 0.5;
}

export function saveWeight(weight: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WEIGHT_KEY, String(weight));
}

export function loadCustomServiceNames(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_SERVICES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomServiceNames(names: string[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CUSTOM_SERVICES_KEY, JSON.stringify(names.slice(-6)));
}
