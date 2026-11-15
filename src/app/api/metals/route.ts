import { NextResponse } from "next/server";
import {
  FALLBACK_GOLD_USD_PER_GRAM,
  FALLBACK_SILVER_USD_PER_GRAM,
  FALLBACK_PRICES_AS_OF,
} from "@/lib/metal-fallback";

const TROY_OZ_GRAMS = 31.1035;

// Fallback prices: a safety net, kept with their as-of date in
// src/lib/metal-fallback.ts.
const FALLBACK_GOLD_PER_GRAM = FALLBACK_GOLD_USD_PER_GRAM;
const FALLBACK_SILVER_PER_GRAM = FALLBACK_SILVER_USD_PER_GRAM;

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

// Edge cache for Cloudflare Workers only.
//
// On Vercel the CDN caches this route using the s-maxage header below. On
// Cloudflare Workers the CDN does not cache a Worker's own response, so
// without this every visit to /zakat would call Yahoo Finance. The Workers
// Cache API (caches.default) keeps one copy per Cloudflare data centre for the
// same s-maxage time (1 hour for live prices, 5 minutes for the fallback).
//
// Node.js (Vercel, next dev, the tests) has no caches.default, so there this
// is skipped and the route behaves exactly as before. Any cache error is
// ignored and the route answers from Yahoo or the fallback as usual.
const EDGE_CACHE_KEY = "https://www.islamichisab.com/__edge-cache/api/metals";

function workersEdgeCache(): Cache | null {
  const storage = (globalThis as unknown as { caches?: { default?: Cache } }).caches;
  return storage?.default ?? null;
}

export async function GET() {
  const cache = workersEdgeCache();
  if (cache) {
    try {
      const hit = await cache.match(EDGE_CACHE_KEY);
      if (hit) return new Response(hit.body, hit);
    } catch {
      // fall through to a fresh fetch
    }
  }

  const response = await buildPricesResponse();

  if (cache) {
    try {
      await cache.put(EDGE_CACHE_KEY, response.clone());
    } catch {
      // caching is best effort
    }
  }
  return response;
}

async function buildPricesResponse(): Promise<Response> {
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
      asOf: FALLBACK_PRICES_AS_OF,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
