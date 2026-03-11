import { NextResponse } from "next/server";

const TROY_OZ_GRAMS = 31.1035;

// Fallback prices — keep these roughly current as a safety net
// Last updated: 2026-03-11 (gold ~$5,180/oz, silver ~$86/oz)
const FALLBACK_GOLD_PER_GRAM = 167;
const FALLBACK_SILVER_PER_GRAM = 2.76;

interface YahooChartResult {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
      };
    }>;
  };
}

async function fetchYahooPrice(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      const data: YahooChartResult = await res.json();
      return data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
    }
  } catch {
    // fall through
  }
  return null;
}

export async function GET() {
  // Fetch gold (GC=F) and silver (SI=F) futures from Yahoo Finance
  const [goldOz, silverOz] = await Promise.all([
    fetchYahooPrice("GC=F"),
    fetchYahooPrice("SI=F"),
  ]);

  if (goldOz && silverOz) {
    return NextResponse.json(
      {
        goldPerGram: Math.round((goldOz / TROY_OZ_GRAMS) * 100) / 100,
        silverPerGram: Math.round((silverOz / TROY_OZ_GRAMS) * 100) / 100,
        goldPerOz: Math.round(goldOz * 100) / 100,
        silverPerOz: Math.round(silverOz * 100) / 100,
        source: "live",
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  }

  // Fallback if Yahoo is unreachable
  return NextResponse.json(
    {
      goldPerGram: FALLBACK_GOLD_PER_GRAM,
      silverPerGram: FALLBACK_SILVER_PER_GRAM,
      goldPerOz: Math.round(FALLBACK_GOLD_PER_GRAM * TROY_OZ_GRAMS * 100) / 100,
      silverPerOz: Math.round(FALLBACK_SILVER_PER_GRAM * TROY_OZ_GRAMS * 100) / 100,
      source: "fallback",
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
