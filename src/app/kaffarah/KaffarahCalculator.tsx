"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { Madhab, KaffarahType, KAFFARAH_TYPES } from "@/lib/kaffarah/types";
import { getKaffarahRuling, estimateFeedingCost, hasFeedingOption } from "@/lib/kaffarah/rulings";
import { kaffarahTotalText, kaffarahBreakdownText, kaffarahEstimateLabel } from "@/lib/kaffarah/calculate";
import {
  KAFFARAH_OVERVIEW_INFO,
  KAFFARAH_FAST_INFO,
  KAFFARAH_OATH_INFO,
} from "@/lib/kaffarah/scholarly-info";
import { InfoAccordion } from "@/components/InfoAccordion";
import { CurrencyInput } from "@/components/CurrencyInput";
import { OptionCard } from "@/components/OptionCard";
import { Niche, Rosette, Stepper } from "@/components/ornament";

const madhabOptions: { value: Madhab; label: string; labelAr: string }[] = [
  { value: "hanafi", label: "Ḥanafī", labelAr: "حنفي" },
  { value: "maliki", label: "Mālikī", labelAr: "مالكي" },
  { value: "shafii", label: "Shāfiʿī", labelAr: "شافعي" },
  { value: "hanbali", label: "Ḥanbalī", labelAr: "حنبلي" },
  { value: "jafari", label: "Jaʿfarī", labelAr: "جعفري" },
];

type Step = "intro" | "type" | "school" | "cost" | "result";
const STEPS: Step[] = ["intro", "type", "school", "cost", "result"];
const STEP_LABELS: Record<Step, string> = {
  intro: "Introduction",
  type: "What happened",
  school: "School",
  cost: "Cost estimate",
  result: "Result",
};

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={back ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180"}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-t border-border first:border-t-0">
      <dt className="text-text-2 text-[17px]">{label}</dt>
      <dd className="m-0 font-bold text-text text-end text-[17.5px]">{children}</dd>
    </div>
  );
}

export function KaffarahCalculator() {
  const [step, setStep] = useState(0);
  const [kaffarahType, setKaffarahType] = useState<KaffarahType>("broken_fast");
  const [madhab, setMadhab] = useState<Madhab>("hanafi");
  const [costPerMeal, setCostPerMeal] = useState(10);
  const [instances, setInstances] = useState(1);

  const currentStep = STEPS[step];

  const ruling = useMemo(() => getKaffarahRuling(kaffarahType, madhab), [kaffarahType, madhab]);

  const feedingEstimate = useMemo(
    () => estimateFeedingCost(kaffarahType, madhab, costPerMeal),
    [kaffarahType, madhab, costPerMeal],
  );

  const contextualInfo =
    kaffarahType === "broken_fast" ? KAFFARAH_FAST_INFO : kaffarahType === "broken_oath" ? KAFFARAH_OATH_INFO : null;

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
    <div className="hue-amber">
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
                What is kaffārah?
              </h2>
              <div className="space-y-4 text-[18.5px] text-text-2 leading-relaxed">
                <p>
                  <strong className="text-text">Kaffārah</strong> (<span lang="ar" dir="rtl" className="ar">كَفَّارَة</span>,
                  &ldquo;expiation&rdquo; or &ldquo;atonement&rdquo;) is a prescribed penalty in Islamic law for specific
                  violations of religious obligations. It serves as both spiritual purification and charity.
                </p>
                <p>
                  Unlike <strong className="text-text">fidya</strong> (which compensates for inability to fast), kaffārah
                  is required when you <strong className="text-text">deliberately</strong> violate an obligation, such as
                  intentionally breaking a Ramadan fast or breaking a sworn oath.
                </p>
                <p>
                  The type and severity of kaffārah depends on what was violated, and the specific requirements differ
                  between schools of thought.
                </p>
              </div>
              <InfoAccordion info={KAFFARAH_OVERVIEW_INFO} />
            </div>
          )}

          {/* Type Selection */}
          {currentStep === "type" && (
            <div className="space-y-5">
              <h2 ref={headingRef} tabIndex={-1} id="kaff-type-h" className={headingClass}>
                What happened?
              </h2>
              <p className="text-[18.5px] text-text-2">Select the type of violation that requires kaffārah.</p>
              <div role="group" aria-labelledby="kaff-type-h" className="space-y-2">
                {KAFFARAH_TYPES.map((kt) => (
                  <OptionCard
                    key={kt.id}
                    selected={kaffarahType === kt.id}
                    onClick={() => setKaffarahType(kt.id)}
                    title={kt.title}
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
              <h2 ref={headingRef} tabIndex={-1} id="kaff-school-h" className={headingClass}>
                Select your school of jurisprudence
              </h2>
              <p className="text-[18.5px] text-text-2">
                Requirements for kaffārah vary significantly between schools, especially for broken fasts.
              </p>
              <Link href="/find-your-school" className="btn btn-ghost w-full sm:w-auto justify-between">
                Not sure which school you follow? Take our short quiz
                <Arrow />
              </Link>
              <div role="group" aria-labelledby="kaff-school-h" className="space-y-2">
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
              <h2 ref={headingRef} tabIndex={-1} className={headingClass}>
                Cost estimate
              </h2>
              <p className="text-[18.5px] text-text-2">If the feeding option applies, we can estimate the monetary cost.</p>
              <CurrencyInput
                label="Cost of one meal in your area"
                value={costPerMeal}
                onChange={setCostPerMeal}
                hint="Average cost to feed one poor person one meal"
              />
              <CurrencyInput
                label="Number of instances"
                value={instances}
                onChange={setInstances}
                prefix=""
                suffix={kaffarahType === "broken_fast" ? "days" : "times"}
                integer
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
            <div className="space-y-6" aria-live="polite">
              <h2 ref={headingRef} tabIndex={-1} className={`${headingClass} text-center`}>
                Your kaffārah obligation
              </h2>

              {/* Shāfiʿī / Ḥanbalī eating or drinking notice */}
              {kaffarahType === "broken_fast" && (madhab === "shafii" || madhab === "hanbali") && (
                <div className="callout callout-warning">
                  <p className="font-bold text-text m-0 mb-1">
                    Important: did you break your fast by eating or drinking?
                  </p>
                  <p className="text-text-2 m-0">
                    In the {madhab === "shafii" ? "Shāfiʿī" : "Ḥanbalī"} school, kaffārah is only required for breaking a
                    fast by <strong className="text-text">sexual intercourse</strong>. If you deliberately ate or drank,
                    you owe only <strong className="text-text">qaḍāʾ</strong> (making up the day) and sincere repentance,{" "}
                    <strong className="text-text">not</strong> kaffārah. The amounts below only apply if the fast was
                    broken by sexual intercourse.
                  </p>
                </div>
              )}

              {/* Feeding cost estimate (only where feeding is one of the options) */}
              {hasFeedingOption(kaffarahType, madhab) ? (
                <Niche label={kaffarahEstimateLabel(instances)}>
                  <p className="result-lede m-0">{kaffarahEstimateLabel(instances)}</p>
                  <p className="result-figure m-0 mt-2">{kaffarahTotalText(feedingEstimate, instances)}</p>
                  <p className="num text-[17.5px] text-text-2 m-0 mt-3">{kaffarahBreakdownText(feedingEstimate, costPerMeal, instances)}</p>
                </Niche>
              ) : (
                <div className="callout callout-info">
                  <p className="font-bold text-text m-0 mb-1">No feeding option in this school</p>
                  <p className="text-text-2 m-0">
                    For accidental killing the Qurʾān (4:92) names only freeing a believing slave and, for whoever cannot,
                    fasting two consecutive months. None of the four Sunni schools allows feeding the poor instead, so no
                    cost is shown. The kaffārah is the fast{instances > 1 ? `, for each of the ${instances} instances` : ""}.
                  </p>
                </div>
              )}

              {/* Type & School */}
              <dl className="m-0 card px-5 sm:px-7 py-1">
                <Row label="Violation">{KAFFARAH_TYPES.find((t) => t.id === kaffarahType)?.title}</Row>
                <Row label="School">{madhabOptions.find((m) => m.value === madhab)?.label}</Row>
                <Row label="Options">
                  <span className="text-[16.5px]">{ruling.isSequential ? "Sequential (try in order)" : "Choose any option"}</span>
                </Row>
              </dl>

              {/* Options */}
              <div>
                <h3 className="font-bold text-[24px] text-text mb-4">
                  {ruling.isSequential ? "Options (must be attempted in this order)" : "Options (you may choose any)"}
                </h3>
                <ol className="list-none p-0 m-0 space-y-3">
                  {ruling.options.map((opt, i) => (
                    <li
                      key={i}
                      className={`p-5 rounded-[var(--radius)] border border-border ${
                        opt.action.includes("slave") ? "bg-surface-2 text-text-2" : "bg-surface"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Rosette n={opt.order} state={opt.action.includes("slave") ? "todo" : "done"} size={36} />
                        <div className="min-w-0">
                          <p className={`font-bold text-[18.5px] m-0 ${opt.action.includes("slave") ? "text-text-2" : "text-text"}`}>
                            {opt.action}
                            {opt.isFallback && (
                              <span className="text-[15.5px] font-normal text-text-2 ms-2">(if previous option is impossible)</span>
                            )}
                          </p>
                          <p className="text-[16.5px] text-text-2 mt-1 mb-0 leading-relaxed">{opt.detail}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-bold text-[24px] text-text mb-4">Important notes</h3>
                <ul className="star-list m-0 space-y-2.5 text-[17px] text-text-2 leading-relaxed">
                  {ruling.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>

              <div className="callout callout-info text-text-2 leading-relaxed">
                <strong className="text-text">Remember:</strong> Kaffārah is not just a financial transaction. It requires
                sincere repentance (<strong className="text-text">tawbah</strong>) and a genuine intention not to repeat
                the violation. The financial or physical penalty is the outward part; the spiritual part is equally
                important.
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
          <button type="button" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} className="btn btn-primary">
            {step === STEPS.length - 2 ? "See result" : "Continue"}
            <Arrow />
          </button>
        )}
      </div>
    </div>
  );
}
