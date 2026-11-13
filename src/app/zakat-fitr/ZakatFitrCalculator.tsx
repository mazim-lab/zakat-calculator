"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { Madhab, FITR_AMOUNTS } from "@/lib/zakat-fitr/types";
import {
  FITR_OVERVIEW_INFO,
  FITR_AMOUNT_INFO,
  FITR_TIMING_INFO,
  FITR_WHO_INFO,
} from "@/lib/zakat-fitr/scholarly-info";
import { calculateFitr } from "@/lib/zakat-fitr/calculate";
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

type Step = "intro" | "school" | "household" | "cost" | "result";
const STEPS: Step[] = ["intro", "school", "household", "cost", "result"];
const STEP_LABELS: Record<Step, string> = {
  intro: "Introduction",
  school: "School",
  household: "Household",
  cost: "Amount per person",
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

export function ZakatFitrCalculator() {
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
  const madhabLabel = madhabOptions.find((m) => m.value === madhab)?.label;

  const result = useMemo(
    () => calculateFitr({ fitrInfo, totalPeople, useWeight, pricePerKg, costPerPerson }),
    [totalPeople, useWeight, pricePerKg, costPerPerson, fitrInfo],
  );

  const canProceed = () => {
    if (currentStep === "household") return totalPeople > 0;
    return true;
  };

  // Move focus to the new step's heading when the step changes (not on first render).
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
    <div className="hue-cyan">
      {/* Progress */}
      <div className="mb-6">
        <Stepper labels={STEPS.map((s) => STEP_LABELS[s])} current={step} />
      </div>

      {/* Steps */}
      <div className="card p-5 sm:p-9 mb-6">
        <div key={currentStep} className="fade-in">
          {/* Intro */}
          {currentStep === "intro" && (
            <div className="space-y-5">
              <h2 ref={headingRef} tabIndex={-1} className={headingClass}>
                What is Zakat al-Fiṭr?
              </h2>
              <div className="space-y-4 text-[18.5px] text-text-2 leading-relaxed">
                <p>
                  <strong className="text-text">Zakat al-Fiṭr</strong> (<span lang="ar" dir="rtl" className="ar">زكاة الفطر</span>, also called{" "}
                  <strong className="text-text">Fiṭrānah</strong> or <strong className="text-text">Ṣadaqat al-Fiṭr</strong>) is a
                  mandatory charitable payment made at the end of Ramadan, before the Eid al-Fiṭr prayer.
                </p>
                <p>
                  It has two purposes: <strong className="text-text">(1)</strong> to purify the fasting person from any
                  shortcomings during Ramadan (idle talk, minor sins), and <strong className="text-text">(2)</strong> to ensure
                  that poor people can also celebrate Eid with dignity and joy.
                </p>
                <p>
                  Unlike annual Zakat (which is based on your total wealth), Zakat al-Fiṭr is a{" "}
                  <strong className="text-text">flat per-person amount</strong>. You pay it for yourself and every person you
                  are financially responsible for (spouse, children, dependents).
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
              <h2 ref={headingRef} tabIndex={-1} id="fitr-school-h" className={headingClass}>
                Select your school of jurisprudence
              </h2>
              <p className="text-[18.5px] text-text-2">
                Schools differ on the amount of food required and whether cash payment is acceptable.
              </p>
              <Link href="/find-your-school" className="btn btn-ghost w-full sm:w-auto justify-between">
                Not sure which school you follow? Take our short quiz
                <Arrow />
              </Link>
              <div role="group" aria-labelledby="fitr-school-h" className="space-y-2">
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
              <h2 ref={headingRef} tabIndex={-1} className={headingClass}>
                Your household
              </h2>
              <p className="text-[18.5px] text-text-2">
                You pay Zakat al-Fiṭr for yourself and every person you are financially responsible for, including
                infants.
              </p>
              {madhab === "jafari" && (
                <div className="callout callout-info text-text-2">
                  <strong className="text-text">Jaʿfarī note:</strong> This includes any guests in your home at sunset on
                  the eve of Eid.
                </div>
              )}
              <div className="space-y-4">
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
                  label={madhab === "jafari" ? "Other dependents and guests" : "Other dependents"}
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
              <div className="panel flex items-center justify-between" aria-live="polite">
                <p className="text-text-2 m-0">Total people</p>
                <p className="num text-[32px] font-bold text-text m-0">{totalPeople}</p>
              </div>
              {totalPeople <= 0 && (
                <p className="text-text-2 m-0">Enter at least one person to continue.</p>
              )}
            </div>
          )}

          {/* Cost */}
          {currentStep === "cost" && (
            <div className="space-y-5">
              <h2 ref={headingRef} tabIndex={-1} id="fitr-cost-h" className={headingClass}>
                Amount per person
              </h2>
              <p className="text-[18.5px] text-text-2">Choose how you would like to calculate the per-person amount.</p>
              {!fitrInfo.cashPermitted && (
                <div className="callout callout-warning text-text-2">
                  <p className="m-0 font-bold text-text">
                    The {madhabLabel} school classically requires giving actual food, not cash.
                  </p>
                  {fitrInfo.modernCashNote && <p className="mt-1.5 mb-0">{fitrInfo.modernCashNote}</p>}
                </div>
              )}
              <div role="group" aria-labelledby="fitr-cost-h" className="space-y-2">
                <OptionCard
                  selected={!useWeight}
                  onClick={() => setUseWeight(false)}
                  title="By local equivalent"
                  description="Use a flat amount per person. Many Islamic organizations publish a recommended amount each year (about $10 to $15 in North America)."
                />
                <OptionCard
                  selected={useWeight}
                  onClick={() => setUseWeight(true)}
                  title="By food weight"
                  description={`Classical method: ${fitrInfo.measure}`}
                />
              </div>

              <hr className="border-0 border-t-[3px] border-double border-border my-2" />

              {!useWeight ? (
                <CurrencyInput
                  label="Amount per person"
                  value={costPerPerson}
                  onChange={setCostPerPerson}
                  hint="Check your local mosque or Islamic organization for this year's recommended amount. Typically $10 to $15 in North America, $3 to $5 in South Asia."
                />
              ) : (
                <div className="space-y-4">
                  <div className="panel">
                    <p className="text-text-2 m-0">Required per person:</p>
                    <p className="font-semibold text-text m-0 mt-0.5">
                      <span className="num">{fitrInfo.weightKg}</span> kg of staple food
                    </p>
                    <p className="text-[15.5px] text-text-2 m-0 mt-1">{fitrInfo.measure}</p>
                  </div>
                  <CurrencyInput
                    label="Price per kilogram of staple food"
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
            <div className="space-y-6" aria-live="polite">
              <h2 ref={headingRef} tabIndex={-1} className={`${headingClass} text-center`}>
                Your Zakat al-Fiṭr
              </h2>

              <Niche label="Total due">
                <p className="result-lede m-0">Total due</p>
                <p className="result-figure m-0 mt-2">{money(result.total)}</p>
                <p className="text-[17.5px] text-text-2 m-0 mt-3">
                  <span className="num">{money(result.perPerson)}</span> × <span className="num">{count(result.totalPeople)}</span>{" "}
                  {result.totalPeople === 1 ? "person" : "people"}
                </p>
              </Niche>

              <dl className="m-0 card px-5 sm:px-7 py-1">
                <Row label="School of jurisprudence">{madhabLabel}</Row>
                <Row label="People in household">
                  <span className="num">{count(result.totalPeople)}</span>
                </Row>
                <Row label="Per person">
                  <span className="num">{money(result.perPerson)}</span>
                </Row>
                <Row label="Calculation" small>
                  <span className="num">{result.method}</span>
                </Row>
                <Row label="Cash permitted?">
                  {fitrInfo.cashPermitted ? (
                    <span className="text-success-ink">Yes</span>
                  ) : (
                    <span className="text-warning-ink text-[16px]">Classically no, but widely accepted via charities</span>
                  )}
                </Row>
                <Row label="Classical measure" small>
                  {fitrInfo.measure}
                </Row>
              </dl>

              <div className="callout callout-info text-text-2 leading-relaxed">
                <strong className="text-text">When to pay:</strong> Before the Eid al-Fiṭr prayer. Most scholars recommend
                paying a few days early so recipients can use it for Eid preparations. Paying after the Eid prayer is
                considered a regular charity (ṣadaqah), not Zakat al-Fiṭr.
              </div>

              <div className="callout callout-info text-text-2 leading-relaxed">
                <strong className="text-text">How to pay:</strong> Give directly to a poor person, or through your local
                mosque or an Islamic charity that distributes food or funds before Eid. Many organizations accept Zakat
                al-Fiṭr online and distribute it in communities where it is most needed.
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
