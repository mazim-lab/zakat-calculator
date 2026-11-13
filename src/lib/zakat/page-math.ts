// Pure arithmetic that used to live inline in the original /zakat page
// (src/app/zakat/page.tsx at base commit b1e9d29, frozen copy in
// tests/reference/original/pages/zakat.page.tsx.txt).
//
// Every table and expression below is copied VERBATIM from that page; only the
// variable names were turned into function parameters. tests/zakat.test.ts
// proves equality against the frozen original source.
//
// None of this feeds calculateZakat(): the page used these values for display
// only (niṣāb previews, per-gram jewelry value, Khums preview, combined total).
// calculateZakat() in src/lib/calculate.ts keeps its own copies.

/**
 * Gold jewelry liquidation value as fraction of spot (based on dealer buyback data).
 * Original page lines 113-116.
 */
export const KARAT_LIQUIDATION: Record<number, number> = {
  24: 0.780, 22: 0.699, 21: 0.666, 18: 0.569, 14: 0.439, 10: 0.309, 9: 0.276,
};

/** Karat options offered in the jewelry karat select (original page lines 480-486). */
export const KARAT_OPTIONS = [24, 22, 21, 18, 14, 10, 9] as const;

/** Original: `KARAT_LIQUIDATION[assets.goldJewelryKarat] ?? 0.699` (line 117). */
export function jewelryLiquidationFor(goldJewelryKarat: number): number {
  return KARAT_LIQUIDATION[goldJewelryKarat] ?? 0.699;
}

/** Original: `goldPrice * jewelryLiquidation` (line 118). */
export function jewelryGoldPricePerGram(goldPrice: number, goldJewelryKarat: number): number {
  const jewelryLiquidation = jewelryLiquidationFor(goldJewelryKarat);
  return goldPrice * jewelryLiquidation;
}

/** Original: `assets.goldJewelryWeightGrams * jewelryGoldPrice` (line 492). */
export function jewelryGoldValue(goldJewelryWeightGrams: number, goldPrice: number, goldJewelryKarat: number): number {
  const jewelryGoldPrice = jewelryGoldPricePerGram(goldPrice, goldJewelryKarat);
  return goldJewelryWeightGrams * jewelryGoldPrice;
}

/** Grams shown on the niṣāb options. Same figures as GOLD_NISAB_GRAMS / SILVER_NISAB_GRAMS in calculate.ts. */
export const GOLD_NISAB_GRAMS_DISPLAY = 85;
export const SILVER_NISAB_GRAMS_DISPLAY = 595;

/** Original: `85 * goldPrice` (line 329). */
export function goldNisabValue(goldPrice: number): number {
  return 85 * goldPrice;
}

/** Original: `595 * silverPrice` (line 336). */
export function silverNisabValue(silverPrice: number): number {
  return 595 * silverPrice;
}

/** Original: `goldPrice * 31.1035` (line 433), grams per troy ounce. */
export function goldPricePerOunce(goldPrice: number): number {
  return goldPrice * 31.1035;
}

/** Original: `assets.goldWeightGrams * goldPrice`, `assets.silverWeightGrams * silverPrice` etc. (lines 453, 510, 525). */
export function metalValue(weightGrams: number, pricePerGram: number): number {
  return weightGrams * pricePerGram;
}

export interface KhumsPreview {
  surplus: number;
  khumsDue: number;
  sahmImam: number;
  sahmSadat: number;
}

/**
 * Live Khums preview on the Khums step (original lines 1220-1231). The original
 * only renders it when `annualIncome > annualExpenses`; see showKhumsPreview().
 */
export function khumsPreview(annualIncome: number, annualExpenses: number): KhumsPreview {
  return {
    surplus: (annualIncome - annualExpenses),
    khumsDue: ((annualIncome - annualExpenses) * 0.2),
    sahmImam: ((annualIncome - annualExpenses) * 0.1),
    sahmSadat: ((annualIncome - annualExpenses) * 0.1),
  };
}

/** Original render condition: `assets.annualIncome > assets.annualExpenses` (line 1220). */
export function showKhumsPreview(annualIncome: number, annualExpenses: number): boolean {
  return annualIncome > annualExpenses;
}

/** Original: `(result.totalZakatDue + result.khums.khumsDue)` (line 1426). */
export function combinedObligation(totalZakatDue: number, khumsDue: number): number {
  return (totalZakatDue + khumsDue);
}

export type HoldingsChoice = "cash" | "equities" | "mixed";

/** Original select value: `p === 0 ? "cash" : p === 100 ? "equities" : "mixed"` (lines 709, 814). */
export function equityPercentToHoldings(equityPercent: number): HoldingsChoice {
  return equityPercent === 0 ? "cash" : equityPercent === 100 ? "equities" : "mixed";
}

/** Original onChange: `v === "cash" ? 0 : v === "equities" ? 100 : 70` (lines 712, 817). */
export function holdingsToEquityPercent(v: string): number {
  return v === "cash" ? 0 : v === "equities" ? 100 : 70;
}

/** Original: `((step + 1) / STEPS.length) * 100` (line 159). */
export function progressPercent(step: number, totalSteps: number): number {
  return ((step + 1) / totalSteps) * 100;
}
