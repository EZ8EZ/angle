export interface Quote {
  id: string;
  name: string;
  color: string;
  isCustom: boolean;
  price: string;
  eta: string;
}

export interface ScoredQuote extends Quote {
  score: number | null;
  priceNum: number | null;
  etaNum: number | null;
}
