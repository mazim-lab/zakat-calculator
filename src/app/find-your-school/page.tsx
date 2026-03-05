"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type SchoolResult = {
  school: string;
  schoolAr: string;
  confidence: "high" | "medium" | "low";
  explanation: string;
};

type Answer = string | null;

interface Question {
  id: string;
  question: string;
  subtitle?: string;
  options: { value: string; label: string; detail?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "sunni_shia",
    question: "Are you Sunni or Shia?",
    subtitle: "If you're not sure, that's OK — the next questions will help narrow it down.",
    options: [
      { value: "sunni", label: "Sunni", detail: "The majority of Muslims worldwide (~85-90%)" },
      { value: "shia", label: "Shia (Twelver)", detail: "Predominantly in Iran, Iraq, Lebanon, Bahrain, parts of Pakistan/India" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "region",
    question: "Where are you (or your family) originally from?",
    subtitle: "Schools of thought are strongly tied to geography. This is often the best indicator.",
    options: [
      { value: "south_asia", label: "🇵🇰🇮🇳🇧🇩 South Asia", detail: "Pakistan, India, Bangladesh, Afghanistan, Sri Lanka" },
      { value: "turkey_central", label: "🇹🇷 Turkey & Central Asia", detail: "Turkey, Uzbekistan, Kazakhstan, Turkmenistan, Tajikistan, Balkans, Albania" },
      { value: "southeast_asia", label: "🇮🇩🇲🇾 Southeast Asia", detail: "Indonesia, Malaysia, Brunei, Singapore, Thailand, Philippines" },
      { value: "egypt", label: "🇪🇬 Egypt" },
      { value: "north_africa", label: "🇲🇦🇩🇿🇹🇳🇱🇾 North & West Africa", detail: "Morocco, Algeria, Tunisia, Libya, Mauritania, Mali, Senegal, Nigeria" },
      { value: "east_africa", label: "🇸🇴🇰🇪🇹🇿 East Africa", detail: "Somalia, Kenya, Tanzania, Ethiopia, Eritrea, Djibouti" },
      { value: "gulf", label: "🇸🇦🇶🇦🇦🇪 Arabian Peninsula & Gulf", detail: "Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman, Yemen" },
      { value: "levant_iraq", label: "🇸🇾🇯🇴🇮🇶 Levant & Iraq", detail: "Syria, Jordan, Palestine, Lebanon, Iraq" },
      { value: "iran", label: "🇮🇷 Iran" },
      { value: "western", label: "🇺🇸🇬🇧🇨🇦 Western country (convert or diaspora)", detail: "USA, Canada, UK, Europe, Australia" },
      { value: "other", label: "Other / Not listed" },
    ],
  },
  {
    id: "prayer_arms",
    question: "During prayer (ṣalāh), where do you place your hands?",
    subtitle: "This is one of the most visible differences between schools in daily practice.",
    options: [
      { value: "folded_chest", label: "Folded on chest", detail: "Right hand over left, placed on the upper chest" },
      { value: "folded_navel", label: "Folded below navel", detail: "Right hand over left, placed below the navel or on the stomach" },
      { value: "sides", label: "Hanging at the sides", detail: "Arms straight down, not folded at all" },
      { value: "unsure", label: "I'm not sure / I don't pray regularly" },
    ],
  },
  {
    id: "ameen",
    question: "After the imam recites Sūrat al-Fātiḥah, how do you say 'Āmīn'?",
    options: [
      { value: "loud", label: "Out loud (Āmīn!)", detail: "Said audibly after the imam finishes al-Fātiḥah" },
      { value: "silent", label: "Silently / under breath", detail: "Said quietly to yourself" },
      { value: "not_said", label: "I don't say it / Not applicable" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "prayer_combine",
    question: "Do you combine Ẓuhr+ʿAṣr and Maghrib+ʿIshāʾ prayers?",
    subtitle: "Some schools allow combining certain prayers even when not traveling.",
    options: [
      { value: "always", label: "Yes, I regularly combine them", detail: "Pray 3 times a day instead of 5 (combining midday and evening prayers)" },
      { value: "travel_only", label: "Only when traveling or with valid excuse" },
      { value: "never", label: "No, I always pray them separately (5 times)" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "turbah",
    question: "Do you prostrate (sujūd) on a small clay tablet (turbah)?",
    subtitle: "A turbah is a small, flat piece of clay or earth placed on the prayer mat.",
    options: [
      { value: "yes", label: "Yes, I use a turbah", detail: "A clay tablet, usually from Karbala" },
      { value: "no", label: "No, I prostrate directly on the carpet/mat" },
      { value: "unsure", label: "I'm not sure what that is" },
    ],
  },
];

function determineSchool(answers: Record<string, Answer>): SchoolResult {
  // Strong Shia indicators
  if (
    answers.sunni_shia === "shia" ||
    answers.turbah === "yes" ||
    answers.prayer_combine === "always" ||
    answers.prayer_arms === "sides" && answers.region === "iran"
  ) {
    return {
      school: "Jaʿfarī",
      schoolAr: "جعفري",
      confidence: answers.sunni_shia === "shia" ? "high" : "medium",
      explanation:
        "Based on your answers, you most likely follow the Jaʿfarī (Twelver Shia) school. This is the primary school of Shia Islam, predominant in Iran, Iraq, Lebanon, and Bahrain. Key indicators: prostrating on a turbah, combining prayers regularly, and/or arms at sides during prayer.",
    };
  }

  // Region-based for Sunni
  const region = answers.region;

  // Hanafi indicators
  if (
    region === "south_asia" ||
    region === "turkey_central" ||
    region === "egypt" ||
    answers.prayer_arms === "folded_navel"
  ) {
    // Egypt is mixed (Shafi'i historically but Hanafi state school)
    if (region === "egypt") {
      return {
        school: "Ḥanafī (or Shāfiʿī)",
        schoolAr: "حنفي / شافعي",
        confidence: "medium",
        explanation:
          "Egypt has a strong tradition of both Ḥanafī and Shāfiʿī scholarship. The official state school is Ḥanafī (Al-Azhar teaches all four), but many Egyptians follow Shāfiʿī practices in daily worship. If you fold your hands below the navel, you likely lean Ḥanafī. If on the chest, likely Shāfiʿī. Ask your family or local imam to be sure.",
      };
    }
    return {
      school: "Ḥanafī",
      schoolAr: "حنفي",
      confidence: region === "south_asia" || region === "turkey_central" ? "high" : "medium",
      explanation:
        "Based on your region and practices, you most likely follow the Ḥanafī school — the most widely followed school globally. It is predominant in South Asia (Pakistan, India, Bangladesh), Turkey, Central Asia, and parts of the Arab world. Key indicator: folding hands below the navel during prayer.",
    };
  }

  // Shafi'i indicators
  if (
    region === "southeast_asia" ||
    region === "east_africa" ||
    (answers.prayer_arms === "folded_chest" && answers.ameen === "loud")
  ) {
    return {
      school: "Shāfiʿī",
      schoolAr: "شافعي",
      confidence: region === "southeast_asia" || region === "east_africa" ? "high" : "medium",
      explanation:
        "Based on your region and practices, you most likely follow the Shāfiʿī school. It is predominant in Southeast Asia (Indonesia, Malaysia), East Africa (Somalia, Kenya, Tanzania), Egypt (alongside Ḥanafī), Yemen, and parts of the Gulf. Key indicators: hands folded on the chest and saying Āmīn out loud.",
    };
  }

  // Maliki indicators
  if (region === "north_africa") {
    return {
      school: "Mālikī",
      schoolAr: "مالكي",
      confidence: "high",
      explanation:
        "Based on your region, you most likely follow the Mālikī school. It is the dominant school across North and West Africa — Morocco, Algeria, Tunisia, Libya, Mauritania, Mali, Senegal, and Nigeria. Key indicator: some Mālikī practitioners pray with arms hanging at their sides (though many fold them too).",
    };
  }

  // Hanbali indicators
  if (region === "gulf") {
    return {
      school: "Ḥanbalī",
      schoolAr: "حنبلي",
      confidence: "medium",
      explanation:
        "Based on your region, you may follow the Ḥanbalī school, which is predominant in Saudi Arabia and Qatar. However, the Gulf is diverse — many people in UAE, Kuwait, and Bahrain follow the Mālikī or Shāfiʿī schools, and Bahrain has a significant Jaʿfarī population. If you're Saudi, Ḥanbalī is most likely. Ask your family or imam to confirm.",
    };
  }

  // Levant/Iraq
  if (region === "levant_iraq") {
    if (answers.turbah === "yes" || answers.prayer_combine === "always") {
      return {
        school: "Jaʿfarī",
        schoolAr: "جعفري",
        confidence: "medium",
        explanation:
          "Iraq and Lebanon have large Shia (Jaʿfarī) populations. Based on your practices, you likely follow the Jaʿfarī school.",
      };
    }
    return {
      school: "Ḥanafī (or Shāfiʿī)",
      schoolAr: "حنفي / شافعي",
      confidence: "medium",
      explanation:
        "The Levant (Syria, Jordan, Palestine) and Iraq have a mix of Ḥanafī and Shāfiʿī Sunni Muslims, plus significant Jaʿfarī Shia populations in Iraq and Lebanon. Your specific school depends on your family tradition. Ask your family or local imam.",
    };
  }

  // Western convert/diaspora
  if (region === "western") {
    return {
      school: "Varies",
      schoolAr: "",
      confidence: "low",
      explanation:
        "In Western countries, Muslims come from diverse backgrounds and may follow any school. If you're a convert, you likely learned from a specific teacher or community — ask them which school they follow. If your family is from a specific country, use that country's predominant school. Many Western Muslims also follow a 'non-madhab' approach, taking from all schools based on evidence — in our calculators, the Ḥanafī or Shāfiʿī defaults are a reasonable starting point.",
    };
  }

  // Iran
  if (region === "iran") {
    return {
      school: "Jaʿfarī",
      schoolAr: "جعفري",
      confidence: "high",
      explanation:
        "Iran is predominantly Jaʿfarī (Twelver Shia). This is almost certainly your school if your family is from Iran.",
    };
  }

  // Fallback
  return {
    school: "Unable to determine",
    schoolAr: "",
    confidence: "low",
    explanation:
      "Based on your answers, we couldn't confidently determine your school. The best way to find out is to ask your family, your local imam, or the community where you learned to pray. You can also select 'Ḥanafī' as a common default, or try different schools in our calculators to see which rulings match what you were taught.",
  };
}

export default function FindYourSchool() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<SchoolResult | null>(null);

  const question = QUESTIONS[currentQ];

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    // Skip irrelevant questions
    let nextQ = currentQ + 1;

    // If they said Shia, skip prayer-specific Sunni questions and go to turbah
    if (question.id === "sunni_shia" && value === "shia") {
      // Jump to turbah question (last one) to confirm, then show result
      nextQ = QUESTIONS.findIndex((q) => q.id === "turbah");
    }

    // If they use turbah, we know it's Ja'fari — show result
    if (question.id === "turbah" && value === "yes") {
      setResult(determineSchool(newAnswers));
      return;
    }

    if (nextQ >= QUESTIONS.length) {
      setResult(determineSchool(newAnswers));
    } else {
      setCurrentQ(nextQ);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="min-h-screen relative">
      <div className="arabesque-bg" />
      <div className="luminous-header absolute inset-x-0 top-0 h-64" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-['Noto_Naskh_Arabic',serif] text-2xl text-[var(--gold-dark)] mb-2">
            ما مذهبي؟
          </p>
          <h1 className="heading-display text-4xl text-[var(--ink)] mb-2">
            Find Your School of Jurisprudence
          </h1>
          <p className="text-base text-[var(--ink-light)] max-w-lg mx-auto">
            Not sure which <em>madhab</em> (school of Islamic jurisprudence) you follow?
            Answer a few questions and we&apos;ll help you figure it out.
          </p>
        </div>

        {!result ? (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[var(--ink-faint)] mt-2 text-center">
                Question {currentQ + 1} of {QUESTIONS.length}
              </p>
            </div>

            {/* Question */}
            <div className="card p-6 md:p-8 mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="heading-display text-2xl text-[var(--ink)] mb-2">
                    {question.question}
                  </h2>
                  {question.subtitle && (
                    <p className="text-sm text-[var(--ink-faint)] mb-5">{question.subtitle}</p>
                  )}
                  <div className="space-y-2">
                    {question.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className="w-full text-left p-4 rounded-2xl border-2 border-[var(--sand)] bg-[var(--cream-light)] hover:border-[var(--emerald)] hover:bg-[var(--info-bg)] transition-all cursor-pointer"
                      >
                        <p className="font-['Amiri',serif] font-bold text-base text-[var(--ink)]">
                          {opt.label}
                        </p>
                        {opt.detail && (
                          <p className="text-sm text-[var(--ink-muted)] mt-1">{opt.detail}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Back button */}
            {currentQ > 0 && (
              <button
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                className="px-6 py-3 rounded-xl font-semibold text-base bg-[var(--sand)]/50 text-[var(--ink-muted)] hover:bg-[var(--sand)] transition-all"
              >
                ← Back
              </button>
            )}
          </>
        ) : (
          /* Result */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card p-6 md:p-8 mb-6">
              <div className="text-center mb-6">
                <p className="text-sm text-[var(--ink-faint)] mb-2">Your likely school</p>
                <h2 className="heading-display text-4xl text-[var(--emerald)] mb-1">
                  {result.school}
                </h2>
                {result.schoolAr && (
                  <p className="font-['Noto_Naskh_Arabic',serif] text-xl text-[var(--gold-dark)]">
                    {result.schoolAr}
                  </p>
                )}
                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      result.confidence === "high"
                        ? "bg-[var(--emerald)]/10 text-[var(--emerald)]"
                        : result.confidence === "medium"
                        ? "bg-[var(--gold)]/20 text-[var(--gold-dark)]"
                        : "bg-[var(--sand)] text-[var(--ink-faint)]"
                    }`}
                  >
                    {result.confidence === "high"
                      ? "High confidence"
                      : result.confidence === "medium"
                      ? "Medium confidence"
                      : "Low confidence"}
                  </span>
                </div>
              </div>

              <div className="gold-line mb-6" />

              <p className="text-base text-[var(--ink-light)] leading-relaxed mb-6">
                {result.explanation}
              </p>

              <div className="info-panel mb-6">
                <p className="text-sm text-[var(--info-text)] leading-relaxed">
                  <strong>Important:</strong> This tool gives a best guess based on common patterns.
                  The most reliable way to know your school is to <strong>ask your family</strong> or{" "}
                  <strong>your local imam/scholar</strong>. Many Muslims also follow scholarly
                  opinions across multiple schools — that&apos;s perfectly valid too.
                </p>
              </div>

              <div className="gold-line mb-6" />

              <h3 className="font-['Amiri',serif] font-bold text-lg mb-3">
                Now try our calculators:
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: "/zakat", label: "Zakat", icon: "☪" },
                  { href: "/zakat-fitr", label: "Zakat al-Fiṭr", icon: "🌙" },
                  { href: "/fidya", label: "Fidya", icon: "🌾" },
                  { href: "/kaffarah", label: "Kaffārah", icon: "⚖" },
                  { href: "/inheritance", label: "Inheritance", icon: "📜" },
                ].map((calc) => (
                  <Link
                    key={calc.href}
                    href={calc.href}
                    className="p-3 rounded-xl border border-[var(--sand)] hover:border-[var(--emerald)] transition-all no-underline text-center"
                  >
                    <span className="text-2xl">{calc.icon}</span>
                    <p className="text-sm font-semibold text-[var(--ink)] mt-1">{calc.label}</p>
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl font-semibold text-base bg-[var(--sand)]/50 text-[var(--ink-muted)] hover:bg-[var(--sand)] transition-all"
            >
              ← Start Over
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
