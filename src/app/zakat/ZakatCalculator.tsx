"use client";

import { useState, useEffect, useRef, useId, type ReactNode } from "react";
import Link from "next/link";
import { Madhab, MethodologyChoices, AssetInputs, STEPS } from "@/lib/types";
import { calculateZakat, JAFARI_GOLD_NISAB_GRAMS, JAFARI_SILVER_NISAB_GRAMS } from "@/lib/calculate";
import {
  CURRENCIES,
  fetchExchangeRates,
  fetchMetalPrices,
  getGoldPricePerGram,
  getSilverPricePerGram,
  formatCurrency,
  MetalPrices,
} from "@/lib/currency";
import {
  MADHAB_INFO,
  NISAB_INFO,
  JEWELRY_INFO,
  STOCK_INFO,
  TAX_SHELTERED_INFO,
  DEBT_INFO,
  CRYPTO_INFO,
  AGRICULTURE_INFO,
  YEAR_INFO,
  KHUMS_INFO,
} from "@/lib/scholarly-info";
import { InfoAccordion } from "@/components/InfoAccordion";
import { CurrencyInput } from "@/components/CurrencyInput";
import { OptionCard } from "@/components/OptionCard";
import { defaultAssets, defaultChoices, INITIAL_METAL_PRICES } from "@/lib/zakat/defaults";
import { applyChoice, applyMadhab } from "@/lib/zakat/choices";
import {
  KARAT_OPTIONS,
  jewelryGoldPricePerGram,
  goldNisabValue,
  silverNisabValue,
  metalValue,
  khumsPreview,
  showKhumsPreview,
  equityPercentToHoldings,
  holdingsToEquityPercent,
  progressPercent,
  GOLD_NISAB_GRAMS_DISPLAY,
  SILVER_NISAB_GRAMS_DISPLAY,
} from "@/lib/zakat/page-math";
import { PricePanel, type PriceStatus } from "./PricePanel";
import { ZakatResults } from "./ZakatResults";

const MADHAB_ORDER: Madhab[] = ["hanafi", "maliki", "shafii", "hanbali", "jafari", "custom"];
const RESULTS_STEP = STEPS.length - 1;

/* ---------- small presentational helpers ---------- */

function OptionGroup({ title, children, level = 3 }: { title: string; children: ReactNode; level?: 3 | 4 }) {
  const id = useId();
  const H = level === 3 ? "h3" : "h4";
  return (
    <div>
      <H id={id} className="text-[17px] font-semibold mb-3 text-text">
        {title}
      </H>
      {/* Long badges (e.g. school regions) must wrap at 390px instead of overflowing. */}
      <div role="group" aria-labelledby={id} className="grid gap-2 [&_.chip]:whitespace-normal [&_.chip]:max-w-full">

        {children}
      </div>
    </div>
  );
}

function SubHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="text-[17px] font-semibold text-text">
      {children}
    </h3>
  );
}

function Divider() {
  return <hr className="border-0 border-t border-border my-1" />;
}

function ValueLine({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[14px] text-text-2 num">{children}</p>;
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-text-2 leading-relaxed">{children}</p>;
}

/** Money input showing the selected currency's symbol. Defined at module level so inputs keep focus. */
function Money({ symbol, ...props }: { symbol: string; label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  return <CurrencyInput {...props} prefix={symbol} />;
}

function HoldingsSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        What does this account hold?
      </label>
      <select id={id} value={equityPercentToHoldings(value)} onChange={(e) => onChange(holdingsToEquityPercent(e.target.value))}>
        <option value="equities">Stocks / ETFs / Mutual Funds</option>
        <option value="mixed">Mix of equities &amp; cash</option>
        <option value="cash">Cash / GICs / Bonds only</option>
      </select>
    </div>
  );
}

/* ---------- main component ---------- */

export function ZakatCalculator() {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<MethodologyChoices>(defaultChoices);
  const [assets, setAssets] = useState<AssetInputs>(defaultAssets);
  const [currency, setCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [ratesUpdated, setRatesUpdated] = useState<string | null>(null);
  const [metalPrices, setMetalPrices] = useState<MetalPrices>(INITIAL_METAL_PRICES);
  const [priceStatus, setPriceStatus] = useState<PriceStatus>("loading");

  useEffect(() => {
    fetchExchangeRates().then((data) => {
      if (data) {
        setExchangeRates(data.rates);
        setRatesUpdated(data.lastUpdated);
      }
    });
    fetchMetalPrices().then((p) => {
      setMetalPrices(p);
      setPriceStatus("ready");
    });
  }, []);

  const goldPrice = getGoldPricePerGram(currency, exchangeRates, metalPrices.goldPerGram);
  const silverPrice = getSilverPricePerGram(currency, exchangeRates, metalPrices.silverPerGram);

  const jewelryGoldPrice = jewelryGoldPricePerGram(goldPrice, assets.goldJewelryKarat);
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";
  const fmt = (amount: number) => formatCurrency(amount, currency);
  const pricesArePlaceholders = priceStatus === "loading" || metalPrices.source === "fallback";

  const updateChoice = <K extends keyof MethodologyChoices>(key: K, value: MethodologyChoices[K]) => {
    setChoices((prev) => applyChoice(prev, key, value));
  };

  const updateAsset = <K extends keyof AssetInputs>(key: K, value: AssetInputs[K]) => {
    setAssets((prev) => ({ ...prev, [key]: value }));
  };

  const selectMadhab = (madhab: Madhab) => {
    setChoices((prev) => applyMadhab(prev, madhab));
  };

  // Same call as the original page (it is cheap, so no manual memo; the React Compiler memoizes it).
  const result = calculateZakat(choices, assets, goldPrice, silverPrice);

  const progress = progressPercent(step, STEPS.length);
  const currentStep = STEPS[step];

  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;

  const goNext = () => canGoNext && setStep((s) => s + 1);
  const goBack = () => canGoBack && setStep((s) => s - 1);
  const goTo = (s: number) => setStep(s);

  // Move focus to the step heading whenever the step changes (not on first render).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mobileStepsRef = useRef<HTMLDetailsElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (mobileStepsRef.current) mobileStepsRef.current.open = false;
    headingRef.current?.focus();
  }, [step]);


  const priceProps = {
    status: priceStatus,
    metalPrices,
    goldPrice,
    silverPrice,
    currency,
    exchangeRates,
    ratesUpdated,
    fmt,
  };

  const stepButtons = (cols: string) => (
    <ol className={`list-none p-0 m-0 grid gap-1.5 ${cols}`}>
      {STEPS.map((s, i) => {
        const state = i === step ? "current" : i < step ? "done" : "todo";
        return (
          <li key={s.id} className="min-w-0">
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === step ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${s.title}${state === "done" ? " (visited)" : ""}`}
              className={`w-full min-h-[44px] flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius)] border text-start text-[13px] leading-tight cursor-pointer transition-colors ${
                state === "current"
                  ? "border-[var(--hue)] bg-[var(--hue-bg)] text-text font-semibold"
                  : state === "done"
                  ? "border-border bg-surface text-text hover:border-border-strong"
                  : "border-border bg-surface text-text-2 hover:border-border-strong hover:text-text"
              }`}
            >
              <span
                aria-hidden="true"
                className={`num shrink-0 w-6 h-6 rounded-full grid place-items-center text-[11.5px] ${
                  state === "current"
                    ? "bg-[var(--hue)] text-on-accent"
                    : state === "done"
                    ? "bg-surface-2 text-text"
                    : "bg-surface-2 text-text-2"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 break-words">{s.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="hue-indigo" id="calculator">
      {/* Progress + step navigation */}
      <nav aria-label="Calculator steps" className="mb-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-sm text-text-2">
            Step <span className="num">{step + 1}</span> of <span className="num">{STEPS.length}</span>
          </span>
          <span className="text-sm font-semibold text-text truncate">{currentStep.title}</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Mobile: steps collapse into a disclosure so nothing overflows. */}
        <details ref={mobileStepsRef} className="disclosure mt-3 sm:hidden">
          <summary className="text-[15px]">Jump to a step</summary>
          <div className="disclosure-body">{stepButtons("grid-cols-2")}</div>
        </details>
        {/* Tablet and up: all steps visible. */}
        <div className="hidden sm:block mt-3">{stepButtons("sm:grid-cols-3 lg:grid-cols-4")}</div>
      </nav>

      {/* Step content */}
      <div key={step} className="card p-5 sm:p-7 fade-in">
        <div className="mb-6">
          <p className="eyebrow flex items-center gap-2 mb-1.5">
            <span className="hue-dot" aria-hidden="true" />
            Step {step + 1}
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] outline-none">
            {currentStep.title}
          </h2>
          <p className="text-text-2 mt-1">{currentStep.subtitle}</p>
        </div>

        {/* Step 0: Welcome / Madhab selection */}
        {step === 0 && (
          <div className="space-y-5">
            <Lead>
              Select a school of Islamic jurisprudence to pre-configure your calculation, or choose Custom to make each
              decision yourself.
            </Lead>
            <Link
              href="/find-your-school"
              className="card card-link hue-neutral hue-stripe flex items-center justify-between gap-3 px-4 py-3 text-[15px] font-semibold text-text"
            >
              Not sure which school you follow? Take our short quiz
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0 rtl:rotate-180">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <div className="callout callout-info text-[14.5px]">
              <p className="text-text-2 leading-relaxed">
                <strong className="text-text">How it works:</strong> selecting a school sets that school&apos;s position
                for every step of the calculator: niṣāb standard, jewelry treatment, stock method, debt deduction and
                more. You can still override any single choice in the next step if you follow different guidance on a
                specific question.
              </p>
            </div>

            {/* Currency selector */}
            <div>
              <label htmlFor="zk-currency" className="field-label">
                Currency
              </label>
              <select id="zk-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code}, {c.symbol})
                  </option>
                ))}
              </select>
              {exchangeRates && currency !== "USD" && (
                <p className="field-hint">
                  Exchange rate: 1 USD = <span className="num">{exchangeRates[currency]?.toFixed(4)}</span> {currency}.
                  Gold and silver prices are converted automatically.
                </p>
              )}
            </div>

            <PricePanel {...priceProps} compact />

            <OptionGroup title="School of jurisprudence">
              {MADHAB_ORDER.map((m) => (
                <OptionCard
                  key={m}
                  selected={choices.madhab === m}
                  onClick={() => selectMadhab(m)}
                  title={m === "custom" ? "Custom Configuration" : `${MADHAB_INFO[m].name} School`}
                  subtitle={m === "custom" ? "Make each decision yourself" : MADHAB_INFO[m].nameAr}
                  description={
                    m === "custom"
                      ? "Choose your own position on each question based on your personal research or scholarly guidance."
                      : MADHAB_INFO[m].description
                  }
                  badge={m !== "custom" ? MADHAB_INFO[m].regions : undefined}
                />
              ))}
            </OptionGroup>
          </div>
        )}

        {/* Step 1: Methodology details */}
        {step === 1 && (
          <div className="space-y-6">
            {choices.madhab !== "custom" && (
              <div className="callout callout-info text-[14.5px]">
                <p className="text-text-2 leading-relaxed">
                  These options have been pre-configured based on the{" "}
                  <strong className="text-text">{MADHAB_INFO[choices.madhab]?.name}</strong> school. You may override
                  any choice. If you do, your configuration will be marked as <strong className="text-text">Custom</strong>.
                </p>
              </div>
            )}
            {choices.madhab === "custom" && (
              <div className="callout callout-warning text-[14.5px]">
                <p className="text-text-2 leading-relaxed">
                  <strong className="text-text">Custom configuration:</strong> you have either selected Custom or changed
                  an option from the school default. Each choice below is independent.
                </p>
              </div>
            )}

            <div>
              <OptionGroup title="Niṣāb standard">
                <OptionCard
                  selected={choices.nisabStandard === "gold"}
                  onClick={() => updateChoice("nisabStandard", "gold")}
                  title={`Gold Standard (${choices.madhab === "jafari" ? JAFARI_GOLD_NISAB_GRAMS : GOLD_NISAB_GRAMS_DISPLAY} grams)`}
                  subtitle={`About ${fmt(choices.madhab === "jafari" ? JAFARI_GOLD_NISAB_GRAMS * goldPrice : goldNisabValue(goldPrice))}`}
                  description="Used by the majority of modern scholars. More accurately represents actual wealth."
                />
                <OptionCard
                  selected={choices.nisabStandard === "silver"}
                  onClick={() => updateChoice("nisabStandard", "silver")}
                  title={`Silver Standard (${choices.madhab === "jafari" ? JAFARI_SILVER_NISAB_GRAMS : SILVER_NISAB_GRAMS_DISPLAY} grams)`}
                  subtitle={`About ${fmt(choices.madhab === "jafari" ? JAFARI_SILVER_NISAB_GRAMS * silverPrice : silverNisabValue(silverPrice))}`}
                  description="More cautious approach. It ensures more people fulfill their Zakat obligation."
                />
              </OptionGroup>
              {pricesArePlaceholders && (
                <p className="field-hint">These amounts use placeholder prices until live prices load.</p>
              )}
              <InfoAccordion info={NISAB_INFO} />
            </div>

            <Divider />

            <div>
              <OptionGroup title="Gold and silver jewelry">
                <OptionCard
                  selected={choices.jewelryZakatable}
                  onClick={() => updateChoice("jewelryZakatable", true)}
                  title="Jewelry IS Zakatable"
                  description="All gold and silver is zakatable regardless of whether it's worn."
                  badge="Ḥanafī"
                />
                <OptionCard
                  selected={!choices.jewelryZakatable}
                  onClick={() => updateChoice("jewelryZakatable", false)}
                  title="Worn Jewelry is Exempt"
                  description="Personal jewelry worn as adornment is not subject to Zakat."
                  badge="Majority"
                />
              </OptionGroup>
              <InfoAccordion info={JEWELRY_INFO} />
            </div>

            <Divider />

            <div>
              <OptionGroup title="Calendar year">
                <OptionCard
                  selected={choices.yearType === "lunar"}
                  onClick={() => updateChoice("yearType", "lunar")}
                  title="Lunar Year (354 days)"
                  description="The standard Islamic calendar. Used by all four schools."
                  badge="Standard"
                />
                <OptionCard
                  selected={choices.yearType === "solar"}
                  onClick={() => updateChoice("yearType", "solar")}
                  title="Solar Year (365 days, +3% adjustment)"
                  description="For those calculating on the Gregorian calendar. A 3% increase compensates for the extra days."
                />
              </OptionGroup>
              <InfoAccordion info={YEAR_INFO} />
            </div>
          </div>
        )}

        {/* Step 2: Cash & savings */}
        {step === 2 && (
          <div className="space-y-5">
            <Lead>Enter the total value of all cash and liquid savings you have held for one lunar year or more.</Lead>
            <Money symbol={currencySymbol} label="Cash on Hand" value={assets.cashOnHand} onChange={(v) => updateAsset("cashOnHand", v)} hint="Physical currency in your possession" />
            <Money symbol={currencySymbol} label="Bank Accounts (Checking & Savings)" value={assets.bankAccounts} onChange={(v) => updateAsset("bankAccounts", v)} hint="Total across all accounts" />
            <Money symbol={currencySymbol}
              label="Other Liquid Assets"
              value={assets.otherLiquid}
              onChange={(v) => updateAsset("otherLiquid", v)}
              hint="Gift cards, prepaid cards, money owed to you that is expected to be paid"
            />
          </div>
        )}

        {/* Step 3: Gold & silver */}
        {step === 3 && (
          <div className="space-y-5">
            <Lead>
              Enter the weight of gold and silver you own. For bars and coins, the calculator uses the 24 karat spot
              price. For jewelry, select the karat and the price adjusts for purity automatically.
            </Lead>
            <PricePanel {...priceProps} />

            <div>
              <CurrencyInput
                label="Gold (non-jewelry)"
                value={assets.goldWeightGrams}
                onChange={(v) => updateAsset("goldWeightGrams", v)}
                prefix=""
                suffix="grams"
                placeholder="0"
                hint="Coins, bars, bullion"
              />
              {assets.goldWeightGrams > 0 && <ValueLine>= {fmt(metalValue(assets.goldWeightGrams, goldPrice))}</ValueLine>}
            </div>

            <div className="grid gap-3">
              <CurrencyInput
                label="Gold Jewelry (worn)"
                value={assets.goldJewelryWeightGrams}
                onChange={(v) => updateAsset("goldJewelryWeightGrams", v)}
                prefix=""
                suffix="grams"
                placeholder="0"
                hint={
                  choices.jewelryZakatable
                    ? "Included in your Zakat calculation"
                    : "Exempt per your methodology (worn personal jewelry)"
                }
              />
              <div className="max-w-[220px]">
                <label htmlFor="zk-karat" className="field-label">
                  Jewelry karat
                </label>
                <select id="zk-karat" value={assets.goldJewelryKarat} onChange={(e) => updateAsset("goldJewelryKarat", Number(e.target.value))}>
                  {KARAT_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}kt
                    </option>
                  ))}
                </select>
              </div>
              {assets.goldJewelryWeightGrams > 0 && (
                <ValueLine>
                  About {fmt(assets.goldJewelryWeightGrams * jewelryGoldPrice)}{" "}
                  <span className="text-text-2">
                    ({fmt(jewelryGoldPrice)}/g, {assets.goldJewelryKarat}kt liquidation value)
                  </span>
                  {!choices.jewelryZakatable && <span className="text-text-2"> (exempt)</span>}
                </ValueLine>
              )}
            </div>

            <div>
              <CurrencyInput
                label="Silver (non-jewelry)"
                value={assets.silverWeightGrams}
                onChange={(v) => updateAsset("silverWeightGrams", v)}
                prefix=""
                suffix="grams"
                placeholder="0"
                hint="Coins, bars, silverware held as investment"
              />
              {assets.silverWeightGrams > 0 && <ValueLine>= {fmt(metalValue(assets.silverWeightGrams, silverPrice))}</ValueLine>}
            </div>

            <div>
              <CurrencyInput
                label="Silver Jewelry (worn)"
                value={assets.silverJewelryWeightGrams}
                onChange={(v) => updateAsset("silverJewelryWeightGrams", v)}
                prefix=""
                suffix="grams"
                placeholder="0"
              />
              {assets.silverJewelryWeightGrams > 0 && (
                <ValueLine>
                  = {fmt(metalValue(assets.silverJewelryWeightGrams, silverPrice))}
                  {!choices.jewelryZakatable && <span className="text-text-2"> (exempt)</span>}
                </ValueLine>
              )}
            </div>
            <InfoAccordion info={JEWELRY_INFO} />
          </div>
        )}

        {/* Step 4: Investments */}
        {step === 4 && (
          <div className="space-y-5">
            <Lead>Enter the value of your investment holdings.</Lead>
            <div>
              <OptionGroup title="Calculation method for stocks">
                <OptionCard
                  selected={choices.stockMethod === "full_market_value"}
                  onClick={() => updateChoice("stockMethod", "full_market_value")}
                  title="Full Market Value"
                  description="2.5% on total market value. Best for active/short-term traders."
                  badge="Ḥanafī Majority"
                />
                <OptionCard
                  selected={choices.stockMethod === "zakatable_assets"}
                  onClick={() => updateChoice("stockMethod", "zakatable_assets")}
                  title="Zakatable Assets Method"
                  description="2.5% on your prorated share of the company's zakatable assets. Best for long-term investors."
                  badge="Mālikī / Shāfiʿī / Ḥanbalī"
                />
                <OptionCard
                  selected={choices.stockMethod === "cri_approximation"}
                  onClick={() => updateChoice("stockMethod", "cri_approximation")}
                  title="CRI / 30% Approximation"
                  description="Approximate 30% of market value as zakatable. Best for index fund/ETF holders."
                  badge="FCNA / Modern"
                />
                <OptionCard
                  selected={choices.stockMethod === "dividends_only"}
                  onClick={() => updateChoice("stockMethod", "dividends_only")}
                  title="Dividends Only (10%)"
                  description="10% on dividends received, analogized to agricultural produce."
                  badge="Qaraḍāwī"
                />
              </OptionGroup>
              <InfoAccordion info={STOCK_INFO} />
            </div>

            <Divider />

            {(choices.stockMethod === "zakatable_assets" || choices.stockMethod === "cri_approximation") && (
              <CurrencyInput
                label="Zakatable Assets Percentage"
                value={assets.stocksZakatablePercent}
                onChange={(v) => updateAsset("stocksZakatablePercent", v)}
                prefix=""
                suffix="%"
                hint={
                  choices.stockMethod === "cri_approximation"
                    ? "CRI approximation defaults to about 30% for broad index funds. Adjust if you have specific data for your holdings."
                    : "Percentage of your holdings' companies that are zakatable (cash + receivables + inventory). Default: 30%"
                }
              />
            )}

            <Money symbol={currencySymbol} label="Stocks / Shares" value={assets.stocksMarketValue} onChange={(v) => updateAsset("stocksMarketValue", v)} hint="Current market value of all stock holdings" />

            {choices.stockMethod === "dividends_only" && (
              <Money symbol={currencySymbol} label="Total Dividends Received" value={assets.stocksDividends} onChange={(v) => updateAsset("stocksDividends", v)} hint="Total dividends received during the year" />
            )}

            <Money symbol={currencySymbol} label="Mutual Funds / ETFs" value={assets.mutualFundsETFs} onChange={(v) => updateAsset("mutualFundsETFs", v)} />
            <Money symbol={currencySymbol} label="Bonds / Sukuk" value={assets.bonds} onChange={(v) => updateAsset("bonds", v)} />
            <Money symbol={currencySymbol} label="Other Investments" value={assets.otherInvestments} onChange={(v) => updateAsset("otherInvestments", v)} hint="Any other investment not covered above" />
          </div>
        )}

        {/* Step 5: Real estate */}
        {step === 5 && (
          <div className="space-y-5">
            <Lead>
              Your primary residence is <strong className="text-text">not</strong> subject to Zakat. Rental income and
              property held for sale are zakatable.
            </Lead>
            <Money symbol={currencySymbol}
              label="Net Rental Income (annual)"
              value={assets.rentalIncome}
              onChange={(v) => updateAsset("rentalIncome", v)}
              hint="Total rental income received minus property expenses. This joins your overall wealth."
            />
            <Money symbol={currencySymbol}
              label="Property Held for Sale (market value)"
              value={assets.propertyForSale}
              onChange={(v) => updateAsset("propertyForSale", v)}
              hint="Current market value of any property you are actively holding for sale"
            />
          </div>
        )}

        {/* Step 6: Business */}
        {step === 6 && (
          <div className="space-y-5">
            <Lead>
              Enter business assets. Fixed assets used in operations (machinery, buildings, vehicles) are{" "}
              <strong className="text-text">not</strong> zakatable. Only liquid business assets count.
            </Lead>
            <Money symbol={currencySymbol} label="Business Cash" value={assets.businessCash} onChange={(v) => updateAsset("businessCash", v)} hint="Cash on hand and in business bank accounts" />
            <Money symbol={currencySymbol} label="Inventory (wholesale value)" value={assets.inventory} onChange={(v) => updateAsset("inventory", v)} hint="Current wholesale or market value of goods for sale" />
            <Money symbol={currencySymbol} label="Receivables" value={assets.receivables} onChange={(v) => updateAsset("receivables", v)} hint="Money owed to your business that is expected to be paid" />
          </div>
        )}

        {/* Step 7: Registered & retirement accounts */}
        {step === 7 && (
          <div className="space-y-5">
            <Lead>
              Different account types have different Zakat rulings based on access, tax treatment, and ownership
              characteristics.
            </Lead>

            {/* TFSA / Roth IRA */}
            <div className="space-y-3">
              <SubHeading>TFSA / Roth IRA</SubHeading>
              <div className="callout callout-info text-[14.5px]">
                <p className="text-text-2 leading-relaxed">
                  <strong className="text-text">Near-unanimous:</strong> fully zakatable. You have unrestricted access,
                  contributions are post-tax, and growth is tax-free. All scholars agree these accounts are subject to
                  Zakat on the full balance.
                </p>
              </div>
              <Money symbol={currencySymbol}
                label="TFSA / Roth IRA Balance"
                value={assets.tfsaRothBalance}
                onChange={(v) => updateAsset("tfsaRothBalance", v)}
                hint="Total across all TFSA and/or Roth IRA accounts"
              />
              {assets.tfsaRothBalance > 0 && (
                <div className="space-y-3 ps-3 border-s-2 border-border">
                  <HoldingsSelect value={assets.tfsaEquityPercent} onChange={(v) => updateAsset("tfsaEquityPercent", v)} />
                  {assets.tfsaEquityPercent > 0 && assets.tfsaEquityPercent < 100 && (
                    <CurrencyInput
                      label="Estimated equity portion"
                      value={assets.tfsaEquityPercent}
                      onChange={(v) => updateAsset("tfsaEquityPercent", v)}
                      prefix=""
                      suffix="%"
                      hint="What percentage of this account is in stocks/ETFs/mutual funds?"
                    />
                  )}
                  {assets.tfsaEquityPercent > 0 && (
                    <>
                      <CurrencyInput
                        label="Zakatable assets rate"
                        value={assets.tfsaZakatableAssetsPercent}
                        onChange={(v) => updateAsset("tfsaZakatableAssetsPercent", v)}
                        prefix=""
                        suffix="%"
                        hint="About 30% is the CRI approximation for broad index funds. Use your fund's actual zakatable % if known."
                      />
                      <p className="text-[13.5px] text-text-2 num">
                        {assets.tfsaEquityPercent}% equities × {assets.tfsaZakatableAssetsPercent}% zakatable +{" "}
                        {100 - assets.tfsaEquityPercent}% cash at full value
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <Divider />

            {/* RRSP / 401(k) / Traditional IRA */}
            <OptionGroup title="RRSP / 401(k) / Traditional IRA treatment">
              <OptionCard
                selected={choices.rrspApproach === "full_balance"}
                onClick={() => updateChoice("rrspApproach", "full_balance")}
                title="Full Balance Annually"
                description="Pay 2.5% on the total balance each year. You own it: voluntary contribution, named account, accessible even with penalty."
                badge="FCNA / Ḥanafī"
              />
              <OptionCard
                selected={choices.rrspApproach === "net_after_tax"}
                onClick={() => updateChoice("rrspApproach", "net_after_tax")}
                title="Net Value After Withdrawal Tax"
                description="Deduct estimated withholding tax before calculating Zakat. The government's share isn't truly yours."
                badge="NZF Canada / Ḥanbalī"
              />
              <OptionCard
                selected={choices.rrspApproach === "defer_to_withdrawal"}
                onClick={() => updateChoice("rrspApproach", "defer_to_withdrawal")}
                title="Defer Until Withdrawal"
                description="No annual Zakat. Pay accumulated Zakat when funds are eventually withdrawn."
                badge="Dr. Monzer Kahf / Shāfiʿī"
              />
              <OptionCard
                selected={choices.rrspApproach === "exclude"}
                onClick={() => updateChoice("rrspApproach", "exclude")}
                title="Exclude Entirely"
                description="Not zakatable, because restricted access means incomplete ownership. For Ja'farī: covered by Khums instead."
                badge="Ja'farī / Minority"
              />
            </OptionGroup>

            {choices.rrspApproach !== "exclude" && choices.rrspApproach !== "defer_to_withdrawal" && (
              <div className="space-y-3">
                <Money symbol={currencySymbol}
                  label="RRSP / 401(k) / Traditional IRA Balance"
                  value={assets.rrsp401kBalance}
                  onChange={(v) => updateAsset("rrsp401kBalance", v)}
                  hint="Total across all tax-deferred retirement accounts"
                />
                {choices.rrspApproach === "net_after_tax" && (
                  <CurrencyInput
                    label="Estimated Withdrawal Tax Rate"
                    value={assets.rrspWithholdingTaxPercent}
                    onChange={(v) => updateAsset("rrspWithholdingTaxPercent", v)}
                    prefix=""
                    suffix="%"
                    hint="Canada RRSP: 10% (up to $5K), 20% ($5K to $15K), 30% (over $15K). US 401(k): about 20% federal + state. Enter your estimated effective rate."
                  />
                )}
                {assets.rrsp401kBalance > 0 && (
                  <div className="space-y-3 ps-3 border-s-2 border-border">
                    <HoldingsSelect value={assets.rrspEquityPercent} onChange={(v) => updateAsset("rrspEquityPercent", v)} />
                    {assets.rrspEquityPercent > 0 && assets.rrspEquityPercent < 100 && (
                      <CurrencyInput
                        label="Estimated equity portion"
                        value={assets.rrspEquityPercent}
                        onChange={(v) => updateAsset("rrspEquityPercent", v)}
                        prefix=""
                        suffix="%"
                        hint="What percentage of this account is in stocks/ETFs/mutual funds?"
                      />
                    )}
                    {assets.rrspEquityPercent > 0 && (
                      <>
                        <CurrencyInput
                          label="Zakatable assets rate"
                          value={assets.rrspZakatableAssetsPercent}
                          onChange={(v) => updateAsset("rrspZakatableAssetsPercent", v)}
                          prefix=""
                          suffix="%"
                          hint="About 30% is the CRI approximation for broad index funds. Use your fund's actual zakatable % if known."
                        />
                        <p className="text-[13.5px] text-text-2 num">
                          {assets.rrspEquityPercent}% equities × {assets.rrspZakatableAssetsPercent}% zakatable +{" "}
                          {100 - assets.rrspEquityPercent}% cash at full value
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {choices.rrspApproach === "defer_to_withdrawal" && (
              <div className="callout callout-warning text-[14.5px]">
                <p className="text-text-2 leading-relaxed">
                  <strong className="text-text">Deferred approach:</strong> you may enter your balance for reference.
                  No Zakat is calculated annually, but you must pay accumulated Zakat for all past years each time you
                  make a withdrawal. Keep records of your annual balances.
                </p>
                <div className="mt-3">
                  <Money symbol={currencySymbol}
                    label="RRSP / 401(k) Balance (for reference)"
                    value={assets.rrsp401kBalance}
                    onChange={(v) => updateAsset("rrsp401kBalance", v)}
                    hint="Not included in this year's calculation"
                  />
                </div>
              </div>
            )}

            <Divider />

            {/* Employer match */}
            <div className="space-y-3">
              <SubHeading>Employer-matched retirement</SubHeading>
              <p className="text-[14px] text-text-2 leading-relaxed">
                FCNA: only <strong className="text-text">vested</strong> employer contributions count. Unvested matching
                can be revoked by the employer and is not truly owned by you.
              </p>
              {choices.rrspApproach !== "exclude" && (
                <div className="space-y-3">
                  <Money symbol={currencySymbol}
                    label="Vested Employer Match"
                    value={assets.employerMatchVested}
                    onChange={(v) => updateAsset("employerMatchVested", v)}
                    hint="Employer contributions that are fully vested (cannot be taken back)"
                  />
                  <Money symbol={currencySymbol}
                    label="Unvested Employer Match"
                    value={assets.employerMatchUnvested}
                    onChange={(v) => updateAsset("employerMatchUnvested", v)}
                    hint="Not yet vested. Shown for your records but NOT included in Zakat."
                  />
                </div>
              )}
              {choices.rrspApproach === "exclude" && (
                <p className="text-[14px] text-text-2">
                  Excluded per your methodology. Employer match follows the same treatment as your retirement accounts.
                </p>
              )}
            </div>

            <Divider />

            {/* Defined-benefit pension */}
            <div className="space-y-3">
              <SubHeading>Defined-benefit pension (CPP, OAS, public pension)</SubHeading>
              <div className="callout callout-info text-[14.5px]">
                <p className="text-text-2 leading-relaxed">
                  <strong className="text-text">Generally not zakatable</strong> until received as income. You have no
                  individual account balance, no access before retirement age, and the government controls the funds.
                  Once you begin receiving pension payments, include them under{" "}
                  <strong className="text-text">Cash &amp; Savings</strong> as part of your liquid assets.
                </p>
              </div>
            </div>

            <InfoAccordion info={TAX_SHELTERED_INFO} />
          </div>
        )}

        {/* Step 8: Crypto */}
        {step === 8 && (
          <div className="space-y-5">
            <div>
              <OptionGroup title="How to treat cryptocurrency">
                <OptionCard
                  selected={choices.cryptoTreatment === "like_cash"}
                  onClick={() => updateChoice("cryptoTreatment", "like_cash")}
                  title="Like Currency"
                  description="Add market value to overall wealth, apply 2.5%."
                  badge="Ḥanafī / Modern Majority"
                />
                <OptionCard
                  selected={choices.cryptoTreatment === "like_trade_goods"}
                  onClick={() => updateChoice("cryptoTreatment", "like_trade_goods")}
                  title="Like Trade Goods"
                  description="Treated as a commodity: 2.5% on market value."
                />
                <OptionCard
                  selected={choices.cryptoTreatment === "not_zakatable"}
                  onClick={() => updateChoice("cryptoTreatment", "not_zakatable")}
                  title="Not Zakatable"
                  description="Excluded from Zakat calculation."
                  badge="Ja'farī / Minority"
                />
              </OptionGroup>
              <InfoAccordion info={CRYPTO_INFO} />
            </div>
            <Divider />
            <Money symbol={currencySymbol} label="Total Cryptocurrency Value" value={assets.cryptoValue} onChange={(v) => updateAsset("cryptoValue", v)} hint="Current market value of all crypto holdings" />
          </div>
        )}

        {/* Step 9: Agriculture */}
        {step === 9 && (
          <div className="space-y-5">
            <Lead>
              Agricultural Zakat (ʿUshr) is due at harvest, with no waiting period. Enter the value of your harvest
              produce.
            </Lead>
            <Money
              symbol={currencySymbol}
              label="Harvest value"
              value={assets.cropValueOrWeight}
              onChange={(v) => updateAsset("cropValueOrWeight", v)}
              hint="Market value of the harvest. Zakat is a share of this value."
            />
            <CurrencyInput
              label="Harvest weight"
              value={assets.cropWeightKg ?? 0}
              onChange={(v) => updateAsset("cropWeightKg", v)}
              prefix=""
              suffix="kg"
              hint={
                choices.agriculturalMinimum
                  ? `Used only to check the minimum of five wasqs: ${choices.madhab === "jafari" ? "about 847 kg (Sistani)" : "653 kg as this calculator counts it"}.`
                  : "No minimum threshold per Ḥanafī school, so the weight is not needed."
              }
            />
            <OptionGroup title="Irrigation method">
              <OptionCard
                selected={!assets.isIrrigated}
                onClick={() => updateAsset("isIrrigated", false)}
                title="Rain-fed / Natural (10%)"
                description="Crops watered by rain, springs, or rivers without artificial irrigation"
              />
              <OptionCard
                selected={assets.isIrrigated}
                onClick={() => updateAsset("isIrrigated", true)}
                title="Irrigated / Artificial (5%)"
                description="Crops watered by wells, pumps, or irrigation systems"
              />
            </OptionGroup>
            <InfoAccordion info={AGRICULTURE_INFO} />
          </div>
        )}

        {/* Step 10: Livestock */}
        {step === 10 && (
          <div className="space-y-5">
            <Lead>
              Zakat on livestock applies to free-grazing animals held for one lunar year. Animals kept for trade are
              classified as business inventory instead.
            </Lead>
            <CurrencyInput label="Sheep & Goats" value={assets.sheepGoats} onChange={(v) => updateAsset("sheepGoats", v)} prefix="" suffix="head" integer hint="Minimum: 40 head for Zakat to be due" />
            <CurrencyInput label="Cattle" value={assets.cattle} onChange={(v) => updateAsset("cattle", v)} prefix="" suffix="head" integer hint="Minimum: 30 head for Zakat to be due" />
            <CurrencyInput label="Camels" value={assets.camels} onChange={(v) => updateAsset("camels", v)} prefix="" suffix="head" integer hint="Minimum: 5 head for Zakat to be due" />
          </div>
        )}

        {/* Step 11: Debts */}
        {step === 11 && (
          <div className="space-y-5">
            <div>
              <OptionGroup title="Debt deduction method">
                <OptionCard
                  selected={choices.debtDeduction === "twelve_months_principal"}
                  onClick={() => updateChoice("debtDeduction", "twelve_months_principal")}
                  title="12 Months of Principal Payments"
                  description="Short-term debts fully deducted. Long-term debts: up to 12 months of principal (interest excluded)."
                  badge="Ḥanafī / Ḥanbalī"
                />
                <OptionCard
                  selected={choices.debtDeduction === "single_installment"}
                  onClick={() => updateChoice("debtDeduction", "single_installment")}
                  title="Single Currently-Due Installment"
                  description="Short-term debts fully deducted. Long-term debts: only one month's principal payment."
                  badge="Stricter Ḥanafī / Ḥanbalī"
                />
                <OptionCard
                  selected={choices.debtDeduction === "hidden_wealth_only"}
                  onClick={() => updateChoice("debtDeduction", "hidden_wealth_only")}
                  title="Deductible Against Hidden Wealth Only"
                  description="Debts reduce cash, gold, silver, and trade goods, but not livestock or crops."
                  badge="Mālikī"
                />
                <OptionCard
                  selected={choices.debtDeduction === "no_deduction"}
                  onClick={() => updateChoice("debtDeduction", "no_deduction")}
                  title="No Debt Deduction"
                  description="Debt does not reduce zakatable wealth. Zakat is a right attached to the wealth itself."
                  badge="Shāfiʿī / Jaʿfarī"
                />
              </OptionGroup>
              <InfoAccordion info={DEBT_INFO} />
            </div>

            {choices.debtDeduction !== "no_deduction" && (
              <>
                <Divider />
                <div className="space-y-3">
                  <SubHeading>Short-term debts</SubHeading>
                  <p className="text-[14px] text-text-2">Debts due in full within 12 months. These are fully deductible.</p>
                  <Money symbol={currencySymbol}
                    label="Credit Card Balance"
                    value={assets.creditCardBalance}
                    onChange={(v) => updateAsset("creditCardBalance", v)}
                    hint="Total balance on all credit cards as of your Zakat date"
                  />
                  <Money symbol={currencySymbol}
                    label="Personal Loans (due within 12 months)"
                    value={assets.personalLoans}
                    onChange={(v) => updateAsset("personalLoans", v)}
                    hint="Loans from family, friends, or lenders that are callable or due within a year"
                  />
                  <Money symbol={currencySymbol}
                    label="Other Short-Term Debts"
                    value={assets.otherShortTermDebt}
                    onChange={(v) => updateAsset("otherShortTermDebt", v)}
                    hint="Bills currently due, taxes owed, overdue payments, etc."
                  />
                </div>

                <Divider />

                <div className="space-y-3">
                  <SubHeading>Long-term debts</SubHeading>
                  <p className="text-[14px] text-text-2 leading-relaxed">
                    Enter your <strong className="text-text">monthly</strong> amounts below. The calculator multiplies
                    them by 12 to find your annual deductible debt. Only the{" "}
                    <strong className="text-text">principal portion</strong> is deductible, because interest (ribā) is not
                    a legitimate Islamic liability.
                  </p>
                  {(
                    [
                      ["Mortgage", "monthlyMortgagePrincipal", "Principal-only portion of one month's payment. Check your statement or amortization schedule. The calculator multiplies by 12 for the annual deduction."],
                      ["Student loans", "monthlyStudentLoanPrincipal", "Principal-only portion of one month's payment. The calculator multiplies by 12 for the annual deduction."],
                      ["Car loan", "monthlyCarLoanPrincipal", "Principal-only portion of one month's payment. The calculator multiplies by 12."],
                      ["Other long-term debt", "monthlyOtherLongTermPrincipal", "Any other installment debt (line of credit, business loan, etc.). The calculator multiplies by 12."],
                    ] as const
                  ).map(([title, key, hint]) => (
                    <fieldset key={key} className="panel border-0 m-0 space-y-2">
                      <legend className="float-start w-full text-[15px] font-semibold text-text mb-2">{title}</legend>
                      <Money symbol={currencySymbol} label="Monthly Principal Portion" value={assets[key]} onChange={(v) => updateAsset(key, v)} hint={hint} />
                    </fieldset>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 12: Khums (Jaʿfarī) */}
        {step === 12 && (
          <div className="space-y-5">
            {choices.madhab === "jafari" ? (
              <>
                <Lead>
                  Khums is a 20% tax on your surplus annual income: the amount remaining after deducting all legitimate
                  living expenses for yourself and your family. This is the primary wealth obligation in Ja&apos;farī
                  fiqh, covering what the Sunni schools address through Zakat on cash, investments, and modern assets.
                </Lead>
                <Money symbol={currencySymbol}
                  label="Total Annual Income"
                  value={assets.annualIncome}
                  onChange={(v) => updateAsset("annualIncome", v)}
                  hint="All sources: salary, business profits, gifts, investments, etc."
                />
                <Money symbol={currencySymbol}
                  label="Total Annual Expenses"
                  value={assets.annualExpenses}
                  onChange={(v) => updateAsset("annualExpenses", v)}
                  hint="All legitimate living expenses for yourself and your family"
                />
                <div aria-live="polite">
                  {showKhumsPreview(assets.annualIncome, assets.annualExpenses) &&
                    (() => {
                      const k = khumsPreview(assets.annualIncome, assets.annualExpenses);
                      return (
                        <div className="card hue-indigo hue-stripe p-4">
                          <p className="text-text-2">
                            Surplus: <span className="num text-text font-semibold">{fmt(k.surplus)}</span>
                          </p>
                          <p className="text-[20px] font-bold mt-1">
                            Khums due: <span className="num">{fmt(k.khumsDue)}</span>
                          </p>
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-text-2">
                            <span>
                              Sahm al-Imam: <span className="num">{fmt(k.sahmImam)}</span>
                            </span>
                            <span>
                              Sahm al-Sadat: <span className="num">{fmt(k.sahmSadat)}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                </div>
                <InfoAccordion info={KHUMS_INFO} />
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-text text-[17px]">Khums as an income tax is specific to the Ja&apos;farī (Twelver Shia) school.</p>
                <p className="text-text-2 text-sm mt-2">
                  You may skip this step. In the Sunni schools, Khums applies only to war booty (ghanīma).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 13: Results */}
        {step === RESULTS_STEP && (
          <div className="space-y-6">
            <PricePanel {...priceProps} compact />
            <ZakatResults
              result={result}
              choices={choices}
              goldPrice={goldPrice}
              silverPrice={silverPrice}
              pricesArePlaceholders={pricesArePlaceholders}
              fmt={fmt}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 mt-5">
        <button type="button" onClick={goBack} disabled={!canGoBack} className="btn btn-ghost">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="rtl:rotate-180">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {step >= 2 && step < RESULTS_STEP && (
          <div className="text-center min-w-0">
            <p className="text-[12px] text-text-2">Running total</p>
            <p className="num font-semibold text-[16px] text-text truncate">{fmt(result.totalZakatDue)}</p>
          </div>
        )}

        {canGoNext ? (
          <button type="button" onClick={goNext} className="btn btn-primary">
            {step === RESULTS_STEP - 1 ? "See results" : "Continue"}
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="rtl:rotate-180">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button type="button" onClick={() => goTo(0)} className="btn btn-primary">
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
