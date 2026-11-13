import { describe, it, expect } from "vitest";
import { calculateFitr } from "@/lib/zakat-fitr/calculate";
import { FITR_AMOUNTS } from "@/lib/zakat-fitr/types";
import { FITR_AMOUNTS as ORIG_FITR_AMOUNTS, type Madhab } from "./reference/original/lib/zakat-fitr/types";

// ---------------------------------------------------------------------------
// VERBATIM COPY of the original inline calculation, from
// tests/reference/original/pages/zakat-fitr.page.tsx.txt, lines 38-60
// (the totalPeople / fitrInfo derivations on lines 38-39 and the useMemo body on lines 41-60).
// Only the React closure was replaced by explicit parameters. Do not edit.
// ---------------------------------------------------------------------------
function originalFitr(
  madhab: Madhab,
  adults: number,
  children: number,
  otherDependents: number,
  useWeight: boolean,
  pricePerKg: number,
  costPerPerson: number,
) {
  const totalPeople = adults + children + otherDependents;
  const fitrInfo = ORIG_FITR_AMOUNTS[madhab];
  return (() => {
    if (totalPeople <= 0) return null;
    let perPerson: number;
    let method: string;

    if (useWeight) {
      perPerson = fitrInfo.weightKg * pricePerKg;
      method = `${fitrInfo.weightKg} kg × $${pricePerKg}/kg = $${perPerson.toFixed(2)}/person`;
    } else {
      perPerson = costPerPerson;
      method = `$${costPerPerson.toFixed(2)} per person (local equivalent)`;
    }

    return {
      perPerson,
      total: perPerson * totalPeople,
      totalPeople,
      method,
    };
  })();
}
// ---------------------------------------------------------------------------

function newFitr(
  madhab: Madhab,
  adults: number,
  children: number,
  otherDependents: number,
  useWeight: boolean,
  pricePerKg: number,
  costPerPerson: number,
) {
  // Same derivation the new client component uses.
  const totalPeople = adults + children + otherDependents;
  return calculateFitr({ fitrInfo: FITR_AMOUNTS[madhab], totalPeople, useWeight, pricePerKg, costPerPerson });
}

const MADHABS: Madhab[] = ["hanafi", "maliki", "shafii", "hanbali", "jafari"];

// [madhab, adults, children, otherDependents, useWeight, pricePerKg, costPerPerson]
type Row = [Madhab, number, number, number, boolean, number, number];
const TABLE: Row[] = [
  ["hanafi", 1, 0, 0, false, 2, 12], // defaults
  ["hanafi", 1, 0, 0, true, 2, 12],
  ["maliki", 2, 3, 0, true, 2, 12],
  ["shafii", 2, 3, 1, true, 1.75, 12],
  ["hanbali", 4, 0, 2, true, 3.333, 0],
  ["jafari", 2, 2, 2, true, 2.5, 12],
  ["jafari", 1, 0, 0, false, 0, 15.5],
  ["maliki", 0, 0, 0, true, 2, 12], // zero people -> null
  ["shafii", 0, 1, 0, false, 2, 0], // 1 person, zero cost
  ["hanbali", 3, 0, 0, false, 2, 10.005], // rounding boundary in toFixed
  ["hanafi", 10, 12, 3, true, 0.01, 12], // large household, tiny price
  ["jafari", 1, 0, 0, true, 0, 12], // zero price
  ["hanafi", 2, 5, 0, false, 2, 0.1 + 0.2], // float artefact in input
  ...MADHABS.flatMap((m): Row[] => [
    [m, 1, 1, 1, true, 1, 1],
    [m, 1, 1, 1, false, 1, 1],
  ]),
];

describe("Zakat al-Fiṭr: calculateFitr equals the original inline useMemo", () => {
  it("lib data FITR_AMOUNTS is unchanged in the fields the calculation uses", () => {
    for (const m of MADHABS) {
      expect(FITR_AMOUNTS[m].weightKg).toBe(ORIG_FITR_AMOUNTS[m].weightKg);
      expect(FITR_AMOUNTS[m].cashPermitted).toBe(ORIG_FITR_AMOUNTS[m].cashPermitted);
    }
  });

  it.each(TABLE)("%s adults=%d children=%d other=%d weight=%s price/kg=%d cost=%d", (...row) => {
    expect(newFitr(...row)).toStrictEqual(originalFitr(...row));
  });
});

describe("Zakat al-Fiṭr: hand-verified worked examples", () => {
  it("Ḥanafī, food weight, 2 adults + 3 children, $2/kg", () => {
    // Ḥanafī weightKg = 1.6 (FITR_AMOUNTS.hanafi).
    // per person = 1.6 kg × $2 = $3.20
    // total      = $3.20 × 5 people = $16.00
    const r = newFitr("hanafi", 2, 3, 0, true, 2, 12)!;
    expect(r.perPerson).toBeCloseTo(3.2, 10);
    expect(r.total).toBeCloseTo(16, 10);
    expect(r.totalPeople).toBe(5);
    expect(r.method).toBe("1.6 kg × $2/kg = $3.20/person");
  });

  it("Jaʿfarī, food weight, 4 people, $2.50/kg; and cash mode $12 for 5 people", () => {
    // Jaʿfarī weightKg = 3.0, printed by JS as "3".
    // per person = 3 kg × $2.50 = $7.50
    // total      = $7.50 × 4 = $30.00
    const w = newFitr("jafari", 2, 2, 0, true, 2.5, 12)!;
    expect(w.perPerson).toBe(7.5);
    expect(w.total).toBe(30);
    expect(w.method).toBe("3 kg × $2.5/kg = $7.50/person");

    // Cash mode ignores the school's weight: $12 × 5 people = $60.00
    const c = newFitr("maliki", 2, 3, 0, false, 2, 12)!;
    expect(c.perPerson).toBe(12);
    expect(c.total).toBe(60);
    expect(c.method).toBe("$12.00 per person (local equivalent)");
  });
});

describe("Zakat al-Fiṭr: school differences stated, not claimed as agreement (corrected November 2026)", () => {
  it("eligibility and the wife's fiṭr are attributed per school", async () => {
    const info = await import("@/lib/zakat-fitr/scholarly-info");
    const overview = info.FITR_OVERVIEW_INFO.positions;
    expect(overview.some((p) => /All Schools/.test(p.school))).toBe(false);
    expect(overview.find((p) => p.school === "Ḥanafī School")!.position).toMatch(/niṣāb/);
    const who = info.FITR_WHO_INFO.positions;
    expect(who.find((p) => p.school === "Ḥanafī School")!.position).toMatch(/not obliged to pay for his wife/);
    expect(who.some((p) => p.school === "All Schools (agreed)")).toBe(false);
  });
});
