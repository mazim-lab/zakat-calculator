import { NextResponse } from "next/server";

const TROY_OZ_GRAMS = 31.1035;

// Fallback prices (updated periodically as a safety net)
const FALLBACK_GOLD_PER_GRAM = 93; // ~$2,890/oz
const FALLBACK_SILVER_PER_GRAM = 1.03; // ~$32/oz

export async function GET() {
  // Try goldprice.org data feed (no API key needed)
  try {
    const res = await fetch("https://data-asg.goldprice.org/dbXRates/USD", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const item = data?.items?.[0];
      if (item?.xauPrice && item?.xagPrice) {
        return NextResponse.json(
          {
            goldPerGram: Math.round((item.xauPrice / TROY_OZ_GRAMS) * 100) / 100,
            silverPerGram: Math.round((item.xagPrice / TROY_OZ_GRAMS) * 100) / 100,
            goldPerOz: item.xauPrice,
            silverPerOz: item.xagPrice,
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
    }
  } catch {
    // fall through to fallback
  }

  return NextResponse.json(
    {
      goldPerGram: FALLBACK_GOLD_PER_GRAM,
      silverPerGram: FALLBACK_SILVER_PER_GRAM,
      goldPerOz: FALLBACK_GOLD_PER_GRAM * TROY_OZ_GRAMS,
      silverPerOz: FALLBACK_SILVER_PER_GRAM * TROY_OZ_GRAMS,
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
