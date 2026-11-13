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

  const progress = (step / 4) * 100;
  const selectedCount = Object.keys(heirs).length;
  const hasSpouseShare = result?.shares.some((s) => s.heir === "husband" || s.heir === "wife") ?? false;
  const baytAmount = result?.baytAlMalAmount ?? 0;

  return (
    <div className="hue-fuchsia card p-4 sm:p-6">
      {/* Step indicator */}
      <ol className="list-none p-0 m-0 flex items-center gap-2 sm:gap-4 mb-3" aria-label="Progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n === step ? "current" : n < step ? "done" : "todo";
          return (
            <li
              key={label}
              aria-label={`Step ${n} of ${STEPS.length}: ${label}${state === "done" ? " (completed)" : ""}`}
              aria-current={state === "current" ? "step" : undefined}
              className="flex items-center gap-2 text-[13px] sm:text-sm"
            >
              <span
                aria-hidden="true"
                className={`grid place-items-center w-7 h-7 rounded-full mono text-[12px] font-semibold border ${
                  state === "current"
                    ? "bg-accent text-on-accent border-transparent"
                    : state === "done"
                      ? "bg-surface-2 text-text border-border-strong"
                      : "bg-surface text-text-2 border-border"
                }`}
              >
                {n}
              </span>
              <span aria-hidden="true" className={`hidden sm:inline ${state === "current" ? "text-text font-semibold" : "text-text-2"}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="progress-track mb-6" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {step === 1 && (
        <div key="step1" className="fade-in">
          <h2 ref={headingRef} tabIndex={-1} id="inh-step-h" className="text-[21px] sm:text-[23px] font-[650] mb-1 outline-none">
            Step 1: Select heirs
          </h2>
          <p className="text-text-2 text-[15px] mb-5">
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
          <h2 ref={headingRef} tabIndex={-1} className="text-[21px] sm:text-[23px] font-[650] mb-1 outline-none">
            Step 2: Set the estate value
          </h2>
          <p className="text-text-2 text-[15px] mb-5">
            Shares are worked out on what is left after funeral costs, debts and any bequest (waṣiyyah). If you already
            know that net figure, enter it as the total and leave the other boxes at 0.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <CurrencyInput label="Total estate value" value={grossEstate} onChange={setGrossEstate} prefix="$" hint="Everything the deceased owned at death." />
            <CurrencyInput label="Funeral and burial costs" value={funeral} onChange={setFuneral} prefix="$" hint="Paid first, if not already paid." />
            <CurrencyInput label="Debts" value={debts} onChange={setDebts} prefix="$" hint="Loans, unpaid bills, unpaid mahr and other debts." />
            <CurrencyInput label="Bequest (waṣiyyah)" value={bequest} onChange={setBequest} prefix="$" hint="Amount left by will, usually to people who are not heirs." />
          </div>
          <div className="panel mt-5 flex flex-wrap items-baseline justify-between gap-2" aria-live="polite">
            <span className="text-text-2 text-[15px]">Net estate to divide</span>
            <span className="num text-[20px] font-semibold text-text">{formatUSD(estateValue)}</span>
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
          <h2 ref={headingRef} tabIndex={-1} id="inh-madhab-h" className="text-[21px] sm:text-[23px] font-[650] mb-1 outline-none">
            Step 3: Choose a school of law (madhab)
          </h2>
          <p className="text-text-2 text-[15px] mb-3">
            Different schools have minor variations in some complex cases. Choose the one you wish to follow.
          </p>
          <a href="/find-your-school" className="lnk text-[15px] inline-flex items-center min-h-[44px] mb-3">
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
          <h2 ref={headingRef} tabIndex={-1} className="text-[21px] sm:text-[23px] font-[650] mb-4 outline-none">
            Results
          </h2>
          <div aria-live="polite" className="space-y-6">
            <div>
              <h3 className="text-[17px] font-semibold mb-3">
                Estate distribution <span className="text-text-2 font-normal">of <span className="num">{formatUSD(resultEstate)}</span></span>
              </h3>
              {result.shares.length === 0 && result.baytAlMalAmount === resultEstate ? (
                <div className="callout callout-success">
                  <p className="font-semibold text-text text-[17px]">
                    100% to Bayt al-Māl <span lang="ar" dir="rtl" className="ar font-normal">(بيت المال)</span>
                  </p>
                </div>
              ) : (
                <SharesDonut data={buildPieData(result, resultEstate)} />
              )}
            </div>

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
                  <span className="ms-2 text-sm font-normal text-text-2 num">({formatPercent((result.unresolvedAmount ?? 0) / resultEstate)})</span>
                </p>
                <p className="text-text-2">{result.unresolvedExplanation}</p>
              </div>
            )}

            {baytAmount > 0 && (
              <div className="callout callout-success space-y-4">
                <div>
                  <p className="font-semibold text-text text-[17px] flex flex-wrap items-baseline gap-2">
                    <span lang="ar" dir="rtl" className="ar text-[19px] font-normal">بيت المال</span>
                    Bayt al-Māl (public treasury)
                  </p>
                  <p className="mt-1 text-text-2">{tidyDash(result.baytAlMalExplanation ?? "")}</p>
                  <p className="font-semibold text-text mt-2">
                    Amount: <span className="num">{formatUSD(baytAmount)}</span>
                    <span className="ms-2 text-sm font-normal text-text-2 num">({formatPercent(baytAmount / resultEstate)})</span>
                  </p>
                </div>
                <div className="border-t border-success-border pt-4">
                  <p className="font-semibold text-text mb-2">In countries without a Bayt al-Māl</p>
                  <p className="text-sm text-text-2 mb-3">
                    Most Western nations do not have an Islamic public treasury. Scholars have outlined the following options
                    for handling this portion:
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-md bg-surface p-3 border border-success-border">
                      <p className="font-semibold text-text">1. Direct to Islamic charitable causes (majority scholarly position)</p>
                      <p className="mt-1 text-text-2">
                        Mosques, Islamic schools, Muslim welfare organizations, and community institutions serve a similar
                        function to Bayt al-Māl. This is the position of the Fiqh Council of North America and the European
                        Council for Fatwa and Research.
                      </p>
                    </div>
                    {hasSpouseShare && (
                      <div className="rounded-md bg-surface p-3 border border-success-border">
                        <p className="font-semibold text-text">2. Return it to the spouse (view of some later Ḥanafī scholars)</p>
                        <p className="mt-1 text-text-2">
                          Some later Ḥanafī scholars held that when no Bayt al-Māl exists, the remainder may return to the
                          spouse. A report from ʿUthmān ibn ʿAffān is sometimes cited for it. The calculator does not apply
                          this view; it is shown so you can discuss it with a scholar.
                        </p>
                      </div>
                    )}
                    <div className="rounded-md bg-surface p-3 border border-warning-border">
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
                <h3 className="text-[17px] font-semibold mb-3">Heir shares</h3>
                <div className="table-wrap" tabIndex={0} role="region" aria-label="Scrollable table">
                  <table className="table">
                    <caption className="sr-only">Share and amount for each heir</caption>
                    <thead>
                      <tr>
                        <th scope="col">Heir</th>
                        <th scope="col" className="num">Share</th>
                        <th scope="col" className="num">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* calculate.ts can emit a 0 share for a residuary partner the user never selected (e.g. "Daughter 0" next to a son); hide only those rows. */}
                      {result.shares.filter((s) => (s.share ?? 0) > 0 || !!heirs[s.heir]).map((s) => (
                        <tr key={s.heir}>
                          <td>
                            <span className="font-semibold text-text">
                              {heirLabel(s.heir, s.label)} {s.count > 1 ? `(×${s.count})` : ""}
                            </span>
                            <span className="block text-[13.5px] text-text-2 mt-0.5 leading-snug">{tidyDash(s.reason)}</span>
                          </td>
                          <td className="num whitespace-nowrap">
                            <span className="block text-text font-semibold">{numberToFraction(s.share ?? 0)}</span>
                            <span className="block text-[12.5px] text-text-2">{formatPercent(s.share ?? 0)}</span>
                          </td>
                          <td className="num whitespace-nowrap font-semibold text-text">{formatUSD(s.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {result.blocked.length > 0 && (
              <div>
                <h3 className="text-[17px] font-semibold mb-3">Blocked heirs</h3>
                <ul className="list-none p-0 m-0 divide-y divide-border border border-border rounded-[10px]">
                  {result.blocked.map((b) => (
                    <li key={b.heir} className="px-4 py-3">
                      <p className="text-text">
                        <span className="font-semibold">{heirLabel(b.heir, b.label)}</span> was blocked.
                      </p>
                      <p className="text-sm text-text-2">Reason: {tidyDash(b.reason)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.notes.length > 0 && (
              <div className="panel">
                <p className="eyebrow mb-2">Notes</p>
                <ul className="m-0 ps-5 space-y-1 text-[14.5px] text-text-2">
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

      <div className="flex flex-wrap justify-between gap-3 mt-8 pt-5 border-t border-border">
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
  );
}

function CountStepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        className="btn btn-ghost !px-0 w-11"
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
        className="!w-20 text-center"
      />
      <button
        type="button"
        className="btn btn-ghost !px-0 w-11"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
