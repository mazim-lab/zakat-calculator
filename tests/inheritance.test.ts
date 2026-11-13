// Inheritance: equivalence with the frozen original, textbook cases, helpers.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import { calculateInheritance as calcNew } from "@/lib/inheritance/calculate";
import { calculateInheritance as calcOrig } from "./reference/original/lib/inheritance/calculate";
import type { Heirs, Madhab, CalculationResult } from "@/lib/inheritance/types";
import { gcd, numberToFraction } from "@/lib/inheritance/fraction";
import { computeNetEstate } from "@/lib/inheritance/deductions";
import { EXAMPLE_FAMILY, EXAMPLE_AWL } from "@/app/inheritance/examples";

const MADHABS: Madhab[] = ["hanafi", "maliki", "shafii", "hanbali", "jafari"];
const SUNNI: Madhab[] = ["hanafi", "maliki", "shafii", "hanbali"];

// The UI stores boolean heirs as `true` (also for husband), so scenarios use the same shape.
type RawHeirs = Record<string, number | boolean>;
const H = (h: RawHeirs) => h as unknown as Heirs;
// calculateInheritance mutates the object it receives (it deletes blocked heirs),
// so every call gets its own deep copy.
const copy = (h: RawHeirs) => H(JSON.parse(JSON.stringify(h)));

// ---------------------------------------------------------------------------
// 1. gcd / numberToFraction: verbatim copies, proven equal to the original page
// ---------------------------------------------------------------------------
function loadOriginalFractionFns(): { gcd: (a: number, b: number) => number; numberToFraction: (n: number, t?: number) => string } {
  const src = readFileSync(path.resolve(__dirname, "reference/original/pages/inheritance.page.tsx.txt"), "utf8").replace(/\r\n/g, "\n");
  const start = src.indexOf("function gcd(");
  const endMarker = "return `${h1}/${k1}`;\n}";
  const end = src.indexOf(endMarker, start) + endMarker.length;
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  const js = ts.transpileModule(src.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
  return new Function(`${js}\nreturn { gcd, numberToFraction };`)();
}

describe("fraction helpers match the original page source", () => {
  const orig = loadOriginalFractionFns();

  it("numberToFraction is identical on 0, 1, common shares and many rationals", () => {
    const inputs: number[] = [0, 1, 0.5, 1 / 3, 2 / 3, 1 / 4, 1 / 6, 1 / 8, 13 / 24, 13 / 36, 13 / 72, 3 / 7, 4 / 7, 3 / 8, 0.1, 0.123456, 7 / 12, 5 / 12];
    for (let den = 1; den <= 120; den++) for (let num = 0; num <= den; num++) inputs.push(num / den);
    for (const x of inputs) expect(numberToFraction(x)).toBe(orig.numberToFraction(x));
    expect(numberToFraction(0.3333, 1e-3)).toBe(orig.numberToFraction(0.3333, 1e-3));
  });

  it("gcd is identical on integer pairs", () => {
    for (let a = 0; a <= 60; a++) for (let b = 0; b <= 60; b++) expect(gcd(a, b)).toBe(orig.gcd(a, b));
    expect(gcd(1071, 462)).toBe(21);
  });
});

// ---------------------------------------------------------------------------
// 2. Scenario equivalence: src/lib vs frozen original, all 5 madhabs
// ---------------------------------------------------------------------------
const SCENARIOS: { name: string; heirs: RawHeirs }[] = [
  { name: "No heirs (Bayt al-Mal)", heirs: {} },
  { name: "Husband only", heirs: { husband: true } },
  { name: "Wife only", heirs: { wife: 1 } },
  { name: "Four wives only", heirs: { wife: 4 } },
  { name: "One daughter only", heirs: { daughter: 1 } },
  { name: "Three daughters only", heirs: { daughter: 3 } },
  { name: "Husband + 2 full sisters (awl)", heirs: { husband: true, fullSister: 2 } },
  { name: "Husband + mother + 2 full sisters (awl)", heirs: { husband: true, mother: true, fullSister: 2 } },
  { name: "Daughter + mother (radd)", heirs: { daughter: 1, mother: true } },
  { name: "Husband + father + mother (umariyyatan)", heirs: { husband: true, father: true, mother: true } },
  { name: "Wife + father + mother (umariyyatan)", heirs: { wife: 1, father: true, mother: true } },
  { name: "Grandfather + 1 full brother", heirs: { paternalGrandfather: true, fullBrother: 1 } },
  { name: "Wife + grandfather + 2 brothers + 1 sister", heirs: { wife: 1, paternalGrandfather: true, fullBrother: 2, fullSister: 1 } },
  { name: "Mother + grandfather + 1 full sister", heirs: { mother: true, paternalGrandfather: true, fullSister: 1 } },
  { name: "Son + 2 full brothers (hajb)", heirs: { son: 1, fullBrother: 2 } },
  { name: "Father + grandfather + brother (hajb)", heirs: { father: true, paternalGrandfather: true, fullBrother: 1 } },
  { name: "Mother + both grandmothers (hajb)", heirs: { mother: true, paternalGrandmother: true, maternalGrandmother: true } },
  { name: "Both grandmothers + 2 daughters", heirs: { paternalGrandmother: true, maternalGrandmother: true, daughter: 2 } },
  { name: "2 wives + 2 sons + 3 daughters + parents", heirs: { wife: 2, son: 2, daughter: 3, father: true, mother: true } },
  { name: "Husband + son", heirs: { husband: true, son: 1 } },
  { name: "Full brother + full sister", heirs: { fullBrother: 1, fullSister: 1 } },
  { name: "Jafari class 1 blocks class 2", heirs: { father: true, paternalGrandfather: true, fullBrother: 2 } },
  { name: "Class 2: grandmother + maternal half-brother", heirs: { paternalGrandmother: true, maternalHalfBrother: 1 } },
  { name: "Husband + son's son + son's daughter", heirs: { husband: true, sonsSon: 1, sonsDaughter: 1 } },
  { name: "Son blocks son's son", heirs: { son: 1, sonsSon: 1 } },
  { name: "Mother + 2 son's daughters", heirs: { mother: true, sonsDaughter: 2 } },
  { name: "Husband + 2 maternal half-sisters", heirs: { husband: true, maternalHalfSister: 2 } },
  { name: "Daughter + full brother", heirs: { daughter: 1, fullBrother: 1 } },
  { name: "Father + mother only", heirs: { father: true, mother: true } },
  { name: "Wife + paternal half-brother + paternal half-sister", heirs: { wife: 1, paternalHalfBrother: 1, paternalHalfSister: 1 } },
];

describe("calculateInheritance: src/lib equals the frozen original", () => {
  for (const sc of SCENARIOS) {
    for (const m of MADHABS) {
      it(`${sc.name} [${m}]`, () => {
        for (const estate of [100000, 98765.43]) {
          const a: CalculationResult = calcNew(estate, copy(sc.heirs), m);
          const b: CalculationResult = calcOrig(estate, copy(sc.heirs), m);
          expect(a).toStrictEqual(b);
        }
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Textbook cases with hand-verified expected shares (Sunni majority)
//    Shares come from Qur'an 4:11, 4:12, 4:176 plus the residuary (ʿaṣabah)
//    and ʿawl rules applied by all four Sunni schools.
// ---------------------------------------------------------------------------
function shareOf(r: CalculationResult, heir: string): number {
  const s = r.shares.find((x) => x.heir === heir);
  return s?.share ?? 0;
}
function expectShares(heirs: RawHeirs, expected: Record<string, [number, number]>, madhabs: Madhab[] = SUNNI) {
  for (const m of madhabs) {
    const r = calcNew(120000, copy(heirs), m);
    for (const [heir, [n, d]] of Object.entries(expected)) {
      expect(shareOf(r, heir), `${heir} [${m}]`).toBeCloseTo(n / d, 12);
      expect(numberToFraction(shareOf(r, heir)), `${heir} fraction [${m}]`).toBe(d === 1 ? String(n) : `${n}/${d}`);
    }
    expect(r.totalShares + (r.baytAlMalAmount ?? 0) / 120000).toBeCloseTo(1, 12);
  }
}

describe("textbook cases (hand-verified)", () => {
  it("wife + son: 1/8 and 7/8", () => {
    // Wife 1/8 with a child (4:12). Son is residuary: 1 - 1/8 = 7/8.
    expectShares({ wife: 1, son: 1 }, { wife: [1, 8], son: [7, 8] });
  });

  it("husband + son: 1/4 and 3/4", () => {
    // Husband 1/4 with a child (4:12). Son takes the rest: 1 - 1/4 = 3/4.
    expectShares({ husband: true, son: 1 }, { husband: [1, 4], son: [3, 4] });
  });

  it("husband + full sister: 1/2 and 1/2", () => {
    // Husband 1/2, no child (4:12). One sister 1/2 (4:176). 1/2 + 1/2 = 1, no ʿawl, no radd.
    expectShares({ husband: true, fullSister: 1 }, { husband: [1, 2], fullSister: [1, 2] });
  });

  it("husband + 2 full sisters: ʿawl to 7, so 3/7 and 4/7", () => {
    // Husband 1/2 = 3/6. Two sisters 2/3 = 4/6 (4:176). Total 7/6 > 1.
    // ʿAwl: base 6 raised to 7. Husband 3/7, sisters 4/7.
    expectShares({ husband: true, fullSister: 2 }, { husband: [3, 7], fullSister: [4, 7] });
    for (const m of SUNNI) expect(calcNew(1, copy({ husband: true, fullSister: 2 }), m).wasAwlApplied).toBe(true);
  });

  it("husband + mother + 2 full sisters: ʿawl to 8, so 3/8, 1/8, 4/8", () => {
    // Husband 1/2 = 3/6. Mother 1/6 (two siblings, 4:11). Sisters 2/3 = 4/6.
    // Total 8/6. ʿAwl to 8: husband 3/8, mother 1/8, sisters 4/8 = 1/2.
    expectShares({ husband: true, mother: true, fullSister: 2 }, { husband: [3, 8], mother: [1, 8], fullSister: [1, 2] });
  });

  it("wife + father + mother + son: 1/8, 1/6, 1/6, 13/24", () => {
    // Base 24. Wife 1/8 = 3/24. Father 1/6 = 4/24. Mother 1/6 = 4/24 (4:11, 4:12).
    // Son takes the rest: 24 - 3 - 4 - 4 = 13, so 13/24.
    expectShares({ wife: 1, father: true, mother: true, son: 1 }, { wife: [1, 8], father: [1, 6], mother: [1, 6], son: [13, 24] });
  });

  it("husband + father + mother (first ʿUmariyyah): 1/2, mother 1/6, father 1/3", () => {
    // Husband 1/2. Mother 1/3 of the remainder: 1/3 x 1/2 = 1/6. Father the rest: 1 - 1/2 - 1/6 = 1/3.
    expectShares({ husband: true, father: true, mother: true }, { husband: [1, 2], mother: [1, 6], father: [1, 3] });
  });

  it("wife + father + mother (second ʿUmariyyah): 1/4, mother 1/4, father 1/2", () => {
    // Wife 1/4. Mother 1/3 of the remainder: 1/3 x 3/4 = 1/4. Father the rest: 1 - 1/4 - 1/4 = 1/2.
    expectShares({ wife: 1, father: true, mother: true }, { wife: [1, 4], mother: [1, 4], father: [1, 2] });
  });

  it("father + mother only: mother 1/3, father 2/3", () => {
    // Mother 1/3, no child, fewer than two siblings (4:11). Father takes the rest: 2/3.
    expectShares({ father: true, mother: true }, { mother: [1, 3], father: [2, 3] });
  });

  it("daughter + father: 1/2 and 1/2", () => {
    // Daughter 1/2 (4:11). Father 1/6 (4:11) plus the rest as residuary: 1/6 + (1 - 1/2 - 1/6) = 1/2.
    expectShares({ daughter: 1, father: true }, { daughter: [1, 2], father: [1, 2] });
  });

  it("2 daughters + father + mother: 2/3, 1/6, 1/6", () => {
    // Daughters 2/3 = 4/6, father 1/6, mother 1/6 (4:11). Total exactly 6/6.
    expectShares({ daughter: 2, father: true, mother: true }, { daughter: [2, 3], father: [1, 6], mother: [1, 6] });
  });
});

// ---------------------------------------------------------------------------
// 4. Textbook cases where the current code DISAGREES (see NEEDS OWNER REVIEW).
//    it.fails: these pass while the code still disagrees. When the owner fixes
//    calculate.ts, they will start failing and should become normal tests.
// ---------------------------------------------------------------------------
describe("known disagreements with textbook results (do not change code here)", () => {
  it.fails("wife + full brother: 1/4 and 3/4 (brother is residuary)", () => {
    // Wife 1/4 (4:12). Full brother takes the rest as ʿaṣabah: 3/4.
    // Code: brother gets nothing, 3/4 goes to Bayt al-Māl.
    expectShares({ wife: 1, fullBrother: 1 }, { wife: [1, 4], fullBrother: [3, 4] });
  });

  it.fails("daughter + full brother: 1/2 and 1/2 (the site's own Jaʿfarī note states this Sunni result)", () => {
    // Daughter 1/2 (4:11). Brother residuary: 1/2. Code: daughter takes all by radd.
    expectShares({ daughter: 1, fullBrother: 1 }, { daughter: [1, 2], fullBrother: [1, 2] });
  });

  it.fails("full brother + full sister: 2/3 and 1/3 (4:176)", () => {
    // Male takes the share of two females (4:176): 2 parts + 1 part. Code: sister takes all.
    expectShares({ fullBrother: 1, fullSister: 1 }, { fullBrother: [2, 3], fullSister: [1, 3] });
  });

  it.fails("daughter + full sister: 1/2 and 1/2 (sister residuary with the daughter)", () => {
    // Daughter 1/2. Full sister takes the rest (ʿaṣabah maʿa al-ghayr). Code: daughter takes all.
    expectShares({ daughter: 1, fullSister: 1 }, { daughter: [1, 2], fullSister: [1, 2] });
  });

  it.fails("grandfather + 1 full brother [Mālikī/Shāfiʿī/Ḥanbalī]: 1/2 each (muqāsama)", () => {
    // No fixed heirs; sharing as a brother gives each 1/2, the best of the options.
    // Code adds the grandfather's 1/6 fixed share AND the muqāsama share: 7/12 and 5/12.
    expectShares({ paternalGrandfather: true, fullBrother: 1 }, { paternalGrandfather: [1, 2], fullBrother: [1, 2] }, ["maliki", "shafii", "hanbali"]);
  });

  it("father + mother + 2 full brothers: mother 1/6, father 5/6 (corrected)", () => {
    // Siblings excluded by the father still reduce the mother to 1/6 (4:11;
    // islamqa.info/ar/answers/13632). Corrected in November 2026.
    expectShares({ father: true, mother: true, fullBrother: 2 }, { mother: [1, 6], father: [5, 6] });
  });
});

// ---------------------------------------------------------------------------
// 5. Net estate helper and the worked examples on the page
// ---------------------------------------------------------------------------
describe("computeNetEstate", () => {
  it("with no deductions equals the gross estate (original behaviour)", () => {
    expect(computeNetEstate({ gross: 100000, funeral: 0, debts: 0, bequest: 0 }).net).toBe(100000);
  });
  it("subtracts funeral costs, debts and bequest", () => {
    const r = computeNetEstate({ gross: 150000, funeral: 5000, debts: 15000, bequest: 10000 });
    expect(r.afterDebts).toBe(130000);
    expect(r.net).toBe(120000);
    expect(r.bequestAboveOneThird).toBe(false);
  });
  it("flags a bequest above one third without capping it", () => {
    const r = computeNetEstate({ gross: 90000, funeral: 0, debts: 0, bequest: 40000 });
    expect(r.bequestAboveOneThird).toBe(true);
    expect(r.net).toBe(50000);
    expect(computeNetEstate({ gross: 90000, funeral: 0, debts: 0, bequest: 30000 }).bequestAboveOneThird).toBe(false);
  });
  it("never goes below zero and ignores negative or invalid input", () => {
    const r = computeNetEstate({ gross: 1000, funeral: 500, debts: 900, bequest: 0 });
    expect(r.net).toBe(0);
    expect(r.deductionsExceedEstate).toBe(true);
    expect(computeNetEstate({ gross: 1000, funeral: -50, debts: NaN, bequest: 0 }).net).toBe(1000);
  });
});

describe("worked examples on /inheritance match the arithmetic in the page text", () => {
  it("example 1: net 120,000; wife 1/8, parents 1/6 each, son 13/36, daughter 13/72", () => {
    const net = computeNetEstate(EXAMPLE_FAMILY.estate).net;
    expect(net).toBe(120000);
    // 1 - 3/24 - 4/24 - 4/24 = 13/24; son 2 parts, daughter 1 part: 26/72 = 13/36 and 13/72.
    expectShares(EXAMPLE_FAMILY.heirs as unknown as RawHeirs, { wife: [1, 8], father: [1, 6], mother: [1, 6], son: [13, 36], daughter: [13, 72] });
    const r = calcNew(net, copy(EXAMPLE_FAMILY.heirs as unknown as RawHeirs), EXAMPLE_FAMILY.madhab);
    expect(r.shares.find((s) => s.heir === "wife")?.amount).toBeCloseTo(15000, 6);
    expect(r.shares.find((s) => s.heir === "son")?.amount).toBeCloseTo(43333.333333, 4);
  });
  it("example 2: ʿawl to 8; husband 3/8, mother 1/8, sisters 1/2", () => {
    expect(computeNetEstate(EXAMPLE_AWL.estate).net).toBe(120000);
    expectShares(EXAMPLE_AWL.heirs as unknown as RawHeirs, { husband: [3, 8], mother: [1, 8], fullSister: [1, 2] });
  });
});
