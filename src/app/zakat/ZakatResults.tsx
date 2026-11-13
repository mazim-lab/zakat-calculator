"use client";

import type { MethodologyChoices, ZakatResult } from "@/lib/types";
import { Ar } from "@/components/ui";
import {
  GOLD_NISAB_GRAMS_DISPLAY,
  SILVER_NISAB_GRAMS_DISPLAY,
  combinedObligation,
} from "@/lib/zakat/page-math";
import { tidyDash } from "@/lib/zakat/display";
import { JAFARI_GOLD_NISAB_GRAMS, JAFARI_SILVER_NISAB_GRAMS } from "@/lib/calculate";

/** Final step: niṣāb check, total, line-by-line breakdown, Khums (Jaʿfarī) and the disclaimer. */
export function ZakatResults({
  result,
  choices,
  goldPrice,
  silverPrice,
  pricesArePlaceholders,
  fmt,
}: {
  result: ZakatResult;
  choices: MethodologyChoices;
  goldPrice: number;
  silverPrice: number;
  pricesArePlaceholders: boolean;
  fmt: (n: number) => string;
}) {
  const jafari = choices.madhab === "jafari";
  const nisabBasis =
    choices.nisabStandard === "gold"
      ? `${jafari ? JAFARI_GOLD_NISAB_GRAMS : GOLD_NISAB_GRAMS_DISPLAY} g of gold at ${fmt(goldPrice)} per gram`
      : `${jafari ? `about ${JAFARI_SILVER_NISAB_GRAMS} g (derived from 105 ṣayrafī mithqāls)` : `${SILVER_NISAB_GRAMS_DISPLAY} g`} of silver at ${fmt(silverPrice)} per gram`;
  // Crops and livestock have their own minimums, so something can be due even
  // when money is below the niṣāb.
  const visibleDue = result.breakdown.some(
    (b) => b.zakatDue > 0 && /^(Agricultural Produce|Sheep & Goats|Cattle|Camels)$/.test(b.category),
  );

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Niṣāb check */}
      <div className={`callout ${result.meetsNisab ? "callout-success" : "callout-warning"}`}>
        <p className="font-semibold text-text text-[16.5px]">
          {result.meetsNisab ? "Your wealth meets the niṣāb threshold" : "Your wealth is below the niṣāb threshold"}
        </p>
        <p className="text-text-2 mt-1 leading-relaxed">
          {!result.meetsNisab &&
            (visibleDue
              ? "Zakat on money is not obligatory. Crops and livestock have their own minimums and are shown below. "
              : "Zakat is not obligatory. ")}
          Niṣāb used: <span className="num font-semibold text-text">{fmt(result.nisabThreshold)}</span> ({choices.nisabStandard}{" "}
          standard: <span className="num">{nisabBasis}</span>).
        </p>
        {pricesArePlaceholders && (
          <p className="text-text-2 mt-2 text-[14px] leading-relaxed">
            This niṣāb is based on placeholder prices, not live prices. Check a current gold and silver price before you
            rely on it.
          </p>
        )}
      </div>

      {result.warnings?.map((w, i) => (
        <div key={i} className="callout callout-warning" role="note">
          <p className="font-semibold text-text">Part of this case is not supported</p>
          <p className="text-text-2 mt-1 leading-relaxed">{w}</p>
        </div>
      ))}

      {/* Total */}
      <div className="text-center py-4">
        <p className="eyebrow">Your Zakat due</p>
        <p className="num mt-2 text-[clamp(22px,8vw,40px)] sm:text-[52px] font-bold tracking-[-0.02em] leading-tight text-text whitespace-nowrap overflow-x-auto">
          {fmt(result.totalZakatDue)}
        </p>
        <p className="text-text-2 text-sm mt-3">
          Based on {result.methodology}, {choices.yearType === "lunar" ? "lunar" : "solar (+3%)"} year
        </p>
      </div>

      {/* Breakdown */}
      <section aria-labelledby="zk-breakdown-h">
        <h3 id="zk-breakdown-h" className="text-[18px] font-semibold mb-3">
          Detailed breakdown
        </h3>
        <ul className="list-none p-0 m-0 grid gap-2.5">
          {result.breakdown
            .filter((b) => b.amount !== 0)
            .map((item, i) => (
              <li key={i} className="card p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text">{tidyDash(item.category)}</p>
                  <p className="text-[13.5px] text-text-2 mt-0.5 leading-relaxed">{tidyDash(item.notes)}</p>
                </div>
                <div className="sm:text-end shrink-0">
                  <p className="num text-text">
                    {/* Livestock lines carry a head count in `amount`, not money. */}
                    {/^(Sheep & Goats|Cattle|Camels)$/.test(item.category)
                      ? `${item.amount.toLocaleString("en-US")} head`
                      : `${item.amount < 0 ? "-" : ""}${fmt(Math.abs(item.amount))}`}
                  </p>
                  <p className={`num text-sm font-semibold ${item.zakatDue > 0 ? "text-indigo-text" : "text-text-2"}`}>
                    {/* The engine's status decides in-kind and declined lines; a camel herd
                        below the minimum is exempt, not "due in kind". */}
                    {item.status === "in_kind"
                      ? "Due in kind"
                      : item.status === "not_calculated"
                        ? "Not calculated"
                        : item.zakatDue > 0
                          ? `Zakat ${fmt(item.zakatDue)}`
                          : item.amount < 0
                            ? "Deducted"
                            : item.rate === 0
                              ? "Exempt"
                              : fmt(0)}
                  </p>
                </div>
              </li>
            ))}
        </ul>
        {result.breakdown.filter((b) => b.amount !== 0).length === 0 && (
          <p className="text-text-2">You have not entered any assets yet. Go back to any step to add them.</p>
        )}
      </section>

      {/* Summary */}
      <div className="panel">
        <dl className="m-0 grid gap-2">
          <div className="flex justify-between gap-4">
            <dt className="text-text-2">Zakatable base</dt>
            <dd className="m-0 num font-semibold text-text">{fmt(result.totalZakatableWealth)}</dd>
          </div>
          {result.totalNetWealth !== result.totalZakatableWealth && (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-text-2">Net wealth (for niṣāb)</dt>
              <dd className="m-0 num text-text-2">{fmt(result.totalNetWealth)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-text-2">Niṣāb threshold</dt>
            <dd className="m-0 num font-semibold text-text">{fmt(result.nisabThreshold)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border-strong pt-3 mt-1">
            <dt className="font-semibold text-text text-[17px]">Total Zakat due</dt>
            <dd className="m-0 num font-bold text-text text-[19px]">{fmt(result.totalZakatDue)}</dd>
          </div>
        </dl>
      </div>

      {/* Khums summary (Jaʿfarī) */}
      {result.khums && result.khums.khumsDue > 0 && (
        <>
          <section aria-labelledby="zk-khums-h">
            <h3 id="zk-khums-h" className="text-[18px] font-semibold mb-3">
              Khums obligation
            </h3>
            <div className="card hue-indigo hue-stripe p-4 sm:p-5">
              <dl className="m-0 grid gap-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-2">Annual income</dt>
                  <dd className="m-0 num font-semibold">{fmt(result.khums.annualIncome)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-2">Annual expenses</dt>
                  <dd className="m-0 num font-semibold">-{fmt(result.khums.annualExpenses)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-2">Surplus</dt>
                  <dd className="m-0 num font-semibold">{fmt(result.khums.surplus)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-3 mt-1">
                  <dt className="font-semibold text-text text-[17px]">Khums due (20%)</dt>
                  <dd className="m-0 num font-bold text-[19px]">{fmt(result.khums.khumsDue)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <dt className="text-text-2">Sahm al-Imam</dt>
                  <dd className="m-0 num text-text-2">{fmt(result.khums.sahmImam)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <dt className="text-text-2">Sahm al-Sadat</dt>
                  <dd className="m-0 num text-text-2">{fmt(result.khums.sahmSadat)}</dd>
                </div>
              </dl>
            </div>
          </section>

          <div className="card p-5 text-center" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] opacity-80">Combined obligation</p>
            <p className="num text-[30px] font-bold mt-1">{fmt(combinedObligation(result.totalZakatDue, result.khums.khumsDue))}</p>
            <p className="text-sm opacity-80 mt-1">Zakat + Khums</p>
          </div>
        </>
      )}

      {/* Disclaimer (kept from the original) */}
      <div className="text-center text-[13.5px] text-text-2 leading-relaxed px-2 border-t border-border pt-5">
        <p>
          This calculator is a tool to assist you in estimating your Zakat obligation. It is not a substitute for
          consulting a qualified Islamic scholar. For complex situations, please seek personal guidance from a scholar
          familiar with your circumstances.
        </p>
        <p className="mt-3 text-[20px] text-text">
          <Ar>وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ</Ar>
        </p>
        <p className="mt-1 italic">&ldquo;And establish prayer and give Zakat&rdquo; (Al-Baqarah 2:43)</p>
      </div>
    </div>
  );
}
