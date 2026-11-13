"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TOOLS } from "@/lib/site";
import {
  QUESTIONS,
  determineSchool,
  nextQuestionIndex,
  type Answer,
  type SchoolResult,
} from "@/lib/school-finder";

const CONFIDENCE: Record<SchoolResult["confidence"], { label: string; chip: string }> = {
  high: { label: "High confidence", chip: "chip-green" },
  medium: { label: "Medium confidence", chip: "chip-amber" },
  low: { label: "Low confidence", chip: "" },
};

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={back ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180"}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function SchoolFinder() {
  const [currentQ, setCurrentQ] = useState(0);
  // Questions visited before the current one, so "Back" returns to the
  // question you actually saw (the Shia path skips some questions).
  const [history, setHistory] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<SchoolResult | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const hasInteracted = useRef(false);

  // Move focus to the new step heading after each step change (not on first load).
  useEffect(() => {
    if (!hasInteracted.current) return;
    if (result) resultRef.current?.focus();
    else headingRef.current?.focus();
  }, [currentQ, result]);

  const question = QUESTIONS[currentQ];
  const headingId = `sf-q-${question.id}`;

  const handleAnswer = (value: string) => {
    hasInteracted.current = true;
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    const next = nextQuestionIndex(currentQ, question.id, value);
    if (next === null) {
      setResult(determineSchool(newAnswers));
    } else {
      setHistory((h) => [...h, currentQ]);
      setCurrentQ(next);
    }
  };

  const goBack = () => {
    hasInteracted.current = true;
    if (history.length === 0) return;
    setCurrentQ(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };

  const reset = () => {
    hasInteracted.current = true;
    setCurrentQ(0);
    setHistory([]);
    setAnswers({});
    setResult(null);
  };

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  return (
    <div className="hue-neutral card p-5 sm:p-9">
      {!result && (
          <div key={question.id} className="fade-in">
            <div className="mb-6">
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Quiz progress"
                aria-valuemin={1}
                aria-valuemax={QUESTIONS.length}
                aria-valuenow={currentQ + 1}
              >
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-[16px] text-text-2 ui">
                Question <span className="num">{currentQ + 1}</span> of <span className="num">{QUESTIONS.length}</span>
              </p>
            </div>

            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="text-[28px] sm:text-[34px] font-bold leading-tight outline-none"
            >
              {question.question}
            </h2>
            {question.subtitle && <p className="mt-3 text-[18.5px] text-text-2 leading-relaxed">{question.subtitle}</p>}

            <div role="group" aria-labelledby={headingId} className="mt-6 grid gap-3">
              {question.options.map((opt) => {
                const selected = answers[question.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className="option min-h-[44px]"
                    aria-pressed={selected}
                    onClick={() => handleAnswer(opt.value)}
                  >
                    <span className="option-radio" aria-hidden="true" />
                    <span>
                      <span className="block font-bold text-[17.5px] text-text">{opt.label}</span>
                      {opt.detail && <span className="block mt-1 text-[16px] text-text-2 leading-snug">{opt.detail}</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 min-h-[44px]">
              {history.length > 0 && (
                <button type="button" onClick={goBack} className="btn btn-ghost">
                  <Arrow back />
                  Back
                </button>
              )}
            </div>
          </div>
      )}
      <div aria-live="polite">
        {result && (
          <div className="fade-in">
            <p className="eyebrow">Your likely school</p>
            <h2
              ref={resultRef}
              tabIndex={-1}
              className="mt-2 text-[34px] sm:text-[44px] font-bold leading-tight flex flex-wrap items-baseline gap-x-4 outline-none"
            >
              <span>{result.school}</span>
              {result.schoolAr && (
                <span lang="ar" dir="rtl" className="ar text-[32px] sm:text-[40px] font-normal text-indigo-text">
                  {result.schoolAr}
                </span>
              )}
            </h2>
            <p className="mt-3">
              <span className={`chip ${CONFIDENCE[result.confidence].chip}`}>{CONFIDENCE[result.confidence].label}</span>
            </p>

            <p className="mt-5 text-[18.5px] text-text-2 leading-relaxed max-w-[65ch]">{result.explanation}</p>

            <div className="callout callout-info mt-6">
              <p className="text-text-2 leading-relaxed">
                <strong className="text-text">Important:</strong> This tool gives a best guess based on common patterns.
                The most reliable way to know your school is to <strong className="text-text">ask your family</strong> or{" "}
                <strong className="text-text">your local imam or scholar</strong>. Many Muslims also follow scholarly
                opinions across multiple schools. That&apos;s perfectly valid too.
              </p>
            </div>

            <h3 className="mt-10 text-[24px] font-bold">Now try our calculators</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 list-none p-0 m-0">
              {TOOLS.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className={`card card-link hue-${t.hue} flex items-center gap-3 px-5 py-4 min-h-[56px] font-bold text-[18px] text-text`}
                  >
                    <span className="hue-star" aria-hidden="true" />
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <button type="button" onClick={reset} className="btn btn-ghost">
                <Arrow back />
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
