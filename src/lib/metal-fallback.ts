// Stored fallback metal prices, used only when the live source in
// /api/metals cannot be reached. Taken from the same source that route uses
// (Yahoo Finance chart API, gold futures GC=F and silver futures SI=F),
// fetched on 2026-11-13 at 16:57 UTC: gold 3,883.20 USD per troy ounce,
// silver 48.955 USD per troy ounce, divided by 31.1035 g per troy ounce.
// Update the date with the figures, and keep the page's fallback warning.
export const FALLBACK_PRICES_AS_OF = "2026-11-13";
export const FALLBACK_PRICES_AS_OF_LABEL = "13 November 2026";
export const FALLBACK_GOLD_USD_PER_GRAM = 124.85;
export const FALLBACK_SILVER_USD_PER_GRAM = 1.57;
export const FALLBACK_GOLD_USD_PER_OZ = 3883.2;
export const FALLBACK_SILVER_USD_PER_OZ = 48.96;
