export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا" },
];

// Fallback prices in USD per gram (used only if live API fails)
// Last updated: 2026-03-11 (gold ~$5,180/oz, silver ~$86/oz)
const FALLBACK_GOLD_USD = 167;
const FALLBACK_SILVER_USD = 2.76;

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

export interface MetalPrices {
  goldPerGram: number;
  silverPerGram: number;
  goldPerOz: number;
  silverPerOz: number;
  source: "live" | "fallback";
  timestamp: number;
}

export async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    if (data.result === "success") {
      return {
        base: "USD",
        rates: data.rates,
        lastUpdated: data.time_last_update_utc,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchMetalPrices(): Promise<MetalPrices> {
  try {
    const res = await fetch("/api/metals");
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fall through
  }
  return {
    goldPerGram: FALLBACK_GOLD_USD,
    silverPerGram: FALLBACK_SILVER_USD,
    goldPerOz: FALLBACK_GOLD_USD * 31.1035,
    silverPerOz: FALLBACK_SILVER_USD * 31.1035,
    source: "fallback",
    timestamp: 0,
  };
}

export function getGoldPricePerGram(
  currency: string,
  rates: Record<string, number> | null,
  baseUsdPrice: number = FALLBACK_GOLD_USD
): number {
  if (!rates || !rates[currency]) return baseUsdPrice;
  return baseUsdPrice * rates[currency];
}

export function getSilverPricePerGram(
  currency: string,
  rates: Record<string, number> | null,
  baseUsdPrice: number = FALLBACK_SILVER_USD
): number {
  if (!rates || !rates[currency]) return baseUsdPrice;
  return baseUsdPrice * rates[currency];
}

export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
