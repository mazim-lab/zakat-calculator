"use client";

import { useEffect, useRef, useState } from "react";
import { tidyDash } from "@/lib/zakat/display";
import type { Heirs, CalculationResult, Heir, Madhab } from "@/lib/inheritance/types";
import { calculateInheritance } from "@/lib/inheritance/calculate";
import {
  awlInfo,
  raddInfo,
  hajbInfo,
  grandfatherSiblingsInfo,
  umariyyatanInfo,
  jafariSystemInfo,
  getBaytAlMalInfo,
} from "@/lib/inheritance/scholarly-info";
import { numberToFraction, formatUSD, formatPercent } from "@/lib/inheritance/fraction";
import { computeNetEstate } from "@/lib/inheritance/deductions";
import { CurrencyInput } from "@/components/CurrencyInput";
import { OptionCard } from "@/components/OptionCard";
import { InfoAccordion } from "@/components/InfoAccordion";
import { SharesDonut, type DonutSlice } from "./SharesDonut";
import { Niche, Stepper } from "@/components/ornament";

const HEIR_OPTIONS: { id: Heir; title: string; description: string; type: "boolean" | "count" }[] = [
  { id: "husband", title: "Husband", description: "", type: "boolean" },
  { id: "wife", title: "Wife / Wives", description: "", type: "count" },
  { id: "son", title: "Sons", description: "", type: "count" },
  { id: "daughter", title: "Daughters", description: "", type: "count" },
  { id: "father", title: "Father", description: "", type: "boolean" },
  { id: "mother", title: "Mother", description: "", type: "boolean" },
  { id: "paternalGrandfather", title: "Paternal Grandfather", description: "The father of the deceased's father.", type: "boolean" },
  { id: "paternalGrandmother", title: "Paternal Grandmother", description: "The mother of the deceased's father.", type: "boolean" },
  { id: "maternalGrandmother", title: "Maternal Grandmother", description: "The mother of the deceased's mother.", type: "boolean" },
  { id: "fullBrother", title: "Full Brothers", description: "", type: "count" },
  { id: "fullSister", title: "Full Sisters", description: "", type: "count" },
  { id: "paternalHalfBrother", title: "Paternal Half-Brothers", description: "Same father, different mother.", type: "count" },
  { id: "paternalHalfSister", title: "Paternal Half-Sisters", description: "Same father, different mother.", type: "count" },
  { id: "maternalHalfBrother", title: "Maternal Half-Brothers", description: "Same mother, different father.", type: "count" },
  { id: "maternalHalfSister", title: "Maternal Half-Sisters", description: "Same mother, different father.", type: "count" },
  { id: "sonsSon", title: "Son's Sons", description: "Sons of a son who died before the deceased.", type: "count" },
  { id: "sonsDaughter", title: "Son's Daughters", description: "Daughters of a son who died before the deceased.", type: "count" },
];

// Display names for result rows. The engine builds labels from camelCase keys
// ("Sons Son", "Paternal Half Brother"), so the UI maps the heir key here.
const HEIR_LABEL: Partial<Record<Heir, string>> = {
  husband: "Husband",
  wife: "Wife",
  son: "Son",
  daughter: "Daughter",
  father: "Father",
  mother: "Mother",
  paternalGrandfather: "Paternal Grandfather",
  paternalGrandmother: "Paternal Grandmother",
  maternalGrandmother: "Maternal Grandmother",
  fullBrother: "Full Brother",
  fullSister: "Full Sister",
  paternalHalfBrother: "Paternal Half-Brother",
  paternalHalfSister: "Paternal Half-Sister",
  maternalHalfBrother: "Maternal Half-Brother",
  maternalHalfSister: "Maternal Half-Sister",
  sonsSon: "Son's Son",
  sonsDaughter: "Son's Daughter",
};
const heirLabel = (heir: Heir, fallback: string) => HEIR_LABEL[heir] ?? fallback;

const MADHABS: { value: Madhab; label: string }[] = [
  { value: "hanafi", label: "Ḥanafī" },
  { value: "maliki", label: "Mālikī" },
  { value: "shafii", label: "Shāfiʿī" },
  { value: "hanbali", label: "Ḥanbalī" },
  { value: "jafari", label: "Jaʿfarī" },
];

const STEPS = ["Heirs", "Estate", "School", "Results"];

/** Same pie data as the original page (shares above 0, then Bayt al-Māl). */
function buildPieData(result: CalculationResult, estateValue: number): DonutSlice[] {
  const pieData: DonutSlice[] = result.shares
    .filter((s) => (s.share ?? 0) > 0)
    .map((s) => ({
      name: `${heirLabel(s.heir, s.label)}${s.count > 1 ? ` (×${s.count})` : ""}`,
      value: s.amount,
      share: s.share ?? 0,
      fraction: numberToFraction(s.share ?? 0),
    }));
  if (result.baytAlMalAmount && result.baytAlMalAmount > 0) {
    pieData.push({
      name: "Bayt al-Māl",
      value: result.baytAlMalAmount,
      share: result.baytAlMalAmount / estateValue,
      fraction: numberToFraction(result.baytAlMalAmount / estateValue),
    });
  }
  if (result.unresolvedAmount && result.unresolvedAmount > 0) {
    pieData.push({
      name: "Not assigned (see note)",
      value: result.unresolvedAmount,
      share: result.unresolvedAmount / estateValue,
      fraction: numberToFraction(result.unresolvedAmount / estateValue),
    });
  }
  return pieData;
}

export default function InheritanceCalculator() {
  const [step, setStep] = useState(1);
  const [heirs, setHeirs] = useState<Heirs>({});
  const [grossEstate, setGrossEstate] = useState<number>(100000);
  const [funeral, setFuneral] = useState<number>(0);
  const [debts, setDebts] = useState<number>(0);
  const [bequest, setBequest] = useState<number>(0);
  const [madhab, setMadhab] = useState<Madhab>("hanafi");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [resultEstate, setResultEstate] = useState<number>(0);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const estate = computeNetEstate({ gross: grossEstate, funeral, debts, bequest });
  const estateValue = estate.net;

  const handleHeirToggle = (heir: Heir, type: "boolean" | "count") => {
    setHeirs((prev) => {
      const newHeirs: Record<string, unknown> = { ...prev };
      if (newHeirs[heir]) {
        delete newHeirs[heir];
      } else {
        newHeirs[heir] = type === "boolean" ? true : 1;
      }
      return newHeirs as Heirs;
    });
  };

  const handleHeirCountChange = (heir: Heir, count: number) => {
    if (Number.isNaN(count)) return; // an empty box while typing keeps the heir selected
    if (count > 0) {
      setHeirs((prev) => ({ ...prev, [heir]: count }));
    } else {
      setHeirs((prev) => {
        const newHeirs: Record<string, unknown> = { ...prev };
        delete newHeirs[heir];
        return newHeirs as Heirs;
      });
    }
  };

  const runCalculation = () => {
    // Pass a copy: calculateInheritance removes blocked heirs from the object it receives.
    const calculatedResult = calculateInheritance(estateValue, { ...heirs }, madhab);
    setResult(calculatedResult);
    setResultEstate(estateValue);
    setStep(4);
  };

  const selectedCount = Object.keys(heirs).length;
  const hasSpouseShare = result?.shares.some((s) => s.heir === "husband" || s.heir === "wife") ?? false;
  const baytAmount = result?.baytAlMalAmount ?? 0;

  return (
    <div className="hue-fuchsia">
      <div className="mb-6">
        <Stepper labels={STEPS} current={step - 1} />
      </div>
      <div className="card p-5 sm:p-9">

      {step === 1 && (
        <div key="step1" className="fade-in">
          <h2 ref={headingRef} tabIndex={-1} id="inh-step-h" className="text-[28px] sm:text-[34px] font-bold leading-tight mb-2 outline-none">
            Step 1: Select heirs
          </h2>
          <p className="text-text-2 text-[18.5px] mb-6">
            Choose every living relative of the deceased. For brothers, sisters, sons, daughters and wives, set how many.
          </p>
          <div role="group" aria-labelledby="inh-step-h" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <OptionCard
              title="No Heirs"
              description="The deceased has no living inheritors."
              selected={selectedCount === 0}
              onClick={() => {
                setHeirs({});
                setStep(2);
              }}
            />
            {HEIR_OPTIONS.map(({ id, title, description, type }) => (
              <OptionCard
                key={id}
                title={title}
                description={description || undefined}
                selected={!!heirs[id]}
                onClick={() => handleHeirToggle(id, type)}
              >
                {type === "count" && heirs[id] ? (
                  <CountStepper
                    label={`Number of ${title.toLowerCase()}`}
                    value={heirs[id] as number}
                    onChange={(n) => handleHeirCountChange(id, n)}
                  />
                ) : null}
              </OptionCard>
            ))}
          </div>
          <p className="field-hint mt-4" aria-live="polite">
            {selectedCount === 0
              ? "No heirs selected. If you continue, the estate is treated as having no heirs."
              : `${selectedCount} type${selectedCount === 1 ? "" : "s"} of heir selected.`}
          </p>
        </div>
      )}

      {step === 2 && (
        <div key="step2" className="fade-in">
          <h2 ref={headingRef} tabIndex={-1} className="text-[28px] sm:text-[34px] font-bold leading-tight mb-2 outline-none">
            Step 2: Set the estate value
          </h2>
          <p className="text-text-2 text-[18.5px] mb-6">
            Shares are worked out on what is left after funeral costs, debts and any bequest (waṣiyyah). If you already
            know that net figure, enter it as the total and leave the other boxes at 0.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <CurrencyInput label="Total estate value" value={grossEstate} onChange={setGrossEstate} prefix="$" hint="Everything the deceased owned at death." />
            <CurrencyInput label="Funeral and burial costs" value={funeral} onChange={setFuneral} prefix="$" hint="Paid first, if not already paid." />
            <CurrencyInput label="Debts" value={debts} onChange={setDebts} prefix="$" hint="Loans, unpaid bills, unpaid mahr and other debts." />
            <CurrencyInput label="Bequest (waṣiyyah)" value={bequest} onChange={setBequest} prefix="$" hint="Amount left by will, usually to people who are not heirs." />
          </div>
          <div className="card jadwal mt-6 px-6 py-5 flex flex-wrap items-baseline justify-between gap-2" aria-live="polite">
            <span className="text-text-2 text-[18px]">Net estate to divide</span>
            <span className="num text-[26px] font-bold text-text">{formatUSD(estateValue)}</span>
          </div>
          {estate.deductionsExceedEstate && (
            <div className="callout callout-danger mt-3 text-text-2">
              The deductions are larger than the estate, so there is nothing left to divide. Check the figures.
            </div>
          )}
          {estate.bequestAboveOneThird && !estate.deductionsExceedEstate && (
            <div className="callout callout-warning mt-3 text-text-2">
              The bequest is more than one third of what is left after funeral costs and debts (
              <span className="num">{formatUSD(estate.oneThirdAfterDebts)}</span>). Scholars generally require the heirs&apos;
              agreement for any amount above one third. The calculator uses the figure you entered. Please check this with
              a scholar.
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div key="step3" className="fade-in">
          <h2 ref={headingRef} tabIndex={-1} id="inh-madhab-h" className="text-[28px] sm:text-[34px] font-bold leading-tight mb-2 outline-none">
            Step 3: Choose a school of law (madhab)
          </h2>
          <p className="text-text-2 text-[18.5px] mb-3">
            Different schools have minor variations in some complex cases. Choose the one you wish to follow.
          </p>
          <a href="/find-your-school" className="lnk ui text-[17px] inline-flex items-center min-h-[44px] mb-4">
            Not sure which school you follow? Take the short quiz
          </a>
          <div role="group" aria-labelledby="inh-madhab-h" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MADHABS.map((m) => (
              <OptionCard
                key={m.value}
                title={m.label}
                selected={madhab === m.value}
                onClick={() => setMadhab(m.value)}
                description={m.value === "jafari" ? "Class-based system. No ʿaṣabah (residuary heirs). No ʿawl." : undefined}
              />
            ))}
          </div>
          <div className="mt-6">
            <InfoAccordion info={grandfatherSiblingsInfo} label={grandfatherSiblingsInfo.title} />
            <InfoAccordion info={raddInfo} label={raddInfo.title} />
            {madhab === "jafari" && <InfoAccordion info={jafariSystemInfo} label={jafariSystemInfo.title} />}
          </div>
        </div>
      )}

      {step === 4 && result && (
        <div key="step4" className="fade-in">
          <h2 ref={headingRef} tabIndex={-1} className="text-[28px] sm:text-[34px] font-bold leading-tight mb-6 outline-none">
            Results
          </h2>
          <div aria-live="polite" className="space-y-6">
            <Niche label="Estate distribution">
              <p className="result-lede">Estate distribution</p>
              <h3 className="result-figure !text-[clamp(30px,9vw,46px)] mt-1 mb-6">
                <span className="sr-only">Estate distribution of </span>
                <span className="num">{formatUSD(resultEstate)}</span>
              </h3>
              <div className="text-start">
              {result.shares.length === 0 && result.baytAlMalAmount === resultEstate ? (
                <div className="callout callout-success">
                  <p className="font-bold text-text text-[19px]">
                    100% to Bayt al-Māl <span lang="ar" dir="rtl" className="ar font-normal">(بيت المال)</span>
                  </p>
                </div>
              ) : (
                <SharesDonut data={buildPieData(result, resultEstate)} />
              )}
              </div>
            </Niche>

            {result.wasAwlApplied && (
              <div className="callout callout-warning">
                <p className="font-semibold text-text">ʿAwl (proportional reduction) applied</p>
                <p className="text-text-2">{result.awlExplanation}</p>
              </div>
            )}
            {result.wasRaddApplied && (
              <div className="callout callout-info">
                <p className="font-semibold text-text">Radd (redistribution) applied</p>
                <p className="text-text-2">{result.raddExplanation}</p>
              </div>
            )}

            {(result.unresolvedAmount ?? 0) > 0 && (
              <div className="callout callout-warning">
                <p className="font-semibold text-text">
                  Part of the estate is not assigned by the calculator:{" "}
                  <span className="num">{formatUSD(result.unresolvedAmount ?? 0)}</span>
                  <span className="ms-2 text-[16px] font-normal text-text-2 num">({formatPercent((result.unresolvedAmount ?? 0) / resultEstate)})</span>
                </p>
                <p className="text-text-2">{result.unresolvedExplanation}</p>
              </div>
            )}

            {baytAmount > 0 && (
              <div className="callout callout-success space-y-4">
                <div>
                  <p className="font-bold text-text text-[19px] flex flex-wrap items-baseline gap-2">
                    <span lang="ar" dir="rtl" className="ar text-[22px] font-normal">بيت المال</span>
                    Bayt al-Māl (public treasury)
                  </p>
                  <p className="mt-1 text-text-2">{tidyDash(result.baytAlMalExplanation ?? "")}</p>
                  <p className="font-semibold text-text mt-2">
                    Amount: <span className="num">{formatUSD(baytAmount)}</span>
                    <span className="ms-2 text-[16px] font-normal text-text-2 num">({formatPercent(baytAmount / resultEstate)})</span>
                  </p>
                </div>
                <div className="border-t border-success-border pt-4">
                  <p className="font-semibold text-text mb-2">In countries without a Bayt al-Māl</p>
                  <p className="text-[16.5px] text-text-2 mb-3">
                    Most Western nations do not have an Islamic public treasury. Scholars have outlined the following options
                    for handling this portion:
                  </p>
                  <div className="space-y-3 text-[16.5px]">
                    <div className="rounded-[var(--radius)] bg-surface p-4 border border-success-border">
                      <p className="font-semibold text-text">1. Direct to Islamic charitable causes (majority scholarly position)</p>
                      <p className="mt-1 text-text-2">
                        Mosques, Islamic schools, Muslim welfare organizations, and community institutions serve a similar
                        function to Bayt al-Māl. This is the position of the Fiqh Council of North America and the European
                        Council for Fatwa and Research.
                      </p>
                    </div>
                    {hasSpouseShare && (
                      <div className="rounded-[var(--radius)] bg-surface p-4 border border-success-border">
                        <p className="font-semibold text-text">2. Return it to the spouse (view of some later Ḥanafī scholars)</p>
                        <p className="mt-1 text-text-2">
                          Some later Ḥanafī scholars held that when no Bayt al-Māl exists, the remainder may return to the
                          spouse. A report from ʿUthmān ibn ʿAffān is sometimes cited for it. The calculator does not apply
                          this view; it is shown so you can discuss it with a scholar.
                        </p>
                      </div>
                    )}
                    <div className="rounded-[var(--radius)] bg-surface p-4 border border-warning-border">
                      <p className="font-semibold text-text">Write a waṣiyyah (Islamic will)</p>
                      <p className="mt-1 text-text-2">
                        The best practical step is to write a waṣiyyah that explicitly directs this portion to specific
                        Islamic charities. Without a will, most Western jurisdictions will distribute your estate according to
                        their own intestacy laws, which will not follow Islamic inheritance rules.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result.shares.length > 0 && (
              <div>
                <h3 className="text-[24px] font-bold mb-4">Heir shares</h3>
                <ul className="list-none p-0 m-0 grid gap-3">
                  {/* calculate.ts can emit a 0 share for a residuary partner the user never selected (e.g. "Daughter 0" next to a son); hide only those rows. */}
                  {result.shares.filter((s) => (s.share ?? 0) > 0 || !!heirs[s.heir]).map((s) => {
                    const name = `${heirLabel(s.heir, s.label)}${s.count > 1 ? ` (×${s.count})` : ""}`;
                    const share = s.share ?? 0;
                    return (
                      <li key={s.heir} className="card p-5 sm:p-6 flex gap-4 sm:gap-6 items-start">
                        <div className="shrink-0 min-w-[76px] sm:min-w-[96px] text-center rounded-[var(--radius)] py-3 px-2" style={{ background: "var(--hue-bg)" }}>
                          <p className="num text-[30px] sm:text-[36px] font-bold leading-none" style={{ color: "var(--hue-text)" }}>
                            {numberToFraction(share)}
                          </p>
                          <p className="num text-[15px] text-text-2 mt-1.5 ui">{formatPercent(share)}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[19px] text-text leading-snug">
                            {share > 0 ? (
                              <>
                                <strong>{name}</strong> {s.count > 1 ? "share" : "receives"}{" "}
                                {Math.abs(share - 1) < 1e-9 ? "the whole estate" : `${numberToFraction(share)} of the estate`}
                                {s.count > 1 ? " together" : ""}:{" "}
                                <strong className="num whitespace-nowrap">{formatUSD(s.amount)}</strong>
                              </>
                            ) : (
                              <>
                                <strong>{name}</strong> does not inherit a share here:{" "}
                                <strong className="num whitespace-nowrap">{formatUSD(s.amount)}</strong>
                              </>
                            )}
                          </p>
                          <p className="text-[16px] text-text-2 mt-2 leading-relaxed">{tidyDash(s.reason)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {result.blocked.length > 0 && (
              <div>
                <h3 className="text-[24px] font-bold mb-4">Blocked heirs</h3>
                <ul className="list-none p-0 m-0 divide-y divide-border card">
                  {result.blocked.map((b) => (
                    <li key={b.heir} className="px-5 py-4">
                      <p className="text-text">
                        <span className="font-semibold">{heirLabel(b.heir, b.label)}</span> was blocked.
                      </p>
                      <p className="text-[16px] text-text-2 mt-1">Reason: {tidyDash(b.reason)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.notes.length > 0 && (
              <div className="panel">
                <p className="eyebrow mb-2">Notes</p>
                <ul className="m-0 star-list space-y-1.5 text-[17px] text-text-2">
                  {result.notes.map((n, i) => (
                    <li key={i}>{tidyDash(n)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6">
            <InfoAccordion info={hajbInfo} label={hajbInfo.title} />
            {result.wasAwlApplied && <InfoAccordion info={awlInfo} label={awlInfo.title} />}
            {result.wasRaddApplied && <InfoAccordion info={raddInfo} label={raddInfo.title} />}
            {baytAmount > 0 && (
              <InfoAccordion info={getBaytAlMalInfo(hasSpouseShare)} label="Bayt al-Māl: what the scholars say" />
            )}
            <InfoAccordion info={umariyyatanInfo} label={umariyyatanInfo.title} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-3 mt-10 pt-6 border-t-[3px] border-double border-border">
        <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="btn btn-ghost">
          Back
        </button>
        {step < 3 && (
          <button type="button" onClick={() => setStep((s) => Math.min(4, s + 1))} className="btn btn-primary">
            Continue
          </button>
        )}
        {step === 3 && (
          <button type="button" onClick={runCalculation} className="btn btn-primary">
            Calculate
          </button>
        )}
        {step === 4 && (
          <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">
            Change heirs
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

function CountStepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        className="btn btn-ghost !px-0 !min-h-[48px] w-12 text-[22px]"
        onClick={() => onChange(value - 1)}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        aria-label={label}
        className="!w-20 !min-h-[48px] text-center"
      />
      <button
        type="button"
        className="btn btn-ghost !px-0 !min-h-[48px] w-12 text-[22px]"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
