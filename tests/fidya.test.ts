import { describe, it, expect } from "vitest";
import { calculateFidya, type FidyaFoodType } from "@/lib/fidya/calculate";
import { FIDYA_WEIGHTS } from "@/lib/fidya/types";
import { FIDYA_WEIGHTS as ORIG_FIDYA_WEIGHTS, type Madhab } from "./reference/original/lib/fidya/types";

// ---------------------------------------------------------------------------
// VERBATIM COPY of the original inline calculation, from
// tests/reference/original/pages/fidya.page.tsx.txt, lines 37-59 (useMemo body).
// Only the React closure was replaced by explicit parameters. Do not edit.
// ---------------------------------------------------------------------------
function originalFidya(
  madhab: Madhab,
  missedDays: number,
  costPerMeal: number,
  useWeight: boolean,
  pricePerKg: number,
  foodType: "wheat" | "barley" | "dates" | "raisins" | "rice",
) {
  const FIDYA_WEIGHTS = ORIG_FIDYA_WEIGHTS;
  return (() => {
    if (missedDays <= 0) return null;
    const weight = FIDYA_WEIGHTS[madhab];
    let perDay: number;
    let unitDescription: string;

    if (useWeight) {
      const kg = weight.getWeightKg(foodType);
      perDay = kg * pricePerKg;
      unitDescription = `${kg} kg of ${foodType} × $${pricePerKg}/kg`;
    } else {
      perDay = costPerMeal;
      unitDescription = `$${costPerMeal} per meal (local cost)`;
    }

    return {
      perDay,
      total: perDay * missedDays,
      missedDays,
      unitDescription,
      weightInfo: weight,
    };
  })();
}
// ---------------------------------------------------------------------------

/** Compare everything except weightInfo identity (it comes from two different module copies). */
function comparable(r: ReturnType<typeof originalFidya> | ReturnType<typeof calculateFidya>) {
  if (!r) return r;
  return {
    perDay: r.perDay,
    total: r.total,
    missedDays: r.missedDays,
    unitDescription: r.unitDescription,
    measure: r.weightInfo.measure,
    description: r.weightInfo.description,
  };
}

const MADHABS: Madhab[] = ["hanafi", "maliki", "shafii", "hanbali", "jafari"];
const FOODS: FidyaFoodType[] = ["wheat", "barley", "dates", "raisins", "rice"];

// [madhab, missedDays, costPerMeal, useWeight, pricePerKg, foodType]
type Row = [Madhab, number, number, boolean, number, FidyaFoodType];
const TABLE: Row[] = [
  ["hanafi", 0, 10, false, 2, "wheat"], // defaults (0 days -> null)
  ["hanafi", 1, 10, false, 2, "wheat"],
  ["hanafi", 30, 10, true, 2, "wheat"],
  ["hanafi", 30, 10, true, 2, "rice"],
  ["hanafi", 29, 10, true, 2.25, "dates"],
  ["maliki", 10, 10, true, 1.5, "barley"],
  ["shafii", 60, 0, true, 3, "raisins"],
  ["hanbali", 30, 10, true, 2, "wheat"],
  ["hanbali", 30, 10, true, 2, "barley"],
  ["jafari", 7, 10, true, 0.99, "rice"],
  ["jafari", 2.5, 12.75, false, 2, "wheat"], // fractional days (input allows decimals)
  ["shafii", -3, 10, false, 2, "wheat"], // negative days -> null
  ["maliki", 30, 0.1 + 0.2, false, 2, "wheat"], // float artefact in meal cost
  ["hanbali", 1, 10, true, 0, "dates"], // zero price
  // every school × every food, weight mode, plus cash mode
  ...MADHABS.flatMap((m): Row[] => [
    ...FOODS.map((f): Row => [m, 3, 10, true, 1.1, f]),
    [m, 3, 9.99, false, 1.1, "wheat"],
  ]),
];

describe("Fidya: calculateFidya equals the original inline useMemo", () => {
  it("getWeightKg is unchanged for every school × food, except the corrected Ḥanbalī half ṣāʿ", () => {
    for (const m of MADHABS) {
      for (const f of FOODS) {
        if (m === "hanbali" && f !== "wheat") {
          // Corrected November 2026: half a ṣāʿ = 2 mudd = 2 x 0.51 kg (the site's own mudd), not 1.6 kg.
          expect(FIDYA_WEIGHTS[m].getWeightKg(f)).toBeCloseTo(2 * FIDYA_WEIGHTS.maliki.getWeightKg(f), 12);
          expect(ORIG_FIDYA_WEIGHTS[m].getWeightKg(f)).toBe(1.6);
        } else {
          expect(FIDYA_WEIGHTS[m].getWeightKg(f)).toBe(ORIG_FIDYA_WEIGHTS[m].getWeightKg(f));
        }
      }
    }
  });

  it("Ḥanbalī: one mudd of wheat, two mudd of other staples (al-Mughnī; ṣāʿ = 4 mudd)", () => {
    expect(FIDYA_WEIGHTS.hanbali.getWeightKg("wheat")).toBe(0.51);
    expect(FIDYA_WEIGHTS.hanbali.getWeightKg("dates")).toBe(1.02);
    const r = calculateFidya({ madhab: "hanbali", missedDays: 30, costPerMeal: 10, useWeight: true, pricePerKg: 2, foodType: "dates" })!;
    expect(r.total).toBeCloseTo(30 * 1.02 * 2, 10); // 61.20
  });

  it.each(TABLE)("%s days=%d meal=%d weight=%s price/kg=%d food=%s", (...row) => {
    const now = comparable(calculateFidya({
      madhab: row[0],
      missedDays: row[1],
      costPerMeal: row[2],
      useWeight: row[3],
      pricePerKg: row[4],
      foodType: row[5],
    }));
    const orig = comparable(originalFidya(...row));
    if (row[0] === "hanbali" && now && orig) {
      // Ḥanbalī measure text and half-ṣāʿ weight were corrected; the formula is the original one.
      const kg = FIDYA_WEIGHTS.hanbali.getWeightKg(row[5]);
      const perDay = row[3] ? kg * row[4] : row[2];
      expect(now.perDay).toBe(perDay);
      expect(now.total).toBe(perDay * row[1]);
      expect(now.missedDays).toBe(orig.missedDays);
    } else {
      expect(now).toStrictEqual(orig);
    }
  });
});

describe("Fidya: hand-verified worked examples", () => {
  it("Ḥanafī, dates, 30 days at $2/kg", () => {
    // Ḥanafī getWeightKg("dates") = 3.2 (a full ṣāʿ for non-wheat, non-rice staples).
    // per day = 3.2 kg × $2 = $6.40
    // total   = $6.40 × 30 = $192.00
    const r = calculateFidya({ madhab: "hanafi", missedDays: 30, costPerMeal: 10, useWeight: true, pricePerKg: 2, foodType: "dates" })!;
    expect(r.perDay).toBeCloseTo(6.4, 10);
    expect(r.total).toBeCloseTo(192, 10);
    expect(r.unitDescription).toBe("3.2 kg of dates × $2/kg");
  });

  it("Mālikī wheat at $2/kg for 30 days; and meal cost $10 for 29 days", () => {
    // Mālikī getWeightKg = 0.51 (one mudd).
    // per day = 0.51 × $2 = $1.02 ; total = $1.02 × 30 = $30.60
    const w = calculateFidya({ madhab: "maliki", missedDays: 30, costPerMeal: 10, useWeight: true, pricePerKg: 2, foodType: "wheat" })!;
    expect(w.perDay).toBeCloseTo(1.02, 10);
    expect(w.total).toBeCloseTo(30.6, 10);
    expect(w.unitDescription).toBe("0.51 kg of wheat × $2/kg");

    // Meal mode: $10 × 29 days = $290.00
    const c = calculateFidya({ madhab: "jafari", missedDays: 29, costPerMeal: 10, useWeight: false, pricePerKg: 2, foodType: "wheat" })!;
    expect(c.perDay).toBe(10);
    expect(c.total).toBe(290);
    expect(c.unitDescription).toBe("$10 per meal (local cost)");
  });
});
