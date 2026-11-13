import { describe, it, expect } from "vitest";
import {
  QUESTIONS as NEW_QUESTIONS,
  determineSchool as newDetermineSchool,
  nextQuestionIndex,
} from "@/lib/school-finder";

// ---------------------------------------------------------------------------
// VERBATIM COPY of the original code from
// tests/reference/original/pages/find-your-school.page.tsx.txt (lines 7-229).
// Do not edit.
// ---------------------------------------------------------------------------

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

// Original page flow (handleAnswer, lines 238-262), reduced to "what happens next".
function originalNext(currentQ: number, questionId: string, value: string): number | null {
  let nextQ = currentQ + 1;
  if (questionId === "sunni_shia" && value === "shia") {
    nextQ = QUESTIONS.findIndex((q) => q.id === "turbah");
  }
  if (questionId === "turbah" && value === "yes") {
    return null; // setResult
  }
  if (nextQ >= QUESTIONS.length) {
    return null; // setResult
  } else {
    return nextQ; // setCurrentQ
  }
}
// ---------------------------------------------------------------------------
// End of verbatim copy.
// ---------------------------------------------------------------------------

/**
 * The ONLY permitted text differences between original and new copy:
 * em dashes rephrased (house style). Applied to the original text, these must
 * produce the new text exactly.
 */
const COPY_EDITS: [string, string][] = [
  ["that's OK — the next questions", "that's OK. The next questions"],
  ["the Ḥanafī school — the most widely followed", "the Ḥanafī school, the most widely followed"],
  ["across North and West Africa — Morocco", "across North and West Africa: Morocco"],
  ["the Gulf is diverse — many people", "the Gulf is diverse: many people"],
  ["teacher or community — ask them", "teacher or community. Ask them"],
  ["based on evidence — in our calculators", "based on evidence. In our calculators"],
];

/** Flag emoji are pairs of regional indicator symbols (U+1F1E6 to U+1F1FF). */
const FLAG_EMOJI = /[\u{1F1E6}-\u{1F1FF}]/gu;

function applyEdits(s: string | undefined): string | undefined {
  if (s === undefined) return s;
  let out = s;
  for (const [from, to] of COPY_EDITS) out = out.split(from).join(to);
  return out;
}

function stripFlags(s: string): string {
  return s.replace(FLAG_EMOJI, "").trim();
}

const OPTION_SETS: (string | undefined)[][] = QUESTIONS.map((q) => [undefined, ...q.options.map((o) => o.value)]);

function* allCombinations(): Generator<Record<string, Answer>> {
  const idx = new Array(QUESTIONS.length).fill(0);
  while (true) {
    const answers: Record<string, Answer> = {};
    QUESTIONS.forEach((q, i) => {
      const v = OPTION_SETS[i][idx[i]];
      if (v !== undefined) answers[q.id] = v;
    });
    yield answers;
    let k = QUESTIONS.length - 1;
    while (k >= 0) {
      idx[k]++;
      if (idx[k] < OPTION_SETS[k].length) break;
      idx[k] = 0;
      k--;
    }
    if (k < 0) return;
  }
}

describe("school finder: extracted logic equals the original", () => {
  it("every answer combination (each question answered or skipped) gives the same result", () => {
    let count = 0;
    const tally: Record<string, number> = {};
    for (const answers of allCombinations()) {
      const orig = determineSchool(answers);
      const next = newDetermineSchool(answers);
      expect(next.school).toBe(orig.school);
      expect(next.schoolAr).toBe(orig.schoolAr);
      expect(next.confidence).toBe(orig.confidence);
      expect(next.explanation).toBe(applyEdits(orig.explanation));
      expect(next.explanation).not.toContain("—");
      const key = `${orig.school} [${orig.confidence}]`;
      tally[key] = (tally[key] ?? 0) + 1;
      count++;
    }
    // 4 x 12 x 5 x 5 x 5 x 4 (each question: every option, or unanswered)
    expect(count).toBe(24000);
    // Printed for the report.
    console.log(`school-finder: ${count} combinations compared`);
    console.log(JSON.stringify(tally, null, 2));
  });

  it("questions keep the same ids, order, option values and texts (only listed edits)", () => {
    expect(NEW_QUESTIONS.length).toBe(QUESTIONS.length);
    QUESTIONS.forEach((q, i) => {
      const n = NEW_QUESTIONS[i];
      expect(n.id).toBe(q.id);
      expect(n.question).toBe(applyEdits(q.question));
      expect(n.subtitle).toBe(applyEdits(q.subtitle));
      expect(n.options.map((o) => o.value)).toEqual(q.options.map((o) => o.value));
      q.options.forEach((o, j) => {
        expect(n.options[j].label).toBe(stripFlags(applyEdits(o.label)!));
        expect(n.options[j].detail).toBe(applyEdits(o.detail));
      });
    });
    const allNewText = JSON.stringify(NEW_QUESTIONS);
    expect(allNewText).not.toContain("—");
    expect(FLAG_EMOJI.test(allNewText)).toBe(false);
  });

  it("every copy edit is actually used (no stale entries)", () => {
    const corpus = JSON.stringify(QUESTIONS) + Array.from(allCombinations(), (a) => determineSchool(a).explanation).join("\n");
    for (const [from] of COPY_EDITS) expect(corpus).toContain(from);
  });

  it("question flow (next question / show result) matches the original for every question and answer", () => {
    QUESTIONS.forEach((q, i) => {
      for (const o of q.options) {
        expect(nextQuestionIndex(i, q.id, o.value)).toBe(originalNext(i, q.id, o.value));
      }
    });
  });
});
