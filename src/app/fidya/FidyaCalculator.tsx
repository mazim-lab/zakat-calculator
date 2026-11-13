"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { Madhab, FIDYA_WEIGHTS } from "@/lib/fidya/types";
import {
  FIDYA_OVERVIEW_INFO,
  FIDYA_AMOUNT_INFO,
  FIDYA_ELIGIBILITY_INFO,
} from "@/lib/fidya/scholarly-info";
import { calculateFidya, type FidyaFoodType } from "@/lib/fidya/calculate";
import { InfoAccordion } from "@/components/InfoAccordion";
import { CurrencyInput } from "@/components/CurrencyInput";
import { OptionCard } from "@/components/OptionCard";
import { Niche, Stepper } from "@/components/ornament";
import { money, count } from "@/components/format";

const madhabOptions: { value: Madhab; label: string; labelAr: string }[] = [
  { value: "hanafi", label: "Ḥanafī", labelAr: "حنفي" },
  { value: "maliki", label: "Mālikī", labelAr: "مالكي" },
  { value: "shafii", label: "Shāfiʿī", labelAr: "شافعي" },
  { value: "hanbali", label: "Ḥanbalī", labelAr: "حنبلي" },
  { value: "jafari", label: "Jaʿfarī", labelAr: "جعفري" },
];

type Step = "intro" | "school" | "days" | "amount" | "result";
const STEPS: Step[] = ["intro", "school", "days", "amount", "result"];
const STEP_LABELS: Record<Step, string> = {
  intro: "Introduction",
  school: "School",
  days: "Missed days",
  amount: "Calculation method",
  result: "Result",
};

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={back ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180"}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Row({ label, children, small = false }: { label: string; children: React.ReactNode; small?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-t border-border first:border-t-0">
      <dt className="text-text-2 text-[17px]">{label}</dt>
      <dd className={`m-0 font-bold text-text text-end ${small ? "text-[16px] max-w-[60%]" : "text-[17.5px]"}`}>{children}</dd>
    </div>
  );
}

export function FidyaCalculator() {
  const [step, setStep] = useState(0);
  const [madhab, setMadhab] = useState<Madhab>("hanafi");
  const [missedDays, setMissedDays] = useState(0);
  const [costPerMeal, setCostPerMeal] = useState(10);
  const [useWeight, setUseWeight] = useState(false);
  const [pricePerKg, setPricePerKg] = useState(2);
  const [foodType, setFoodType] = useState<FidyaFoodType>("wheat");

  const currentStep = STEPS[step];

  const result = useMemo(
    () => calculateFidya({ madhab, missedDays, costPerMeal, useWeight, pricePerKg, foodType }),
    [madhab, missedDays, costPerMeal, useWeight, pricePerKg, foodType],
  );

  const canProceed = () => {
    if (currentStep === "days") return missedDays > 0;
    return true;
  };

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const headingClass = "text-[28px] sm:text-[34px] font-bold leading-tight text-text outline-none";

  return (
    <div className="hue-green">
      {/* Progress */}
      <div className="mb-6">
        <Stepper labels={STEPS.map((s) => STEP_LABELS[s])} current={step} />
      </div>

      {/* Steps */}
      <div className="card p-5 sm:p-9 mb-6">
        <div key={currentStep} className="fade-in">
          {/* Step: Intro */}
          {currentStep === "intro" && (
            <div className="space-y-5">
              <h2 ref={headingRef} tabIndex={-1} className={headingClass}>
                What is fidya?
              </h2>
              <div className="space-y-4 text-[18.5px] text-text-2 leading-relaxed">
                <p>
                  <strong className="text-text">Fidya</strong> (<span lang="ar" dir="rtl" className="ar">فِدْيَة</span>,
                  &ldquo;ransom&rdquo; or &ldquo;compensation&rdquo;) is a payment made to feed a poor person for each day of
                  Ramadan fasting that you are <strong className="text-text">permanently unable</strong> to make up.
                </p>
                <p>
                  It applies to people who <strong className="text-text">cannot fast at all</strong> because of old age,
                  chronic illness, terminal illness or another permanent condition, and who have no reasonable
                  expectation of being able to fast in the future.
                </p>
                <div className="callout callout-warning">
                  <p className="font-bold text-text m-0 mb-1">Fidya is not for:</p>
                  <ul className="text-text-2 star-list m-0 space-y-1.5">
                    <li>
                      Deliberately breaking a fast. That requires <strong className="text-text">kaffārah</strong>{" "}
                      (expiation).
                    </li>
                    <li>
                      Temporary illness. You should make up (<strong className="text-text">qaḍāʾ</strong>) the fasts
                      later.
                    </li>
                    <li>Travel. Make up the fasts when you return.</li>
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
              <h2 ref={headingRef} tabIndex={-1} id="fidya-school-h" className={headingClass}>
                Select your school of jurisprudence
              </h2>
              <p className="text-[18.5px] text-text-2">The amount of food (and therefore cost) varies between schools.</p>
              <Link href="/find-your-school" className="btn btn-ghost w-full sm:w-auto justify-between">
                Not sure which school you follow? Take our short quiz
                <Arrow />
              </Link>
              <div role="group" aria-labelledby="fidya-school-h" className="space-y-2">
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
              <h2 ref={headingRef} tabIndex={-1} className={headingClass}>
                How many days?
              </h2>
              <p className="text-[18.5px] text-text-2">
                Enter the total number of fasting days you need to compensate for. A full Ramadan is typically 29 or 30
                days.
              </p>
              <CurrencyInput
                label="Missed fasting days"
                value={missedDays}
                onChange={setMissedDays}
                prefix=""
                placeholder="30"
                suffix="days"
                integer
                hint="Include missed days from previous years if you haven't compensated for them yet"
              />
              <div role="group" aria-label="Quick fill: number of days" className="flex flex-wrap gap-2">
                {[1, 10, 29, 30, 60].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMissedDays(n)}
                    aria-pressed={missedDays === n}
                    className={`btn btn-ghost num !min-w-[64px] !px-4 ${missedDays === n ? "!border-[var(--hue-text)] !text-[var(--hue-text)] !bg-[var(--hue-bg)]" : ""}`}
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
              <h2 ref={headingRef} tabIndex={-1} id="fidya-amount-h" className={headingClass}>
                Calculation method
              </h2>
              <p className="text-[18.5px] text-text-2">Choose how you would like to calculate the fidya amount.</p>
              <div role="group" aria-labelledby="fidya-amount-h" className="space-y-2">
                <OptionCard
                  selected={!useWeight}
                  onClick={() => setUseWeight(false)}
                  title="By local meal cost"
                  description="Use the cost of one average meal in your area. Most practical for cash payments."
                />
                <OptionCard
                  selected={useWeight}
                  onClick={() => setUseWeight(true)}
                  title="By food weight"
                  description={`Classical method: ${FIDYA_WEIGHTS[madhab].measure}`}
                />
              </div>

              <hr className="border-0 border-t-[3px] border-double border-border my-2" />

              {!useWeight ? (
                <CurrencyInput
                  label="Cost of one meal in your area"
                  value={costPerMeal}
                  onChange={setCostPerMeal}
                  hint="The average cost to feed one poor person one meal (for example $10 to $15 in North America, $3 to $5 in South Asia)"
                />
              ) : (
                <div className="space-y-4">
                  {/* Food type selector: matters for Ḥanafī and Ḥanbalī, where the weight varies */}
                  <div>
                    <label htmlFor="fidya-food" className="field-label">
                      Type of staple food
                    </label>
                    <select
                      id="fidya-food"
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value as FidyaFoodType)}
                      aria-describedby={(madhab === "hanafi" || madhab === "hanbali") && foodType !== "wheat" ? "fidya-food-note" : undefined}
                    >
                      <option value="wheat">Wheat / Flour</option>
                      <option value="barley">Barley</option>
                      <option value="dates">Dates</option>
                      <option value="raisins">Raisins</option>
                      <option value="rice">Rice</option>
                    </select>
                    {(madhab === "hanafi" || madhab === "hanbali") && foodType !== "wheat" && (
                      <p id="fidya-food-note" className="field-hint !text-warning-ink">
                        {madhab === "hanafi" ? "Ḥanafī" : "Ḥanbalī"}: non-wheat staples require a larger amount (
                        <span className="num">{FIDYA_WEIGHTS[madhab].getWeightKg(foodType)}</span> kg vs{" "}
                        <span className="num">{FIDYA_WEIGHTS[madhab].getWeightKg("wheat")}</span> kg for wheat)
                      </p>
                    )}
                  </div>
                  <CurrencyInput
                    label={`Price per kilogram of ${foodType}`}
                    value={pricePerKg}
                    onChange={setPricePerKg}
                    hint={`You need ${FIDYA_WEIGHTS[madhab].getWeightKg(foodType)} kg per day (${FIDYA_WEIGHTS[madhab].measure})`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step: Result */}
          {currentStep === "result" && result && (
            <div className="space-y-6" aria-live="polite">
              <h2 ref={headingRef} tabIndex={-1} className={`${headingClass} text-center`}>
                Your fidya obligation
              </h2>

              <Niche label="Total fidya due">
                <p className="result-lede m-0">Total fidya due</p>
                <p className="result-figure m-0 mt-2">{money(result.total)}</p>
                <p className="text-[17.5px] text-text-2 m-0 mt-3">
                  <span className="num">{money(result.perDay)}</span> per day × <span className="num">{count(result.missedDays)}</span> days
                </p>
              </Niche>

              <dl className="m-0 card px-5 sm:px-7 py-1">
                <Row label="School of jurisprudence">{madhabOptions.find((m) => m.value === madhab)?.label}</Row>
                <Row label="Missed days">
                  <span className="num">{count(result.missedDays)}</span>
                </Row>
                <Row label="Per day">
                  <span className="num">{money(result.perDay)}</span>
                </Row>
                <Row label="Calculation" small>
                  <span className="num">{result.unitDescription}</span>
                </Row>
                <Row label="Classical measure" small>
                  {result.weightInfo.measure}
                </Row>
              </dl>

              <div className="callout callout-info text-text-2 leading-relaxed">
                <strong className="text-text">How to pay:</strong> Fidya can be given as actual food or as cash to a poor
                person or an Islamic charity. Many organizations accept fidya payments and distribute food on your behalf.
                The payment is made for each day individually: you feed one poor person per missed day (it can be
                different people, or the same person on different days).
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))} className="btn btn-ghost">
            <Arrow back />
            Back
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 && (
          <button
            type="button"
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            disabled={!canProceed()}
            className="btn btn-primary"
          >
            {step === STEPS.length - 2 ? "See result" : "Continue"}
            <Arrow />
          </button>
        )}
      </div>
    </div>
  );
}
