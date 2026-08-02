import { SavedTripDoc } from "@/types/trip";

export interface CurrencySymbolMap {
  [code: string]: string;
}

export const CURRENCY_SYMBOLS: CurrencySymbolMap = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  AED: "AED ",
  SGD: "S$",
  CHF: "CHF ",
  CNY: "¥",
  THB: "฿",
  KRW: "₩",
  MXN: "MEX$",
  BRL: "R$",
};

export const SUPPORTED_CURRENCIES = [
  { code: "INR", label: "India (INR - ₹)", symbol: "₹" },
  { code: "USD", label: "United States (USD - $)", symbol: "$" },
  { code: "EUR", label: "Eurozone (EUR - €)", symbol: "€" },
  { code: "GBP", label: "United Kingdom (GBP - £)", symbol: "£" },
  { code: "JPY", label: "Japan (JPY - ¥)", symbol: "¥" },
  { code: "AUD", label: "Australia (AUD - A$)", symbol: "A$" },
  { code: "CAD", label: "Canada (CAD - C$)", symbol: "C$" },
  { code: "AED", label: "UAE (AED)", symbol: "AED " },
  { code: "SGD", label: "Singapore (SGD - S$)", symbol: "S$" },
  { code: "THB", label: "Thailand (THB - ฿)", symbol: "฿" },
];

// Fallback rates relative to USD if live fetch fails
const FALLBACK_USD_RATES: { [code: string]: number } = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5,
  JPY: 155.0,
  AUD: 1.52,
  CAD: 1.36,
  AED: 3.67,
  SGD: 1.35,
  THB: 36.5,
  CHF: 0.90,
  CNY: 7.23,
  KRW: 1370.0,
};

// In-Memory cache for exchange rates
let ratesCache: { [code: string]: number } | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Fetch live exchange rates relative to USD
 */
export async function getExchangeRates(): Promise<{ [code: string]: number }> {
  const now = Date.now();
  if (ratesCache && now - lastCacheTime < CACHE_TTL) {
    return ratesCache;
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (response.ok) {
      const data = await response.json();
      if (data && data.rates) {
        ratesCache = data.rates;
        lastCacheTime = now;
        return data.rates;
      }
    }
  } catch (err) {
    console.warn("Live exchange rate API failed, using cached fallback rates:", err);
  }

  return FALLBACK_USD_RATES;
}

/**
 * Convert an amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string
): Promise<number> {
  if (fromCode === toCode) return amount;

  const rates = await getExchangeRates();
  const fromRate = rates[fromCode] || FALLBACK_USD_RATES[fromCode] || 1;
  const toRate = rates[toCode] || FALLBACK_USD_RATES[toCode] || 1;

  // Convert to USD first, then to target currency
  const amountInUsd = amount / fromRate;
  return amountInUsd * toRate;
}

/**
 * Format dual currency string: e.g. "₹1,450 (≈ ¥2,500)" or "€25 (≈ ₹2,250)"
 */
export function formatDualCurrency(
  destAmount: number,
  destCurrency: string = "USD",
  homeCurrency: string = "INR",
  conversionRate?: number
): { primaryFormatted: string; secondaryFormatted: string; fullFormatted: string } {
  const destSymbol = CURRENCY_SYMBOLS[destCurrency] || destCurrency + " ";
  const homeSymbol = CURRENCY_SYMBOLS[homeCurrency] || homeCurrency + " ";

  // Estimate conversion if rate is provided or calculate fallback
  let homeAmount = destAmount;
  if (conversionRate && conversionRate > 0) {
    homeAmount = destAmount * conversionRate;
  } else {
    const destInUsdRate = FALLBACK_USD_RATES[destCurrency] || 1;
    const homeInUsdRate = FALLBACK_USD_RATES[homeCurrency] || 1;
    homeAmount = (destAmount / destInUsdRate) * homeInUsdRate;
  }

  const destFormatted = `${destSymbol}${Math.round(destAmount).toLocaleString()}`;
  const homeFormatted = `${homeSymbol}${Math.round(homeAmount).toLocaleString()}`;

  const isSameCurrency = destCurrency === homeCurrency || destFormatted === homeFormatted;

  return {
    primaryFormatted: homeFormatted,
    secondaryFormatted: destFormatted,
    fullFormatted: isSameCurrency ? homeFormatted : `${homeFormatted} (≈ ${destFormatted})`,
  };
}
