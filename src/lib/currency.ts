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

// Gold/silver prices in USD per gram (updated periodically)
const GOLD_PRICE_USD = 95;
const SILVER_PRICE_USD = 1.05;

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
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

export function getGoldPricePerGram(currency: string, rates: Record<string, number> | null): number {
  if (!rates || !rates[currency]) return GOLD_PRICE_USD;
  return GOLD_PRICE_USD * rates[currency];
}

export function getSilverPricePerGram(currency: string, rates: Record<string, number> | null): number {
  if (!rates || !rates[currency]) return SILVER_PRICE_USD;
  return SILVER_PRICE_USD * rates[currency];
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
