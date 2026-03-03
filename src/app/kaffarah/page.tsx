"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Madhab, KaffarahType, KAFFARAH_TYPES } from "@/lib/kaffarah/types";
import { getKaffarahRuling, estimateFeedingCost } from "@/lib/kaffarah/rulings";
import {
  KAFFARAH_OVERVIEW_INFO,
  KAFFARAH_FAST_INFO,
  KAFFARAH_OATH_INFO,
} from "@/lib/kaffarah/scholarly-info";
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

type Step = "intro" | "type" | "school" | "cost" | "result";
const STEPS: Step[] = ["intro", "type", "school", "cost", "result"];

export default function KaffarahCalculator() {
  const [step, setStep] = useState(0);
  const [kaffarahType, setKaffarahType] = useState<KaffarahType>("broken_fast");
  const [madhab, setMadhab] = useState<Madhab>("hanafi");
  const [costPerMeal, setCostPerMeal] = useState(10);
  const [instances, setInstances] = useState(1);

  const currentStep = STEPS[step];

  const ruling = useMemo(
    () => getKaffarahRuling(kaffarahType, madhab),
    [kaffarahType, madhab]
  );

  const feedingEstimate = useMemo(
    () => estimateFeedingCost(kaffarahType, madhab, costPerMeal),
    [kaffarahType, madhab, costPerMeal]
  );

  const contextualInfo = kaffarahType === "broken_fast"
    ? KAFFARAH_FAST_INFO
    : kaffarahType === "broken_oath"
    ? KAFFARAH_OATH_INFO
    : null;

  return (
    <div className="min-h-screen relative">
      <div className="arabesque-bg" />
      <div className="luminous-header absolute inset-x-0 top-0 h-64" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-['Noto_Naskh_Arabic',serif] text-2xl text-[var(--gold-dark)] mb-2">
            كَفَّارَة
          </p>
          <h1 className="heading-display text-4xl text-[var(--ink)] mb-2">
            Kaffārah Calculator
          </h1>
          <p className="text-base text-[var(--ink-light)]">
            Expiation for Broken Obligations
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
                    What is Kaffārah?
                  </h2>
                  <div className="space-y-4 text-base text-[var(--ink-light)] leading-relaxed">
                    <p>
                      <strong>Kaffārah</strong> (كَفَّارَة — &quot;expiation&quot; or &quot;atonement&quot;) is
                      a prescribed penalty in Islamic law for specific violations of religious
                      obligations. It serves as both spiritual purification and charity.
                    </p>
                    <p>
                      Unlike <strong>fidya</strong> (which compensates for inability to fast),
                      kaffārah is required when you <strong>deliberately</strong> violate an
                      obligation — such as intentionally breaking a Ramadan fast or breaking a
                      sworn oath.
                    </p>
                    <p>
                      The type and severity of kaffārah depends on what was violated, and the
                      specific requirements differ between schools of thought.
                    </p>
                  </div>
                  <InfoAccordion info={KAFFARAH_OVERVIEW_INFO} />
                </div>
              )}

              {/* Type Selection */}
              {currentStep === "type" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    What Happened?
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    Select the type of violation that requires kaffārah.
                  </p>
                  <div className="space-y-2">
                    {KAFFARAH_TYPES.map((kt) => (
                      <OptionCard
                        key={kt.id}
                        selected={kaffarahType === kt.id}
                        onClick={() => setKaffarahType(kt.id)}
                        title={`${kt.icon} ${kt.title}`}
                        description={kt.description}
                        badge={kt.titleAr}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* School */}
              {currentStep === "school" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    Select Your School of Thought
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    Requirements for kaffārah vary significantly between schools —
                    especially for broken fasts.
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
                        description=""
                        badge={opt.labelAr}
                      />
                    ))}
                  </div>
                  {contextualInfo && <InfoAccordion info={contextualInfo} />}
                </div>
              )}

              {/* Cost Estimation */}
              {currentStep === "cost" && (
                <div className="space-y-5">
                  <h2 className="heading-display text-2xl text-[var(--ink)]">
                    Cost Estimation
                  </h2>
                  <p className="text-base text-[var(--ink-light)]">
                    If the feeding option applies, we can estimate the monetary cost.
                  </p>
                  <CurrencyInput
                    label="Cost of One Meal in Your Area"
                    value={costPerMeal}
                    onChange={setCostPerMeal}
                    hint="Average cost to feed one poor person one meal"
                  />
                  <CurrencyInput
                    label="Number of Instances"
                    value={instances}
                    onChange={setInstances}
                    prefix=""
                    suffix={kaffarahType === "broken_fast" ? "days" : "times"}
                    hint={
                      kaffarahType === "broken_fast"
                        ? "How many days did you deliberately break your fast? Each day requires a separate kaffārah."
                        : kaffarahType === "broken_oath"
                        ? "How many separate oaths did you break?"
                        : "Number of instances"
                    }
                  />
                </div>
              )}

              {/* Result */}
              {currentStep === "result" && (
                <div className="space-y-6">
                  <h2 className="heading-display text-2xl text-[var(--ink)] text-center">
                    Your Kaffārah Obligation
                  </h2>

                  {/* Shafi'i / Hanbali eating/drinking notice */}
                  {kaffarahType === "broken_fast" && (madhab === "shafii" || madhab === "hanbali") && (
                    <div className="info-panel border-l-4 border-[var(--gold)]">
                      <p className="text-sm font-bold text-[var(--gold-dark)] mb-1">
                        ⚠️ Important: Did you break your fast by eating or drinking?
                      </p>
                      <p className="text-sm text-[var(--info-text)]">
                        In the {madhab === "shafii" ? "Shāfiʿī" : "Ḥanbalī"} school, kaffārah is only
                        required for breaking a fast by <strong>sexual intercourse</strong>. If you
                        deliberately ate or drank, you owe only <strong>qaḍāʾ</strong> (making up
                        the day) and sincere repentance — <strong>not</strong> kaffārah. The amounts
                        below only apply if the fast was broken by sexual intercourse.
                      </p>
                    </div>
                  )}

                  {/* Feeding cost estimate */}
                  <div className="text-center py-4">
                    <p className="text-sm text-[var(--ink-faint)] mb-1">
                      Estimated Cost (feeding option{instances > 1 ? ` × ${instances}` : ""})
                    </p>
                    <p className="heading-display text-4xl text-[var(--emerald)]">
                      ${(feedingEstimate.totalCost * instances).toFixed(2)}
                    </p>
                    <p className="text-sm text-[var(--ink-muted)] mt-1">
                      {feedingEstimate.people} people × ${costPerMeal}/meal
                      {instances > 1 ? ` × ${instances} instances` : ""}
                    </p>
                  </div>

                  <div className="gold-line" />

                  {/* Type & School */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Violation</span>
                      <span className="font-semibold">
                        {KAFFARAH_TYPES.find((t) => t.id === kaffarahType)?.title}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">School</span>
                      <span className="font-semibold">
                        {madhabOptions.find((m) => m.value === madhab)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-[var(--ink-light)]">Options</span>
                      <span className="font-semibold text-sm">
                        {ruling.isSequential
                          ? "Sequential (try in order)"
                          : "Choose any option"}
                      </span>
                    </div>
                  </div>

                  <div className="gold-line" />

                  {/* Options */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-3">
                      {ruling.isSequential
                        ? "Options (must be attempted in this order)"
                        : "Options (you may choose any)"}
                    </h3>
                    <div className="space-y-3">
                      {ruling.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border ${
                            opt.action.includes("slave")
                              ? "bg-[var(--parchment)]/50 border-[var(--sand)] opacity-60"
                              : "bg-white border-[var(--sand)]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)] flex items-center justify-center text-sm font-bold">
                              {opt.order}
                            </span>
                            <div>
                              <p className="font-semibold text-base text-[var(--ink)]">
                                {opt.action}
                                {opt.isFallback && (
                                  <span className="text-xs font-normal text-[var(--ink-faint)] ml-2">
                                    (if previous option is impossible)
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-[var(--ink-light)] mt-1 leading-relaxed">
                                {opt.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="gold-line" />

                  {/* Notes */}
                  <div>
                    <h3 className="font-['Amiri',serif] font-bold text-lg mb-3">
                      Important Notes
                    </h3>
                    <div className="space-y-2">
                      {ruling.notes.map((note, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[var(--gold)] mt-0.5">•</span>
                          <p className="text-sm text-[var(--ink-light)] leading-relaxed">
                            {note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="info-panel mt-4">
                    <p className="text-sm text-[var(--info-text)] leading-relaxed">
                      <strong>Remember:</strong> Kaffārah is not just a financial transaction — it
                      requires sincere repentance (<strong>tawbah</strong>) and a genuine intention not to
                      repeat the violation. The financial or physical penalty is the outward component;
                      the spiritual component is equally important.
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
              className="px-6 py-3 rounded-xl font-semibold text-base transition-all bg-[var(--emerald)] text-white hover:bg-[var(--emerald-deep)] shadow-md"
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
