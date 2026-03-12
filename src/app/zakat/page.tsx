"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Madhab,
  MethodologyChoices,
  AssetInputs,
  MADHAB_PRESETS,
  STEPS,
} from "@/lib/types";
import { calculateZakat } from "@/lib/calculate";
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

const defaultAssets: AssetInputs = {
  annualIncome: 0,
  annualExpenses: 0,
  cashOnHand: 0,
  bankAccounts: 0,
  otherLiquid: 0,
  goldWeightGrams: 0,
  silverWeightGrams: 0,
  goldJewelryWeightGrams: 0,
  silverJewelryWeightGrams: 0,
  stocksMarketValue: 0,
  stocksZakatablePercent: 30,
  stocksDividends: 0,
  mutualFundsETFs: 0,
  bonds: 0,
  otherInvestments: 0,
  rentalIncome: 0,
  propertyForSale: 0,
  businessCash: 0,
  inventory: 0,
  receivables: 0,
  tfsaRothBalance: 0,
  rrsp401kBalance: 0,
  rrspWithholdingTaxPercent: 30,
  employerMatchVested: 0,
  employerMatchUnvested: 0,
  cryptoValue: 0,
  cropValueOrWeight: 0,
  isIrrigated: false,
  sheepGoats: 0,
  cattle: 0,
  camels: 0,
  creditCardBalance: 0,
  personalLoans: 0,
  otherShortTermDebt: 0,
  monthlyMortgagePayment: 0,
  monthlyMortgagePrincipal: 0,
  monthlyStudentLoanPayment: 0,
  monthlyStudentLoanPrincipal: 0,
  monthlyCarLoanPayment: 0,
  monthlyCarLoanPrincipal: 0,
  monthlyOtherLongTermPayment: 0,
  monthlyOtherLongTermPrincipal: 0,
};

const defaultChoices: MethodologyChoices = {
  madhab: "hanafi",
  ...MADHAB_PRESETS.hanafi,
};

export default function Home() {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<MethodologyChoices>(defaultChoices);
  const [assets, setAssets] = useState<AssetInputs>(defaultAssets);
  const [currency, setCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [metalPrices, setMetalPrices] = useState<MetalPrices>({
    goldPerGram: 167, silverPerGram: 2.76, goldPerOz: 5194, silverPerOz: 85.85, source: "fallback", timestamp: 0,
  });

  useEffect(() => {
    fetchExchangeRates().then((data) => {
      if (data) setExchangeRates(data.rates);
    });
    fetchMetalPrices().then(setMetalPrices);
  }, []);

  const goldPrice = getGoldPricePerGram(currency, exchangeRates, metalPrices.goldPerGram);
  const silverPrice = getSilverPricePerGram(currency, exchangeRates, metalPrices.silverPerGram);
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";
  const fmt = (amount: number) => formatCurrency(amount, currency);

  const updateChoice = <K extends keyof MethodologyChoices>(
    key: K,
    value: MethodologyChoices[K]
  ) => {
    setChoices((prev) => {
      const updated = { ...prev, [key]: value };
      // If user changes a methodology option, check if it still matches the selected preset
      if (key !== "madhab" && prev.madhab !== "custom") {
        const preset = MADHAB_PRESETS[prev.madhab as Exclude<Madhab, "custom">];
        const diverged = (Object.keys(preset) as (keyof typeof preset)[]).some(
          (k) => (k === key ? value : prev[k]) !== preset[k]
        );
        if (diverged) {
          updated.madhab = "custom";
        }
      }
      return updated;
    });
  };

  const updateAsset = <K extends keyof AssetInputs>(
    key: K,
    value: AssetInputs[K]
  ) => {
    setAssets((prev) => ({ ...prev, [key]: value }));
  };

  const selectMadhab = (madhab: Madhab) => {
    if (madhab === "custom") {
      setChoices((prev) => ({ ...prev, madhab: "custom" }));
    } else {
      setChoices({ madhab, ...MADHAB_PRESETS[madhab] });
    }
  };

  const result = useMemo(() => calculateZakat(choices, assets, goldPrice, silverPrice), [choices, assets, goldPrice, silverPrice]);

  const progress = ((step + 1) / STEPS.length) * 100;
  const currentStep = STEPS[step];

  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;

  const goNext = () => canGoNext && setStep((s) => s + 1);
  const goBack = () => canGoBack && setStep((s) => s - 1);
  const goTo = (s: number) => setStep(s);

  return (
    <div className="min-h-screen relative">
      {/* Arabesque background pattern */}
      <div className="arabesque-bg" />

      {/* Luminous top gradient */}
      <div className="luminous-header fixed top-0 left-0 right-0 h-64 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <p className="bismillah mb-4">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          <h1 className="heading-display text-4xl sm:text-5xl text-[var(--ink)] mb-3">
            Zakat Calculator
          </h1>
          <div className="gold-line max-w-48 mx-auto mb-3" />
          <p className="text-[var(--ink-muted)] text-lg max-w-lg mx-auto leading-relaxed">
            Calculate your obligation with confidence, guided by the wisdom of Islamic scholarship
          </p>
        </header>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--ink-faint)]">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-[var(--emerald)]">
              {currentStep.icon} {currentStep.title}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === step
                    ? "bg-[var(--emerald)] scale-125"
                    : i < step
                    ? "bg-[var(--emerald-light)] opacity-50"
                    : "bg-[var(--sand-dark)]"
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="card p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="heading-display text-2xl sm:text-3xl text-[var(--ink)] mb-1">
                  {currentStep.title}
                </h2>
                <p className="text-[var(--ink-muted)] text-base">{currentStep.subtitle}</p>
                <div className="gold-line max-w-24 mt-3" />
              </div>

              {/* Step 0: Welcome / Madhab Selection */}
              {step === 0 && (
                <div className="space-y-3">
                  <p className="text-[var(--ink-light)] leading-relaxed mb-4">
                    Select a school of Islamic jurisprudence to pre-configure your calculation,
                    or choose Custom to make each decision yourself.
                    <a href="/find-your-school" className="block mt-3 text-sm font-semibold text-[var(--gold-dark)] hover:text-[var(--emerald)] bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-xl px-4 py-2.5 transition-all hover:shadow-sm no-underline">
                      🧭 Not sure which school you follow? Take our short quiz →
                    </a>
                  </p>
                  <div className="bg-[var(--info-bg)] border border-[var(--info-border)] rounded-xl p-4 mb-4 text-sm text-[var(--ink-muted)]">
                    <strong>How it works:</strong> Selecting a school will automatically configure the recommended positions for every step of the calculator — nisab standard, jewelry treatment, stock method, debt deduction, and more. You can still override any individual choice in the next step if you follow different guidance on a specific question.
                  </div>

                  {/* Currency selector */}
                  <div className="mb-6">
                    <label className="block font-['Amiri',serif] font-bold text-lg mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-[var(--sand)] bg-[var(--cream-light)] text-[var(--ink)] font-medium focus:border-[var(--emerald)] focus:outline-none transition-colors"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.symbol} — {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                    {exchangeRates && currency !== "USD" && (
                      <p className="text-xs text-[var(--ink-faint)] mt-1.5">
                        Exchange rate: 1 USD = {exchangeRates[currency]?.toFixed(4)} {currency}. Gold/silver prices auto-converted.
                      </p>
                    )}
                  </div>
                  {(["hanafi", "maliki", "shafii", "hanbali", "jafari", "custom"] as Madhab[]).map(
                    (m) => (
                      <OptionCard
                        key={m}
                        selected={choices.madhab === m}
                        onClick={() => selectMadhab(m)}
                        title={
                          m === "custom"
                            ? "Custom Configuration"
                            : `${MADHAB_INFO[m].name} School`
                        }
                        subtitle={
                          m === "custom"
                            ? "Make each decision yourself"
                            : MADHAB_INFO[m].nameAr
                        }
                        description={
                          m === "custom"
                            ? "Choose your own position on each question based on your personal research or scholarly guidance."
                            : MADHAB_INFO[m].description
                        }
                        badge={
                          m !== "custom" ? MADHAB_INFO[m].regions : undefined
                        }
                      />
                    )
                  )}
                </div>
              )}

              {/* Step 1: Methodology Details */}
              {step === 1 && (
                <div className="space-y-6">
                  {choices.madhab !== "custom" && (
                    <div className="bg-[var(--info-bg)] border border-[var(--info-border)] rounded-xl p-4 text-sm text-[var(--ink-muted)]">
                      These options have been pre-configured based on the <strong>{MADHAB_INFO[choices.madhab]?.name}</strong> school. You may override any choice — if you do, your configuration will be marked as <strong>Custom</strong>.
                    </div>
                  )}
                  {choices.madhab === "custom" && (
                    <div className="bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-xl p-4 text-sm text-[var(--ink-muted)]">
                      ✏️ <strong>Custom configuration</strong> — you&apos;ve either selected Custom or changed an option from the school default. Each choice below is independent.
                    </div>
                  )}
                  {/* Nisab */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-xl mb-3">
                      Nisab Standard
                    </h3>
                    <div className="space-y-2">
                      <OptionCard
                        selected={choices.nisabStandard === "gold"}
                        onClick={() => updateChoice("nisabStandard", "gold")}
                        title="Gold Standard (85 grams)"
                        subtitle={`~${fmt(85 * goldPrice)}`}
                        description="Used by the majority of modern scholars. More accurately represents actual wealth."
                      />
                      <OptionCard
                        selected={choices.nisabStandard === "silver"}
                        onClick={() => updateChoice("nisabStandard", "silver")}
                        title="Silver Standard (595 grams)"
                        subtitle={`~${fmt(595 * silverPrice)}`}
                        description="More cautious approach — ensures more people fulfill their Zakat obligation."
                      />
                    </div>
                    <InfoAccordion info={NISAB_INFO} />
                  </div>

                  <div className="gold-line" />

                  {/* Jewelry */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-xl mb-3">
                      Gold & Silver Jewelry
                    </h3>
                    <div className="space-y-2">
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
                    </div>
                    <InfoAccordion info={JEWELRY_INFO} />
                  </div>

                  <div className="gold-line" />

                  {/* Year Type */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-xl mb-3">
                      Calendar Year
                    </h3>
                    <div className="space-y-2">
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
                    </div>
                    <InfoAccordion info={YEAR_INFO} />
                  </div>
                </div>
              )}

              {/* Step 2: Cash & Savings */}
              {step === 2 && (
                <div className="space-y-5">
                  <p className="text-[var(--ink-light)] leading-relaxed">
                    Enter the total value of all cash and liquid savings you have held for
                    one lunar year or more.
                  </p>
                  <CurrencyInput
                    label="Cash on Hand"
                    value={assets.cashOnHand}
                    onChange={(v) => updateAsset("cashOnHand", v)}
                    hint="Physical currency in your possession"
                  />
                  <CurrencyInput
                    label="Bank Accounts (Checking & Savings)"
                    value={assets.bankAccounts}
                    onChange={(v) => updateAsset("bankAccounts", v)}
                    hint="Total across all accounts"
                  />
                  <CurrencyInput
                    label="Other Liquid Assets"
                    value={assets.otherLiquid}
                    onChange={(v) => updateAsset("otherLiquid", v)}
                    hint="Gift cards, prepaid cards, money owed to you that is expected to be paid"
                  />
                </div>
              )}

              {/* Step 3: Gold & Silver */}
              {step === 3 && (
                <div className="space-y-5">
                  <p className="text-[var(--ink-light)] leading-relaxed">
                    Enter the weight of gold and silver you own. For jewelry, enter the weight
                    of the actual gold/silver content, not the total weight of the piece.
                  </p>
                  <div className="bg-[var(--info-bg)] border border-[var(--info-border)] rounded-xl p-3 text-sm text-[var(--ink-muted)]">
                    <span className="font-medium">Current prices:</span>{" "}
                    Gold {fmt(goldPrice)}/g ({fmt(goldPrice * 31.1035)}/oz) · Silver {fmt(silverPrice)}/g
                    {metalPrices.source === "live" && (
                      <span className="ml-1 text-[var(--emerald)]">● Live</span>
                    )}
                    {metalPrices.source === "fallback" && (
                      <span className="ml-1 text-[var(--gold-dark)]">● Estimated</span>
                    )}
                  </div>
                  <CurrencyInput
                    label="Gold (non-jewelry)"
                    value={assets.goldWeightGrams}
                    onChange={(v) => updateAsset("goldWeightGrams", v)}
                    prefix=""
                    suffix="grams"
                    placeholder="0"
                    hint="Coins, bars, bullion"
                  />
                  <CurrencyInput
                    label="Gold Jewelry (worn)"
                    value={assets.goldJewelryWeightGrams}
                    onChange={(v) => updateAsset("goldJewelryWeightGrams", v)}
                    prefix=""
                    suffix="grams"
                    placeholder="0"
                    hint={
                      choices.jewelryZakatable
                        ? "✓ Included in your Zakat calculation"
                        : "✗ Exempt per your methodology (worn personal jewelry)"
                    }
                  />
                  <CurrencyInput
                    label="Silver (non-jewelry)"
                    value={assets.silverWeightGrams}
                    onChange={(v) => updateAsset("silverWeightGrams", v)}
                    prefix=""
                    suffix="grams"
                    placeholder="0"
                    hint="Coins, bars, silverware held as investment"
                  />
                  <CurrencyInput
                    label="Silver Jewelry (worn)"
                    value={assets.silverJewelryWeightGrams}
                    onChange={(v) => updateAsset("silverJewelryWeightGrams", v)}
                    prefix=""
                    suffix="grams"
                    placeholder="0"
                  />
                  <InfoAccordion info={JEWELRY_INFO} />
                </div>
              )}

              {/* Step 4: Investments */}
              {step === 4 && (
                <div className="space-y-5">
                  <p className="text-[var(--ink-light)] leading-relaxed">
                    Enter the value of your investment holdings.
                  </p>

                  {/* Stock method selection */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-3">
                      Calculation Method for Stocks
                    </h3>
                    <div className="space-y-2">
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
                    </div>
                    <InfoAccordion info={STOCK_INFO} />
                  </div>

                  <div className="gold-line" />

                  <CurrencyInput
                    label="Stocks / Shares"
                    value={assets.stocksMarketValue}
                    onChange={(v) => updateAsset("stocksMarketValue", v)}
                    hint="Current market value of all stock holdings"
                  />

                  {choices.stockMethod === "zakatable_assets" && (
                    <CurrencyInput
                      label="Zakatable Assets Percentage"
                      value={assets.stocksZakatablePercent}
                      onChange={(v) => updateAsset("stocksZakatablePercent", v)}
                      prefix=""
                      suffix="%"
                      hint="Percentage of your holdings' companies that are zakatable (cash + receivables + inventory). Default: 30%"
                    />
                  )}

                  {choices.stockMethod === "dividends_only" && (
                    <CurrencyInput
                      label="Total Dividends Received"
                      value={assets.stocksDividends}
                      onChange={(v) => updateAsset("stocksDividends", v)}
                      hint="Total dividends received during the year"
                    />
                  )}

                  <CurrencyInput
                    label="Mutual Funds / ETFs"
                    value={assets.mutualFundsETFs}
                    onChange={(v) => updateAsset("mutualFundsETFs", v)}
                  />
                  <CurrencyInput
                    label="Bonds / Sukuk"
                    value={assets.bonds}
                    onChange={(v) => updateAsset("bonds", v)}
                  />
                  <CurrencyInput
                    label="Other Investments"
                    value={assets.otherInvestments}
                    onChange={(v) => updateAsset("otherInvestments", v)}
                    hint="Any other investment not covered above"
                  />
                </div>
              )}

              {/* Step 5: Real Estate */}
              {step === 5 && (
                <div className="space-y-5">
                  <p className="text-[var(--ink-light)] leading-relaxed">
                    Your primary residence is <strong>not</strong> subject to Zakat. Rental income
                    and property held for sale are zakatable.
                  </p>
                  <CurrencyInput
                    label="Net Rental Income (annual)"
                    value={assets.rentalIncome}
                    onChange={(v) => updateAsset("rentalIncome", v)}
                    hint="Total rental income received minus property expenses. This joins your overall wealth."
                  />
                  <CurrencyInput
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
                  <p className="text-[var(--ink-light)] leading-relaxed">
                    Enter business assets. Fixed assets used in operations (machinery, buildings,
                    vehicles) are <strong>not</strong> zakatable — only liquid business assets.
                  </p>
                  <CurrencyInput
                    label="Business Cash"
                    value={assets.businessCash}
                    onChange={(v) => updateAsset("businessCash", v)}
                    hint="Cash on hand and in business bank accounts"
                  />
                  <CurrencyInput
                    label="Inventory (wholesale value)"
                    value={assets.inventory}
                    onChange={(v) => updateAsset("inventory", v)}
                    hint="Current wholesale/market value of goods for sale"
                  />
                  <CurrencyInput
                    label="Receivables"
                    value={assets.receivables}
                    onChange={(v) => updateAsset("receivables", v)}
                    hint="Money owed to your business that is expected to be paid"
                  />
                </div>
              )}

              {/* Step 7: Tax-Sheltered / Registered & Retirement Accounts */}
              {step === 7 && (
                <div className="space-y-5">
                  <p className="text-[var(--ink-light)] leading-relaxed">
                    Different account types have different Zakat rulings based on access,
                    tax treatment, and ownership characteristics.
                  </p>

                  {/* TFSA / Roth IRA — always zakatable */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-1">
                      TFSA / Roth IRA
                    </h3>
                    <div className="bg-[var(--info-bg)] border border-[var(--info-border)] rounded-xl p-3 mb-3 text-sm text-[var(--ink-muted)]">
                      <strong>Near-unanimous:</strong> Fully zakatable. You have unrestricted access,
                      contributions are post-tax, and growth is tax-free. All scholars agree these
                      accounts are subject to Zakat on the full balance.
                    </div>
                    <CurrencyInput
                      label="TFSA / Roth IRA Balance"
                      value={assets.tfsaRothBalance}
                      onChange={(v) => updateAsset("tfsaRothBalance", v)}
                      hint="Total across all TFSA and/or Roth IRA accounts"
                    />
                  </div>

                  <div className="gold-line" />

                  {/* RRSP / 401(k) / Traditional IRA — scholarly disagreement */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-3">
                      RRSP / 401(k) / Traditional IRA Treatment
                    </h3>
                    <div className="space-y-2">
                      <OptionCard
                        selected={choices.rrspApproach === "full_balance"}
                        onClick={() => updateChoice("rrspApproach", "full_balance")}
                        title="Full Balance Annually"
                        description="Pay 2.5% on the total balance each year. You own it — voluntary contribution, named account, accessible even with penalty."
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
                        description="No annual Zakat — pay accumulated Zakat when funds are eventually withdrawn."
                        badge="Dr. Monzer Kahf / Shāfiʿī"
                      />
                      <OptionCard
                        selected={choices.rrspApproach === "exclude"}
                        onClick={() => updateChoice("rrspApproach", "exclude")}
                        title="Exclude Entirely"
                        description="Not zakatable — restricted access means incomplete ownership. For Ja'farī: covered by Khums instead."
                        badge="Ja'farī / Minority"
                      />
                    </div>
                  </div>

                  {choices.rrspApproach !== "exclude" && choices.rrspApproach !== "defer_to_withdrawal" && (
                    <>
                      <CurrencyInput
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
                          hint="Canada RRSP: 10% (≤$5K), 20% ($5K–$15K), 30% (>$15K). US 401(k): ~20% federal + state. Enter your estimated effective rate."
                        />
                      )}
                    </>
                  )}

                  {choices.rrspApproach === "defer_to_withdrawal" && (
                    <div className="bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-xl p-4 text-sm text-[var(--ink-muted)]">
                      <strong>Deferred approach:</strong> You may enter your balance for reference.
                      No Zakat is calculated annually — but you must pay accumulated Zakat for all
                      past years each time you make a withdrawal. Keep records of your annual balances.
                      <div className="mt-3">
                        <CurrencyInput
                          label="RRSP / 401(k) Balance (for reference)"
                          value={assets.rrsp401kBalance}
                          onChange={(v) => updateAsset("rrsp401kBalance", v)}
                          hint="Not included in this year's calculation"
                        />
                      </div>
                    </div>
                  )}

                  <div className="gold-line" />

                  {/* Employer Match */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-1">
                      Employer-Matched Retirement
                    </h3>
                    <p className="text-xs text-[var(--ink-faint)] mb-3">
                      FCNA: Only <strong>vested</strong> employer contributions count — unvested
                      matching can be revoked by the employer and is not truly owned by you.
                    </p>
                    {choices.rrspApproach !== "exclude" && (
                      <div className="space-y-3">
                        <CurrencyInput
                          label="Vested Employer Match"
                          value={assets.employerMatchVested}
                          onChange={(v) => updateAsset("employerMatchVested", v)}
                          hint="Employer contributions that are fully vested (cannot be taken back)"
                        />
                        <CurrencyInput
                          label="Unvested Employer Match"
                          value={assets.employerMatchUnvested}
                          onChange={(v) => updateAsset("employerMatchUnvested", v)}
                          hint="Not yet vested — shown for your records but NOT included in Zakat"
                        />
                      </div>
                    )}
                    {choices.rrspApproach === "exclude" && (
                      <p className="text-sm text-[var(--ink-muted)]">
                        Excluded per your methodology — employer match follows the same treatment as your retirement accounts.
                      </p>
                    )}
                  </div>

                  <div className="gold-line" />

                  {/* Defined-Benefit Pension */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-1">
                      Defined-Benefit Pension (CPP, OAS, Public Pension)
                    </h3>
                    <div className="bg-[var(--info-bg)] border border-[var(--info-border)] rounded-xl p-3 text-sm text-[var(--ink-muted)]">
                      <strong>Generally not zakatable</strong> until received as income. You have no
                      individual account balance, no access before retirement age, and the government
                      controls the funds. Once you begin receiving pension payments, include them
                      under <strong>Cash &amp; Savings</strong> as part of your liquid assets.
                    </div>
                  </div>

                  <InfoAccordion info={TAX_SHELTERED_INFO} />
                </div>
              )}

              {/* Step 8: Crypto */}
              {step === 8 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-3">
                      How to Treat Cryptocurrency
                    </h3>
                    <div className="space-y-2">
                      <OptionCard
                        selected={choices.cryptoTreatment === "like_cash"}
                        onClick={() =>
                          updateChoice("cryptoTreatment", "like_cash")
                        }
                        title="Like Currency"
                        description="Add market value to overall wealth, apply 2.5%."
                        badge="Ḥanafī / Modern Majority"
                      />
                      <OptionCard
                        selected={choices.cryptoTreatment === "like_trade_goods"}
                        onClick={() =>
                          updateChoice("cryptoTreatment", "like_trade_goods")
                        }
                        title="Like Trade Goods"
                        description="Treated as a commodity — 2.5% on market value."
                      />
                      <OptionCard
                        selected={choices.cryptoTreatment === "not_zakatable"}
                        onClick={() =>
                          updateChoice("cryptoTreatment", "not_zakatable")
                        }
                        title="Not Zakatable"
                        description="Excluded from Zakat calculation."
                        badge="Ja'farī / Minority"
                      />
                    </div>
                    <InfoAccordion info={CRYPTO_INFO} />
                  </div>

                  <div className="gold-line" />

                  <CurrencyInput
                    label="Total Cryptocurrency Value"
                    value={assets.cryptoValue}
                    onChange={(v) => updateAsset("cryptoValue", v)}
                    hint="Current market value of all crypto holdings"
                  />
                </div>
              )}

              {/* Step 9: Agriculture */}
              {step === 9 && (
                <div className="space-y-5">
                  <p className="text-[var(--ink-light)] leading-relaxed">
                    Agricultural Zakat (ʿUshr) is due at harvest — no waiting period required.
                    Enter the value of your harvest produce.
                  </p>

                  <CurrencyInput
                    label="Crop Value / Weight (kg or $)"
                    value={assets.cropValueOrWeight}
                    onChange={(v) => updateAsset("cropValueOrWeight", v)}
                    prefix=""
                    hint={
                      choices.agriculturalMinimum
                        ? "Minimum threshold: 653 kg (5 wasqs)"
                        : "No minimum threshold per Ḥanafī school"
                    }
                  />

                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-3">
                      Irrigation Method
                    </h3>
                    <div className="space-y-2">
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
                    </div>
                  </div>
                  <InfoAccordion info={AGRICULTURE_INFO} />
                </div>
              )}

              {/* Step 10: Livestock */}
              {step === 10 && (
                <div className="space-y-5">
                  <p className="text-[var(--ink-light)] leading-relaxed">
                    Zakat on livestock applies to free-grazing animals held for one lunar year.
                    Animals kept for trade are classified as business inventory instead.
                  </p>
                  <CurrencyInput
                    label="Sheep & Goats"
                    value={assets.sheepGoats}
                    onChange={(v) => updateAsset("sheepGoats", v)}
                    prefix=""
                    suffix="head"
                    hint="Minimum: 40 head for Zakat to be due"
                  />
                  <CurrencyInput
                    label="Cattle"
                    value={assets.cattle}
                    onChange={(v) => updateAsset("cattle", v)}
                    prefix=""
                    suffix="head"
                    hint="Minimum: 30 head for Zakat to be due"
                  />
                  <CurrencyInput
                    label="Camels"
                    value={assets.camels}
                    onChange={(v) => updateAsset("camels", v)}
                    prefix=""
                    suffix="head"
                    hint="Minimum: 5 head for Zakat to be due"
                  />
                </div>
              )}

              {/* Step 11: Debts */}
              {step === 11 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-3">
                      Debt Deduction Method
                    </h3>
                    <div className="space-y-2">
                      <OptionCard
                        selected={choices.debtDeduction === "twelve_months_principal"}
                        onClick={() =>
                          updateChoice("debtDeduction", "twelve_months_principal")
                        }
                        title="12 Months of Principal Payments"
                        description="Short-term debts fully deducted. Long-term debts: up to 12 months of principal (interest excluded)."
                        badge="Ḥanafī / Ḥanbalī"
                      />
                      <OptionCard
                        selected={choices.debtDeduction === "single_installment"}
                        onClick={() =>
                          updateChoice("debtDeduction", "single_installment")
                        }
                        title="Single Currently-Due Installment"
                        description="Short-term debts fully deducted. Long-term debts: only one month's principal payment."
                        badge="Stricter Ḥanafī / Ḥanbalī"
                      />
                      <OptionCard
                        selected={choices.debtDeduction === "hidden_wealth_only"}
                        onClick={() =>
                          updateChoice("debtDeduction", "hidden_wealth_only")
                        }
                        title="Deductible Against Hidden Wealth Only"
                        description="Debts reduce cash, gold, silver, and trade goods — but not livestock or crops."
                        badge="Mālikī"
                      />
                      <OptionCard
                        selected={choices.debtDeduction === "no_deduction"}
                        onClick={() =>
                          updateChoice("debtDeduction", "no_deduction")
                        }
                        title="No Debt Deduction"
                        description="Debt does not reduce zakatable wealth. Zakat is a right attached to the wealth itself."
                        badge="Shāfiʿī / Jaʿfarī"
                      />
                    </div>
                    <InfoAccordion info={DEBT_INFO} />
                  </div>

                  {choices.debtDeduction !== "no_deduction" && (
                    <>
                      <div className="gold-line" />

                      {/* Short-term debts */}
                      <div>
                        <h3 className="font-['Amiri',serif] font-bold text-lg mb-1">
                          Short-Term Debts
                        </h3>
                        <p className="text-xs text-[var(--ink-faint)] mb-3">
                          Debts due in full within 12 months. These are fully deductible.
                        </p>
                        <div className="space-y-3">
                          <CurrencyInput
                            label="Credit Card Balance"
                            value={assets.creditCardBalance}
                            onChange={(v) => updateAsset("creditCardBalance", v)}
                            hint="Total balance on all credit cards as of your Zakat date"
                          />
                          <CurrencyInput
                            label="Personal Loans (due within 12 months)"
                            value={assets.personalLoans}
                            onChange={(v) => updateAsset("personalLoans", v)}
                            hint="Loans from family, friends, or lenders that are callable or due within a year"
                          />
                          <CurrencyInput
                            label="Other Short-Term Debts"
                            value={assets.otherShortTermDebt}
                            onChange={(v) => updateAsset("otherShortTermDebt", v)}
                            hint="Bills currently due, taxes owed, overdue payments, etc."
                          />
                        </div>
                      </div>

                      <div className="gold-line" />

                      {/* Long-term debts */}
                      <div>
                        <h3 className="font-['Amiri',serif] font-bold text-lg mb-1">
                          Long-Term Debts
                        </h3>
                        <p className="text-xs text-[var(--ink-faint)] mb-3">
                          Mortgage, student loans, car loans, etc. Only the <strong>principal portion</strong> of
                          your monthly payment is deductible — interest (ribā) is not a legitimate Islamic liability.
                        </p>
                        <div className="space-y-4">
                          {/* Mortgage */}
                          <div className="p-3 rounded-lg bg-[var(--cream)]/30 space-y-3">
                            <p className="text-sm font-medium text-[var(--ink)]">🏠 Mortgage</p>
                            <CurrencyInput
                              label="Monthly Mortgage Payment (total)"
                              value={assets.monthlyMortgagePayment}
                              onChange={(v) => updateAsset("monthlyMortgagePayment", v)}
                              hint="Your full monthly mortgage payment including principal + interest"
                            />
                            <CurrencyInput
                              label="Monthly Principal Portion"
                              value={assets.monthlyMortgagePrincipal}
                              onChange={(v) => updateAsset("monthlyMortgagePrincipal", v)}
                              hint="The principal-only portion (check your mortgage statement or amortization schedule)"
                            />
                          </div>

                          {/* Student Loans */}
                          <div className="p-3 rounded-lg bg-[var(--cream)]/30 space-y-3">
                            <p className="text-sm font-medium text-[var(--ink)]">🎓 Student Loans</p>
                            <CurrencyInput
                              label="Monthly Student Loan Payment (total)"
                              value={assets.monthlyStudentLoanPayment}
                              onChange={(v) => updateAsset("monthlyStudentLoanPayment", v)}
                              hint="Total monthly payment across all student loans"
                            />
                            <CurrencyInput
                              label="Monthly Principal Portion"
                              value={assets.monthlyStudentLoanPrincipal}
                              onChange={(v) => updateAsset("monthlyStudentLoanPrincipal", v)}
                              hint="Principal-only portion (check your loan servicer statement)"
                            />
                          </div>

                          {/* Car Loan */}
                          <div className="p-3 rounded-lg bg-[var(--cream)]/30 space-y-3">
                            <p className="text-sm font-medium text-[var(--ink)]">🚗 Car Loan</p>
                            <CurrencyInput
                              label="Monthly Car Loan Payment (total)"
                              value={assets.monthlyCarLoanPayment}
                              onChange={(v) => updateAsset("monthlyCarLoanPayment", v)}
                            />
                            <CurrencyInput
                              label="Monthly Principal Portion"
                              value={assets.monthlyCarLoanPrincipal}
                              onChange={(v) => updateAsset("monthlyCarLoanPrincipal", v)}
                            />
                          </div>

                          {/* Other Long-term */}
                          <div className="p-3 rounded-lg bg-[var(--cream)]/30 space-y-3">
                            <p className="text-sm font-medium text-[var(--ink)]">📋 Other Long-Term Debt</p>
                            <CurrencyInput
                              label="Monthly Payment (total)"
                              value={assets.monthlyOtherLongTermPayment}
                              onChange={(v) => updateAsset("monthlyOtherLongTermPayment", v)}
                              hint="Any other installment debt (personal line of credit, business loan, etc.)"
                            />
                            <CurrencyInput
                              label="Monthly Principal Portion"
                              value={assets.monthlyOtherLongTermPrincipal}
                              onChange={(v) => updateAsset("monthlyOtherLongTermPrincipal", v)}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 12: Khums (Ja'fari) */}
              {step === 12 && (
                <div className="space-y-5">
                  {choices.madhab === "jafari" ? (
                    <>
                      <p className="text-[var(--ink-light)] leading-relaxed">
                        Khums is a 20% tax on your surplus annual income — the amount remaining
                        after deducting all legitimate living expenses for yourself and your family.
                        This is the primary wealth obligation in Ja&apos;farī fiqh, covering what the
                        Sunni schools address through Zakat on cash, investments, and modern assets.
                      </p>
                      <CurrencyInput
                        label="Total Annual Income"
                        value={assets.annualIncome}
                        onChange={(v) => updateAsset("annualIncome", v)}
                        hint="All sources: salary, business profits, gifts, investments, etc."
                      />
                      <CurrencyInput
                        label="Total Annual Expenses"
                        value={assets.annualExpenses}
                        onChange={(v) => updateAsset("annualExpenses", v)}
                        hint="All legitimate living expenses for yourself and your family"
                      />

                      {assets.annualIncome > assets.annualExpenses && (
                        <div className="bg-[var(--info-bg)] border border-[var(--info-border)] rounded-xl p-4 mt-4">
                          <p className="text-[var(--emerald-deep)] font-medium">
                            Surplus: {fmt((assets.annualIncome - assets.annualExpenses))}
                          </p>
                          <p className="text-[var(--emerald)] font-['Amiri',serif] font-bold text-xl mt-1">
                            Khums Due: {fmt(((assets.annualIncome - assets.annualExpenses) * 0.2))}
                          </p>
                          <div className="flex gap-6 mt-2 text-sm text-[var(--ink-muted)]">
                            <span>Sahm al-Imam: {fmt(((assets.annualIncome - assets.annualExpenses) * 0.1))}</span>
                            <span>Sahm al-Sadat: {fmt(((assets.annualIncome - assets.annualExpenses) * 0.1))}</span>
                          </div>
                        </div>
                      )}

                      <InfoAccordion info={KHUMS_INFO} />
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[var(--ink-muted)] text-lg">
                        Khums as an income tax is specific to the Ja&apos;farī (Twelver Shia) school.
                      </p>
                      <p className="text-[var(--ink-faint)] text-sm mt-2">
                        You may skip this step. In the Sunni schools, Khums applies only to war booty (ghanīma).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 13: Results */}
              {step === 13 && (
                <div className="space-y-6">
                  {/* Nisab Check */}
                  <div
                    className={`rounded-2xl p-6 text-center ${
                      result.meetsNisab
                        ? "bg-[var(--info-bg)] border-2 border-[var(--emerald)]"
                        : "bg-[var(--warning-bg)] border-2 border-[var(--warning-border)]"
                    }`}
                  >
                    {result.meetsNisab ? (
                      <>
                        <p className="text-[var(--emerald)] font-medium text-lg mb-1">
                          Your wealth meets the nisab threshold
                        </p>
                        <p className="text-[var(--ink-muted)] text-sm">
                          Nisab: {fmt(result.nisabThreshold)} (
                          {choices.nisabStandard} standard)
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[var(--gold-dark)] font-medium text-lg mb-1">
                          Your wealth is below the nisab threshold
                        </p>
                        <p className="text-[var(--ink-muted)] text-sm">
                          Zakat is not obligatory. Nisab: {fmt(result.nisabThreshold)} (
                          {choices.nisabStandard} standard)
                        </p>
                      </>
                    )}
                  </div>

                  {/* Total */}
                  <div className="text-center py-6">
                    <p className="text-[var(--ink-muted)] text-sm uppercase tracking-widest mb-2">
                      Your Zakat Due
                    </p>
                    <motion.p
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                      className="heading-display text-5xl sm:text-6xl text-[var(--emerald)]"
                    >
                      {fmt(result.totalZakatDue)}
                    </motion.p>
                    <p className="text-[var(--ink-faint)] text-sm mt-2">
                      Based on {result.methodology} •{" "}
                      {choices.yearType === "lunar" ? "Lunar" : "Solar (+3%)"} year
                    </p>
                  </div>

                  <div className="gold-line" />

                  {/* Breakdown */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-xl mb-4">
                      Detailed Breakdown
                    </h3>
                    <div className="space-y-3">
                      {result.breakdown
                        .filter((b) => b.amount !== 0)
                        .map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="flex items-start justify-between p-4 bg-white/60 rounded-xl border border-[var(--sand)]"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-[var(--ink)]">
                                {item.category}
                              </p>
                              <p className="text-xs text-[var(--ink-faint)] mt-0.5">
                                {item.notes}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-[var(--ink)] font-medium">
                                {item.amount < 0 ? "-" : ""}{fmt(Math.abs(item.amount))}
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  item.zakatDue > 0
                                    ? "text-[var(--emerald)]"
                                    : "text-[var(--ink-faint)]"
                                }`}
                              >
                                {item.zakatDue > 0
                                  ? `→ ${fmt(item.zakatDue)}`
                                  : item.rate === 0
                                  ? "Exempt"
                                  : "$0.00"}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[var(--parchment)] rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[var(--ink-light)]">Total Zakatable Wealth</span>
                      <span className="font-semibold">
                        {fmt(result.totalZakatableWealth)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[var(--ink-light)]">Nisab Threshold</span>
                      <span className="font-semibold">
                        {fmt(result.nisabThreshold)}
                      </span>
                    </div>
                    <div className="gold-line my-3" />
                    <div className="flex justify-between items-center">
                      <span className="font-['Amiri',serif] font-bold text-lg text-[var(--emerald-deep)]">
                        Total Zakat Due
                      </span>
                      <span className="font-['Amiri',serif] font-bold text-xl text-[var(--emerald)]">
                        {fmt(result.totalZakatDue)}
                      </span>
                    </div>
                  </div>

                  {/* Khums Summary (Ja'fari) */}
                  {result.khums && result.khums.khumsDue > 0 && (
                    <>
                      <div className="gold-line" />
                      <div>
                        <h3 className="font-['Amiri',serif] font-bold text-xl mb-4">
                          Khums Obligation
                        </h3>
                        <div className="bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-2xl p-5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[var(--ink-light)]">Annual Income</span>
                            <span className="font-semibold">{fmt(result.khums.annualIncome)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[var(--ink-light)]">Annual Expenses</span>
                            <span className="font-semibold">-{fmt(result.khums.annualExpenses)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[var(--ink-light)]">Surplus</span>
                            <span className="font-semibold">{fmt(result.khums.surplus)}</span>
                          </div>
                          <div className="gold-line my-3" />
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-['Amiri',serif] font-bold text-lg text-[var(--gold-dark)]">Khums Due (20%)</span>
                            <span className="font-['Amiri',serif] font-bold text-xl text-[var(--gold-dark)]">{fmt(result.khums.khumsDue)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-[var(--ink-muted)] mt-1">
                            <span>Sahm al-Imam</span>
                            <span>{fmt(result.khums.sahmImam)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-[var(--ink-muted)]">
                            <span>Sahm al-Sadat</span>
                            <span>{fmt(result.khums.sahmSadat)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Combined total */}
                      <div className="bg-[var(--emerald-deep)] text-white rounded-2xl p-5 text-center">
                        <p className="text-sm uppercase tracking-widest opacity-80 mb-1">Combined Obligation</p>
                        <p className="font-['Amiri',serif] font-bold text-3xl">
                          {fmt((result.totalZakatDue + result.khums.khumsDue))}
                        </p>
                        <p className="text-sm opacity-70 mt-1">Zakat + Khums</p>
                      </div>
                    </>
                  )}

                  {/* Disclaimer */}
                  <div className="text-center text-xs text-[var(--ink-faint)] leading-relaxed px-4">
                    <p>
                      This calculator is a tool to assist you in estimating your Zakat obligation.
                      It is not a substitute for consulting a qualified Islamic scholar. For complex
                      situations, please seek personal guidance from a scholar familiar with your
                      circumstances.
                    </p>
                    <p className="mt-2 font-['Noto_Naskh_Arabic',serif] text-base text-[var(--gold-dark)]">
                      وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ
                    </p>
                    <p className="mt-1 italic">
                      &ldquo;And establish prayer and give Zakat&rdquo; — Al-Baqarah 2:43
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-base transition-all cursor-pointer ${
              canGoBack
                ? "text-[var(--ink-light)] hover:text-[var(--ink)] hover:bg-[var(--parchment)]"
                : "text-[var(--sand-dark)] cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Running total */}
          {step >= 2 && step < 13 && (
            <div className="text-center">
              <p className="text-xs text-[var(--ink-faint)]">Running Total</p>
              <p className="font-['Amiri',serif] font-bold text-lg text-[var(--emerald)]">
                {fmt(result.totalZakatDue)}
              </p>
            </div>
          )}

          {canGoNext ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--emerald)] text-white rounded-xl font-medium text-base hover:bg-[var(--emerald-deep)] transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {step === 12 ? "See Results" : "Continue"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => goTo(0)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--emerald)] text-white rounded-xl font-medium text-base hover:bg-[var(--emerald-deep)] transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Start Over
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pb-8">
          <div className="gold-line max-w-32 mx-auto mb-4" />
          <p className="text-xs text-[var(--ink-faint)]">
            Built with care and respect for Islamic scholarship
          </p>
        </footer>
      </div>
    </div>
  );
}
