import { describe, it, expect } from "vitest";
import { getKaffarahRuling, estimateFeedingCost, hasFeedingOption } from "@/lib/kaffarah/rulings";
import {
  getKaffarahRuling as origGetKaffarahRuling,
  estimateFeedingCost as origEstimateFeedingCost,
} from "./reference/original/lib/kaffarah/rulings";
import type { KaffarahType, Madhab, KaffarahRuling } from "./reference/original/lib/kaffarah/types";
import { kaffarahTotalCost, kaffarahTotalText, kaffarahBreakdownText, kaffarahEstimateLabel } from "@/lib/kaffarah/calculate";

// ---------------------------------------------------------------------------
// VERBATIM COPY of the original inline JSX arithmetic, from
// tests/reference/original/pages/kaffarah.page.tsx.txt, lines 232-239:
//   232: Estimated Cost (feeding option{instances > 1 ? ` × ${instances}` : ""})
//   235: ${(feedingEstimate.totalCost * instances).toFixed(2)}
//   238: {feedingEstimate.people} people × ${costPerMeal}/meal
//   239: {instances > 1 ? ` × ${instances} instances` : ""}
// JSX text concatenation is reproduced with template literals (no whitespace is
// inserted between line 238 and 239 because JSX drops newline-only whitespace).
// ---------------------------------------------------------------------------
function originalJsx(feedingEstimate: { people: number; totalCost: number }, costPerMeal: number, instances: number) {
  return {
    total: feedingEstimate.totalCost * instances,
    label: "Estimated Cost (feeding option" + (instances > 1 ? ` × ${instances}` : "") + ")",
    totalText: "$" + (feedingEstimate.totalCost * instances).toFixed(2),
    breakdown: `${feedingEstimate.people}` + " people × $" + `${costPerMeal}` + "/meal" + (instances > 1 ? ` × ${instances} instances` : ""),
  };
}
// ---------------------------------------------------------------------------

const MADHABS: Madhab[] = ["hanafi", "maliki", "shafii", "hanbali", "jafari"];
const TYPES: KaffarahType[] = ["broken_fast", "broken_oath", "zihar", "accidental_killing"];

/**
 * Another agent may remove em dashes / fix typos in rulings.ts strings. Text is compared
 * after dropping punctuation and case, so a punctuation-only edit passes but any change
 * in words fails. All structural fields are compared exactly.
 */
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
function structural(r: KaffarahRuling) {
  return {
    type: r.type,
    madhab: r.madhab,
    isSequential: r.isSequential,
    options: r.options.map((o) => ({ order: o.order, action: o.action, isFallback: o.isFallback, detail: norm(o.detail) })),
    notes: r.notes.map(norm),
  };
}

// Corrected in November 2026 (sources in the commit messages):
// - accidental killing, Sunni schools: no feeding option, so no feeding cost;
// - broken oath, Jaʿfarī: Sistani ruling 2687 requires the 3 days to be consecutive.
const NO_FEEDING = (t: KaffarahType, m: Madhab) => t === "accidental_killing" && m !== "jafari";
// - broken fast, Maliki and Hanbali: the unsourced "or cash" feeding option was removed,
//   and the Hanbali amount now reads a mudd of wheat or half a sa' of other food.
const RULING_CHANGED = (t: KaffarahType, m: Madhab) =>
  NO_FEEDING(t, m) || (t === "broken_oath" && m === "jafari") || (t === "broken_fast" && (m === "maliki" || m === "hanbali"));

describe("Kaffārah: rulings.ts equals the frozen original for every type × school", () => {
  for (const t of TYPES) {
    for (const m of MADHABS) {
      it(`getKaffarahRuling(${t}, ${m})${RULING_CHANGED(t, m) ? " (corrected)" : ""}`, () => {
        const now = structural(getKaffarahRuling(t, m));
        const orig = structural(origGetKaffarahRuling(t, m));
        if (RULING_CHANGED(t, m)) {
          expect(now.options.map((o) => o.action)).toEqual(orig.options.map((o) => o.action));
          expect(now.isSequential).toBe(orig.isSequential);
          expect(now).not.toStrictEqual(orig);
        } else {
          expect(now).toStrictEqual(orig);
        }
      });
      it.each([0, 1, 7.5, 10, 12.345])(`estimateFeedingCost(${t}, ${m}, %d)`, (cost) => {
        if (NO_FEEDING(t, m)) expect(estimateFeedingCost(t, m, cost)).toStrictEqual({ people: 0, totalCost: 0 });
        else expect(estimateFeedingCost(t, m, cost)).toStrictEqual(origEstimateFeedingCost(t, m, cost));
      });
    }
  }
});

describe("Kaffārah corrections", () => {
  it("accidental killing: no feeding option in the four Sunni schools, feeding last in Jaʿfarī", () => {
    for (const m of ["hanafi", "maliki", "shafii", "hanbali"] as Madhab[]) {
      expect(hasFeedingOption("accidental_killing", m)).toBe(false);
      expect(getKaffarahRuling("accidental_killing", m).options.some((o) => /feed/i.test(o.action))).toBe(false);
    }
    expect(hasFeedingOption("accidental_killing", "jafari")).toBe(true);
    expect(estimateFeedingCost("accidental_killing", "jafari", 10)).toStrictEqual({ people: 60, totalCost: 600 });
    for (const t of ["broken_fast", "broken_oath", "zihar"] as KaffarahType[]) for (const m of MADHABS) expect(hasFeedingOption(t, m)).toBe(true);
  });
  it("broken oath, Jaʿfarī: the three fasting days must be consecutive (Sistani 2687)", () => {
    const r = getKaffarahRuling("broken_oath", "jafari");
    expect(r.options.find((o) => o.action === "Fast 3 days")!.detail).toBe("Must be 3 consecutive days.");
    expect(r.notes.join(" ")).toMatch(/2687/);
    // Mālikī and Shāfiʿī unchanged: consecutive not required (Islamweb fatwa 114168)
    expect(getKaffarahRuling("broken_oath", "maliki").options[3].detail).toMatch(/not required/);
  });
});

// [type, madhab, costPerMeal, instances]
type Row = [KaffarahType, Madhab, number, number];
const TABLE: Row[] = [
  ["broken_fast", "hanafi", 10, 1], // defaults
  ["broken_fast", "maliki", 10, 2],
  ["broken_fast", "shafii", 12.5, 3],
  ["broken_fast", "hanbali", 0, 1], // zero cost
  ["broken_fast", "jafari", 7.25, 0], // zero instances
  ["broken_oath", "hanafi", 10, 1],
  ["broken_oath", "shafii", 15, 4],
  ["broken_oath", "jafari", 0.1 + 0.2, 1], // float artefact
  ["zihar", "hanbali", 10, 1],
  ["zihar", "maliki", 9.99, 2],
  ["accidental_killing", "hanafi", 10, 1],
  ["accidental_killing", "jafari", 11, 5],
  ["broken_fast", "hanafi", 10, 1.5], // fractional instances (input allows decimals)
  ["broken_oath", "maliki", 3.333, 2],
];

describe("Kaffārah: extracted display arithmetic equals the original JSX", () => {
  it.each(TABLE)("%s %s meal=%d instances=%d", (type, madhab, cost, instances) => {
    const est = estimateFeedingCost(type, madhab, cost);
    // Where there is no feeding option the UI shows no cost; the formatter is
    // still the original one, applied to the corrected zero estimate.
    const orig = originalJsx(NO_FEEDING(type, madhab) ? { people: 0, totalCost: 0 } : origEstimateFeedingCost(type, madhab, cost), cost, instances);
    expect(kaffarahTotalCost(est, instances)).toBe(orig.total);
    expect(kaffarahEstimateLabel(instances)).toBe(orig.label);
    expect(kaffarahTotalText(est, instances)).toBe(orig.totalText);
    expect(kaffarahBreakdownText(est, cost, instances)).toBe(orig.breakdown);
  });
});

describe("Kaffārah: hand-verified worked examples", () => {
  it("broken oath, $10 per meal, 1 oath", () => {
    // 10 people × $10 = $100 ; × 1 instance = $100.00
    const est = estimateFeedingCost("broken_oath", "hanafi", 10);
    expect(est).toStrictEqual({ people: 10, totalCost: 100 });
    expect(kaffarahTotalText(est, 1)).toBe("$100.00");
    expect(kaffarahBreakdownText(est, 10, 1)).toBe("10 people × $10/meal");
    expect(kaffarahEstimateLabel(1)).toBe("Estimated Cost (feeding option)");
  });

  it("broken fast, $12.50 per meal, 3 days", () => {
    // 60 people × $12.50 = $750 ; × 3 instances = $2,250.00 (toFixed has no thousands separator)
    const est = estimateFeedingCost("broken_fast", "maliki", 12.5);
    expect(est).toStrictEqual({ people: 60, totalCost: 750 });
    expect(kaffarahTotalCost(est, 3)).toBe(2250);
    expect(kaffarahTotalText(est, 3)).toBe("$2250.00");
    expect(kaffarahBreakdownText(est, 12.5, 3)).toBe("60 people × $12.5/meal × 3 instances");
    expect(kaffarahEstimateLabel(3)).toBe("Estimated Cost (feeding option × 3)");
  });
});
