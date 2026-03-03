"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Madhab, FIDYA_WEIGHTS } from "@/lib/fidya/types";
import {
  FIDYA_OVERVIEW_INFO,
  FIDYA_AMOUNT_INFO,
  FIDYA_ELIGIBILITY_INFO,
} from "@/lib/fidya/scholarly-info";
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

type Step = "intro" | "school" | "days" | "amount" | "result";
const STEPS: Step[] = ["intro", "school", "days", "amount", "result"];

export default function FidyaCalculator() {
  const [step, setStep] = useState(0);
  const [madhab, setMadhab] = useState<Madhab>("hanafi");
  const [missedDays, setMissedDays] = useState(0);
  const [costPerMeal, setCostPerMeal] = useState(10);
  const [useWeight, setUseWeight] = useState(false);
  const [pricePerKg, setPricePerKg] = useState(2);

  const currentStep = STEPS[step];

  const result = useMemo(() => {
    if (missedDays <= 0) return null;
    const weight = FIDYA_WEIGHTS[madhab];
    let perDay: number;
    let unitDescription: string;

    if (useWeight) {
      perDay = weight.weightKg * pricePerKg;
      unitDescription = `${weight.weightKg} kg × $${pricePerKg}/kg`;
    } else {
      perDay = costPerMeal;
      unitDescription = `$${costPerMeal} per meal (local cost)`;
    }

    return {
      perDay,
      total: perDay * missedDays,
      missedDays,
      unitDescription,
      weightInfo: weight,
    };
  }, [madhab, missedDays, costPerMeal, useWeight, pricePerKg]);

  const canProceed = () => {
    if (currentStep === "days") return missedDays > 0;
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
            فِدْيَة
          </p>
          <h1 className="heading-display text-4xl text-[var(--ink)] mb-2">
            Fidya Calculator
          </h1>
          <p className="text-base text-[var(--ink-light)]">
            Compensation for Missed Fasts
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
              {/* Step: Intro */}
              {currentStep === "intro" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    What is Fidya?
                  </h2>
                  <div className="space-y-4 text-base text-[var(--ink-light)] leading-relaxed">
                    <p>
                      <strong>Fidya</strong> (فِدْيَة — &quot;ransom&quot; or &quot;compensation&quot;) is a
                      payment made to feed a poor person for each day of Ramadan fasting that
                      you are <strong>permanently unable</strong> to make up.
                    </p>
                    <p>
                      It applies to people who <strong>cannot fast at all</strong> — due to
                      old age, chronic illness, terminal illness, or other permanent conditions
                      — and have no reasonable expectation of being able to fast in the future.
                    </p>
                    <div className="info-panel">
                      <p className="text-sm font-semibold text-[var(--info-text)] mb-1">
                        ⚠️ Fidya is NOT for:
                      </p>
                      <ul className="text-sm text-[var(--info-text)] list-disc list-inside space-y-1">
                        <li>Deliberately breaking a fast — that requires <strong>Kaffārah</strong> (expiation)</li>
                        <li>Temporary illness — you should make up (<strong>qaḍāʾ</strong>) the fasts later</li>
                        <li>Travel — make up the fasts when you return</li>
                      </ul>
                    </div>
                  </div>
                  <InfoAccordion info={FIDYA_OVERVIEW_INFO} />
                  <InfoAccordion info={FIDYA_ELIGIBILITY_INFO} />
                </div>
              )}

              {/* Step: School */}
              {currentStep === "school" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    Select Your School of Thought
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    The amount of food (and therefore cost) varies between schools.
                  </p>
                  <div className="space-y-2">
                    {madhabOptions.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        selected={madhab === opt.value}
                        onClick={() => setMadhab(opt.value)}
                        title={opt.label}
                        description={FIDYA_WEIGHTS[opt.value].description}
                        badge={opt.labelAr}
                      />
                    ))}
                  </div>
                  <InfoAccordion info={FIDYA_AMOUNT_INFO} />
                </div>
              )}

              {/* Step: Days */}
              {currentStep === "days" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    How Many Days?
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    Enter the total number of fasting days you need to compensate for.
                    A full Ramadan is typically 29 or 30 days.
                  </p>
                  <CurrencyInput
                    label="Missed Fasting Days"
                    value={missedDays}
                    onChange={setMissedDays}
                    prefix=""
                    placeholder="30"
                    suffix="days"
                    hint="Include missed days from previous years if you haven't compensated for them yet"
                  />
                  <div className="flex gap-2">
                    {[1, 10, 29, 30, 60].map((n) => (
                      <button
                        key={n}
                        onClick={() => setMissedDays(n)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          missedDays === n
                            ? "bg-[var(--emerald)] text-white"
                            : "bg-[var(--sand)]/50 text-[var(--ink-muted)] hover:bg-[var(--sand)]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Amount */}
              {currentStep === "amount" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    Calculation Method
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    Choose how you&apos;d like to calculate the fidya amount.
                  </p>
                  <div className="space-y-2">
                    <OptionCard
                      selected={!useWeight}
                      onClick={() => setUseWeight(false)}
                      title="By Local Meal Cost"
                      description="Use the cost of one average meal in your area. Most practical for cash payments."
                    />
                    <OptionCard
                      selected={useWeight}
                      onClick={() => setUseWeight(true)}
                      title="By Food Weight"
                      description={`Classical method: ${FIDYA_WEIGHTS[madhab].measure}`}
                    />
                  </div>

                  <div className="gold-line" />

                  {!useWeight ? (
                    <CurrencyInput
                      label="Cost of One Meal in Your Area"
                      value={costPerMeal}
                      onChange={setCostPerMeal}
                      hint="The average cost to feed one poor person one meal (e.g., $10–15 in North America, $3–5 in South Asia)"
                    />
                  ) : (
                    <CurrencyInput
                      label="Price Per Kilogram of Staple Food"
                      value={pricePerKg}
                      onChange={setPricePerKg}
                      hint={`You need ${FIDYA_WEIGHTS[madhab].weightKg} kg per day (${FIDYA_WEIGHTS[madhab].measure})`}
                    />
                  )}
                </div>
              )}

              {/* Step: Result */}
              {currentStep === "result" && result && (
                <div className="space-y-6">
                  <h2 className="heading-display text-2xl text-[var(--ink)] text-center">
                    Your Fidya Obligation
                  </h2>

                  <div className="text-center py-6">
                    <p className="text-sm text-[var(--ink-faint)] mb-1">Total Fidya Due</p>
                    <p className="heading-display text-5xl text-[var(--emerald)]">
                      ${result.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-[var(--ink-muted)] mt-2">
                      ${result.perDay.toFixed(2)} per day × {result.missedDays} days
                    </p>
                  </div>

                  <div className="gold-line" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">School of Thought</span>
                      <span className="font-semibold">{madhabOptions.find(m => m.value === madhab)?.label}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Missed Days</span>
                      <span className="font-semibold">{result.missedDays}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Per Day</span>
                      <span className="font-semibold">${result.perDay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Classical Measure</span>
                      <span className="font-semibold text-right text-sm max-w-[60%]">
                        {result.weightInfo.measure}
                      </span>
                    </div>
                  </div>

                  <div className="gold-line" />

                  <div className="info-panel">
                    <p className="text-sm text-[var(--info-text)] leading-relaxed">
                      <strong>How to pay:</strong> Fidya can be given as actual food or as cash
                      to a poor person or an Islamic charity. Many organizations accept fidya
                      payments and distribute food on your behalf. The payment should be made
                      for each day individually — meaning you are feeding one poor person per
                      missed day (it can be different people or the same person on different days).
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
