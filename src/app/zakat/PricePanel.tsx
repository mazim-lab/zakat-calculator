"use client";

import type { MetalPrices } from "@/lib/currency";
import { goldPricePerOunce } from "@/lib/zakat/page-math";

export type PriceStatus = "loading" | "ready";

function formatDateTime(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toISOString();
  }
}

/**
 * Shows the gold and silver prices the calculator is using, per gram in the
 * selected currency, with the source and time. Warns clearly when the figures
 * are placeholders (before load, or when the live source failed).
 */
export function PricePanel({
  status,
  metalPrices,
  goldPrice,
  silverPrice,
  currency,
  exchangeRates,
  ratesUpdated,
  fmt,
  compact = false,
}: {
  status: PriceStatus;
  metalPrices: MetalPrices;
  goldPrice: number;
  silverPrice: number;
  currency: string;
  exchangeRates: Record<string, number> | null;
  ratesUpdated: string | null;
  fmt: (n: number) => string;
  compact?: boolean;
}) {
  const isLive = status === "ready" && metalPrices.source === "live";
  const asOf = isLive && metalPrices.timestamp > 0 ? formatDateTime(new Date(metalPrices.timestamp)) : "";
  // getGold/SilverPricePerGram fall back to the USD figure when there is no rate for the currency.
  const notConverted = currency !== "USD" && (!exchangeRates || !exchangeRates[currency]);
  const ratesAsOf = ratesUpdated ? formatDateTime(new Date(ratesUpdated)) : "";

  return (
    <div className="card p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Prices used in this calculation</p>
        {isLive ? (
          <span className="chip chip-green">
            <span className="hue-dot" style={{ background: "var(--success)" }} aria-hidden="true" />
            Live market price
          </span>
        ) : status === "loading" ? (
          <span className="chip">Loading live prices</span>
        ) : (
          <span className="chip chip-amber">Fallback placeholder</span>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 m-0">
        <div>
          <dt className="text-[13.5px] text-text-2">Gold, per gram</dt>
          <dd className="m-0 num text-[18px] font-semibold text-text">{fmt(goldPrice)}</dd>
          {!compact && <dd className="m-0 num text-[13px] text-text-2">{fmt(goldPricePerOunce(goldPrice))} per troy oz</dd>}
        </div>
        <div>
          <dt className="text-[13.5px] text-text-2">Silver, per gram</dt>
          <dd className="m-0 num text-[18px] font-semibold text-text">{fmt(silverPrice)}</dd>
        </div>
      </dl>

      {/* Fixed-height status line so the panel does not jump when prices arrive. */}
      <p className="mt-3 text-[13.5px] text-text-2 leading-relaxed min-h-[2.6em]">
        {isLive && (
          <>
            Live market price{asOf ? <>, as of <span className="num">{asOf}</span></> : null}. Source: Yahoo Finance quotes for
            gold and silver futures, converted to grams.
          </>
        )}
        {status === "loading" && <>Fetching the latest gold and silver prices.</>}
        {status === "ready" && metalPrices.source === "fallback" && (
          <>Live prices could not be loaded, so the calculator is using stored fallback figures.</>
        )}
      </p>

      {!isLive && (
        <div className="callout callout-warning mt-2 text-[14px]">
          <p className="font-semibold text-text">These prices are placeholders</p>
          <p className="text-text-2 mt-1 leading-relaxed">
            The figures shown were last set by hand on 11 March 2026 and may be well out of date. Gold and silver prices
            move every day, and the niṣāb depends on them. Please check a current price before you rely on the result.
          </p>
        </div>
      )}

      {notConverted && (
        <div className="callout callout-warning mt-2 text-[14px]">
          <p className="text-text-2 leading-relaxed">
            Exchange rates have not loaded, so these prices are still in US dollars, not {currency}. The result will be
            wrong until rates load. You can switch the currency to USD, or try again later.
          </p>
        </div>
      )}

      {!notConverted && currency !== "USD" && exchangeRates && (
        <p className="mt-2 text-[13px] text-text-2">
          Converted at 1 USD = <span className="num">{exchangeRates[currency]?.toFixed(4)}</span> {currency}
          {ratesAsOf ? <>, rate as of <span className="num">{ratesAsOf}</span></> : null}.
        </p>
      )}
    </div>
  );
}
