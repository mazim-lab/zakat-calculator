"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Madhab, FITR_AMOUNTS } from "@/lib/zakat-fitr/types";
import {
  FITR_OVERVIEW_INFO,
  FITR_AMOUNT_INFO,
  FITR_TIMING_INFO,
  FITR_WHO_INFO,
} from "@/lib/zakat-fitr/scholarly-info";
import { InfoAccordion } from "@/components/InfoAccordion";
import { CurrencyInput } from "@/components/CurrencyInput";
import { OptionCard } from "@/components/OptionCard";

const madhabOptions: { value: Madhab; label: string; labelAr: string }[] = [
  { value: "hanafi", label: "Ḥanafī", labelAr: "حنفي" },
  { value: "maliki", label: "Mālikī", labelAr: "مالكي" },
  { value: "shafii", label: "Shāfiʿī", labelAr: "شافعي" },
  { value: "hanbali", label: "Ḥanbalī", labelAr: "حنبلي" },
  { value: "jafari", label: "Jaʿfarī", labelAr: "جعفري" },
];

type Step = "intro" | "school" | "household" | "cost" | "result";
const STEPS: Step[] = ["intro", "school", "household", "cost", "result"];

export default function ZakatFitrCalculator() {
  const [step, setStep] = useState(0);
  const [madhab, setMadhab] = useState<Madhab>("hanafi");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [otherDependents, setOtherDependents] = useState(0);
  const [useWeight, setUseWeight] = useState(false);
  const [pricePerKg, setPricePerKg] = useState(2);
  const [costPerPerson, setCostPerPerson] = useState(12);

  const currentStep = STEPS[step];
  const totalPeople = adults + children + otherDependents;
  const fitrInfo = FITR_AMOUNTS[madhab];

  const result = useMemo(() => {
    if (totalPeople <= 0) return null;
    let perPerson: number;
    let method: string;

    if (useWeight) {
      perPerson = fitrInfo.weightKg * pricePerKg;
      method = `${fitrInfo.weightKg} kg × $${pricePerKg}/kg = $${perPerson.toFixed(2)}/person`;
    } else {
      perPerson = costPerPerson;
      method = `$${costPerPerson.toFixed(2)} per person (local equivalent)`;
    }

    return {
      perPerson,
      total: perPerson * totalPeople,
      totalPeople,
      method,
    };
  }, [madhab, totalPeople, useWeight, pricePerKg, costPerPerson, fitrInfo]);

  const canProceed = () => {
    if (currentStep === "household") return totalPeople > 0;
    return true;
  };

  return (
    <div className="min-h-screen relative">
      <div className="arabesque-bg" />
      <div className="luminous-header absolute inset-x-0 top-0 h-64" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-['Noto_Naskh_Arabic',serif] text-2xl text-[var(--gold-dark)] mb-2">
            زكاة الفطر
          </p>
          <h1 className="heading-display text-4xl text-[var(--ink)] mb-2">
            Zakat al-Fiṭr Calculator
          </h1>
          <p className="text-base text-[var(--ink-light)]">
            Per-Person Payment Before Eid al-Fiṭr
          </p>
        </div>

        {/* Distinction banner */}
        <div className="info-panel mb-6">
          <p className="text-sm text-[var(--info-text)] leading-relaxed">
            <strong>⚠️ This is NOT your annual Zakat.</strong> Zakat al-Fiṭr (Fiṭrānah) is a
            separate, per-person payment due before the Eid al-Fiṭr prayer at the end of Ramadan.
            Your annual wealth-based Zakat (Zakat al-Māl) is calculated in the{" "}
            <a href="/zakat" className="underline font-semibold">
              Zakat Calculator
            </a>.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[var(--ink-faint)] mt-2 text-center">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Steps */}
        <div className="card p-6 md:p-8 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Intro */}
              {currentStep === "intro" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    What is Zakat al-Fiṭr?
                  </h2>
                  <div className="space-y-4 text-base text-[var(--ink-light)] leading-relaxed">
                    <p>
                      <strong>Zakat al-Fiṭr</strong> (زكاة الفطر — also called{" "}
                      <strong>Fiṭrānah</strong> or <strong>Ṣadaqat al-Fiṭr</strong>) is a
                      mandatory charitable payment made at the end of Ramadan, before the
                      Eid al-Fiṭr prayer.
                    </p>
                    <p>
                      It has two purposes: <strong>(1)</strong> to purify the fasting person from
                      any shortcomings during Ramadan (idle talk, minor sins), and{" "}
                      <strong>(2)</strong> to ensure that poor people can also celebrate Eid
                      with dignity and joy.
                    </p>
                    <p>
                      Unlike annual Zakat (which is based on your total wealth), Zakat al-Fiṭr
                      is a <strong>flat per-person amount</strong> — you pay it for yourself and
                      every person you are financially responsible for (spouse, children, dependents).
                    </p>
                  </div>
                  <InfoAccordion info={FITR_OVERVIEW_INFO} />
                  <InfoAccordion info={FITR_TIMING_INFO} />
                  <InfoAccordion info={FITR_WHO_INFO} />
                </div>
              )}

              {/* School */}
              {currentStep === "school" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    Select Your School of Jurisprudence
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    Schools differ on the amount of food required and whether cash payment is
                    acceptable.
                    <a href="/find-your-school" className="block mt-3 text-sm font-semibold text-[var(--gold-dark)] hover:text-[var(--emerald)] bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-xl px-4 py-2.5 transition-all hover:shadow-sm no-underline">
                      🧭 Not sure which school you follow? Take our short quiz →
                    </a>
                  </p>
                  <div className="space-y-2">
                    {madhabOptions.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        selected={madhab === opt.value}
                        onClick={() => setMadhab(opt.value)}
                        title={opt.label}
                        description={FITR_AMOUNTS[opt.value].description}
                        badge={opt.labelAr}
                      />
                    ))}
                  </div>
                  <InfoAccordion info={FITR_AMOUNT_INFO} />
                </div>
              )}

              {/* Household */}
              {currentStep === "household" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    Your Household
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    You pay Zakat al-Fiṭr for yourself and every person you are financially
                    responsible for — including infants.
                    {madhab === "jafari" && (
                      <span className="block mt-2 font-semibold text-[var(--emerald)]">
                        Jaʿfarī note: This includes any guests in your home at sunset on the
                        eve of Eid.
                      </span>
                    )}
                  </p>
                  <div className="space-y-3">
                    <CurrencyInput
                      label="Adults (including yourself)"
                      value={adults}
                      onChange={(v) => setAdults(Math.max(0, Math.round(v)))}
                      prefix=""
                      suffix="people"
                      hint="You, your spouse, adult dependents"
                    />
                    <CurrencyInput
                      label="Children"
                      value={children}
                      onChange={(v) => setChildren(Math.max(0, Math.round(v)))}
                      prefix=""
                      suffix="children"
                      hint="Minor children you are financially responsible for (including infants)"
                    />
                    <CurrencyInput
                      label={madhab === "jafari" ? "Other Dependents & Guests" : "Other Dependents"}
                      value={otherDependents}
                      onChange={(v) => setOtherDependents(Math.max(0, Math.round(v)))}
                      prefix=""
                      suffix="people"
                      hint={
                        madhab === "jafari"
                          ? "Elderly parents, household staff, guests present at sunset on the eve of Eid"
                          : "Elderly parents, household staff, or anyone else you financially support"
                      }
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--parchment)] text-center">
                    <p className="text-sm text-[var(--ink-muted)]">Total people</p>
                    <p className="heading-display text-3xl text-[var(--ink)]">{totalPeople}</p>
                  </div>
                </div>
              )}

              {/* Cost */}
              {currentStep === "cost" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    Amount Per Person
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    Choose how you&apos;d like to calculate the per-person amount.
                    {!fitrInfo.cashPermitted && (
                      <span className="block mt-2 text-sm text-[var(--gold-dark)]">
                        ⚠️ The {madhabOptions.find((m) => m.value === madhab)?.label} school
                        classically requires giving actual food, not cash.
                        {fitrInfo.modernCashNote && (
                          <span className="block mt-1 text-[var(--ink-faint)]">
                            {fitrInfo.modernCashNote}
                          </span>
                        )}
                      </span>
                    )}
                  </p>
                  <div className="space-y-2">
                    <OptionCard
                      selected={!useWeight}
                      onClick={() => setUseWeight(false)}
                      title="By Local Equivalent"
                      description="Use a flat dollar amount per person. Most Islamic organizations publish recommended amounts ($10–15 in North America)."
                    />
                    <OptionCard
                      selected={useWeight}
                      onClick={() => setUseWeight(true)}
                      title="By Food Weight"
                      description={`Classical method: ${fitrInfo.measure}`}
                    />
                  </div>

                  <div className="gold-line" />

                  {!useWeight ? (
                    <CurrencyInput
                      label="Amount Per Person"
                      value={costPerPerson}
                      onChange={setCostPerPerson}
                      hint="Check your local mosque or Islamic organization for this year's recommended amount. Typically $10–15 in North America, $3–5 in South Asia."
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-[var(--parchment)]">
                        <p className="text-sm text-[var(--ink-muted)]">Required per person:</p>
                        <p className="font-semibold text-[var(--ink)]">
                          {fitrInfo.weightKg} kg of staple food
                        </p>
                        <p className="text-xs text-[var(--ink-faint)] mt-1">
                          {fitrInfo.measure}
                        </p>
                      </div>
                      <CurrencyInput
                        label="Price Per Kilogram of Staple Food"
                        value={pricePerKg}
                        onChange={setPricePerKg}
                        hint="Price of rice, wheat, or your local staple per kilogram"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Result */}
              {currentStep === "result" && result && (
                <div className="space-y-6">
                  <h2 className="heading-display text-2xl text-[var(--ink)] text-center">
                    Your Zakat al-Fiṭr
                  </h2>

                  <div className="text-center py-6">
                    <p className="text-sm text-[var(--ink-faint)] mb-1">Total Due</p>
                    <p className="heading-display text-5xl text-[var(--emerald)]">
                      ${result.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-[var(--ink-muted)] mt-2">
                      ${result.perPerson.toFixed(2)} × {result.totalPeople} {result.totalPeople === 1 ? "person" : "people"}
                    </p>
                  </div>

                  <div className="gold-line" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">School of Jurisprudence</span>
                      <span className="font-semibold">
                        {madhabOptions.find((m) => m.value === madhab)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">People in Household</span>
                      <span className="font-semibold">{result.totalPeople}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Per Person</span>
                      <span className="font-semibold">${result.perPerson.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Calculation</span>
                      <span className="font-semibold text-right text-sm max-w-[60%]">
                        {result.method}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Cash Permitted?</span>
                      <span className="font-semibold">
                        {fitrInfo.cashPermitted ? (
                          <span className="text-[var(--emerald)]">Yes ✓</span>
                        ) : (
                          <span className="text-[var(--gold-dark)]">
                            Classically no — but widely accepted via charities
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Classical Measure</span>
                      <span className="font-semibold text-right text-sm max-w-[60%]">
                        {fitrInfo.measure}
                      </span>
                    </div>
                  </div>

                  <div className="gold-line" />

                  <div className="info-panel">
                    <p className="text-sm text-[var(--info-text)] leading-relaxed">
                      <strong>When to pay:</strong> Before the Eid al-Fiṭr prayer. Most scholars
                      recommend paying a few days early so recipients can use it for Eid
                      preparations. Paying after the Eid prayer is considered a regular charity
                      (ṣadaqah), not Zakat al-Fiṭr.
                    </p>
                  </div>

                  <div className="info-panel">
                    <p className="text-sm text-[var(--info-text)] leading-relaxed">
                      <strong>How to pay:</strong> Give directly to a poor person, or through
                      your local mosque or an Islamic charity that distributes food/funds before
                      Eid. Many organizations accept Zakat al-Fiṭr online and distribute it in
                      communities where it is most needed.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`px-6 py-3 rounded-xl font-semibold text-base transition-all ${
              step === 0
                ? "opacity-0 pointer-events-none"
                : "bg-[var(--sand)]/50 text-[var(--ink-muted)] hover:bg-[var(--sand)]"
            }`}
          >
            ← Back
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-xl font-semibold text-base transition-all ${
                canProceed()
                  ? "bg-[var(--emerald)] text-white hover:bg-[var(--emerald-deep)] shadow-md"
                  : "bg-[var(--sand)] text-[var(--ink-faint)] cursor-not-allowed"
              }`}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
