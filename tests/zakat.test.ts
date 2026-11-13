import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import { calculateZakat } from "@/lib/calculate";
import { calculateZakat as calculateZakatOriginal } from "./reference/original/lib/calculate";
import { MADHAB_PRESETS, type AssetInputs, type Madhab, type MethodologyChoices } from "@/lib/types";
import {
  KARAT_LIQUIDATION,
  KARAT_OPTIONS,
  jewelryLiquidationFor,
  jewelryGoldPricePerGram,
  jewelryGoldValue,
  goldNisabValue,
  silverNisabValue,
  goldPricePerOunce,
  metalValue,
  khumsPreview,
  showKhumsPreview,
  combinedObligation,
  equityPercentToHoldings,
  holdingsToEquityPercent,
  progressPercent,
} from "@/lib/zakat/page-math";
import { defaultAssets, defaultChoices, INITIAL_METAL_PRICES } from "@/lib/zakat/defaults";
import { applyChoice, applyMadhab } from "@/lib/zakat/choices";
import {
  EXAMPLE_ASSETS,
  EXAMPLE_GOLD_PER_GRAM,
  EXAMPLE_SILVER_PER_GRAM,
  EXAMPLE_SCHOOLS,
  exampleChoices,
} from "@/lib/zakat/example";

const ORIGINAL_PAGE = readFileSync(
  path.resolve(__dirname, "reference/original/pages/zakat.page.tsx.txt"),
  "utf8"
).replace(/\r\n/g, "\n");
const squash = (s: string) => s.replace(/\s+/g, "");

function preset(m: Exclude<Madhab, "custom">, over: Partial<MethodologyChoices> = {}): MethodologyChoices {
  return { madhab: m, ...MADHAB_PRESETS[m], ...over };
}
function custom(base: Exclude<Madhab, "custom">, over: Partial<MethodologyChoices>): MethodologyChoices {
  return { ...preset(base), ...over, madhab: "custom" };
}
function assets(over: Partial<AssetInputs>): AssetInputs {
  return { ...defaultAssets, ...over };
}

// ---------------------------------------------------------------------------
// 1. Extracted page logic equals the frozen original page source
// ---------------------------------------------------------------------------
describe("extracted page logic matches the original page source", () => {
  it("KARAT_LIQUIDATION table is identical to the original inline table", () => {
    const m = ORIGINAL_PAGE.match(/const KARAT_LIQUIDATION: Record<number, number> = (\{[\s\S]*?\});/);
    expect(m).not.toBeNull();
    const original = new Function(`return ${m![1]}`)() as Record<number, number>;
    expect(KARAT_LIQUIDATION).toEqual(original);
    // and identical to calculate.ts's private copy (checked via the source text)
    const calcSrc = readFileSync(path.resolve(__dirname, "../src/lib/calculate.ts"), "utf8");
    const c = calcSrc.match(/const KARAT_LIQUIDATION: Record<number, number> = (\{[\s\S]*?\});/);
    expect(new Function(`return ${c![1]}`)()).toEqual(original);
  });

  it("karat select options match the original", () => {
    const opts = [...ORIGINAL_PAGE.matchAll(/<option value=\{(\d+)\}>\d+kt<\/option>/g)].map((x) => Number(x[1]));
    expect([...KARAT_OPTIONS]).toEqual(opts);
  });

  it("original expressions are present verbatim in the page source", () => {
    const expressions = [
      "KARAT_LIQUIDATION[assets.goldJewelryKarat] ?? 0.699",
      "goldPrice * jewelryLiquidation",
      "assets.goldJewelryWeightGrams * jewelryGoldPrice",
      "85 * goldPrice",
      "595 * silverPrice",
      "goldPrice * 31.1035",
      "assets.goldWeightGrams * goldPrice",
      "assets.silverWeightGrams * silverPrice",
      "assets.silverJewelryWeightGrams * silverPrice",
      "(assets.annualIncome - assets.annualExpenses) * 0.2",
      "(assets.annualIncome - assets.annualExpenses) * 0.1",
      "assets.annualIncome > assets.annualExpenses",
      "result.totalZakatDue + result.khums.khumsDue",
      'assets.tfsaEquityPercent === 0 ? "cash" : assets.tfsaEquityPercent === 100 ? "equities" : "mixed"',
      'v === "cash" ? 0 : v === "equities" ? 100 : 70',
      "((step + 1) / STEPS.length) * 100",
      "calculateZakat(choices, assets, goldPrice, silverPrice)",
    ];
    for (const e of expressions) expect(ORIGINAL_PAGE, e).toContain(e);
  });

  it("jewelry price derivation equals the original formula for every karat (and unknown karats)", () => {
    const original = (goldPrice: number, karat: number) => {
      const table: Record<number, number> = { 24: 0.780, 22: 0.699, 21: 0.666, 18: 0.569, 14: 0.439, 10: 0.309, 9: 0.276 };
      const jewelryLiquidation = table[karat] ?? 0.699;
      return goldPrice * jewelryLiquidation;
    };
    for (const price of [167, 124.81, 0.5, 9999.99]) {
      for (const k of [24, 22, 21, 18, 14, 10, 9, 23, 0]) {
        expect(jewelryGoldPricePerGram(price, k)).toBe(original(price, k));
        expect(jewelryGoldValue(37.5, price, k)).toBe(37.5 * original(price, k));
      }
    }
    expect(jewelryLiquidationFor(22)).toBe(0.699);
    expect(jewelryLiquidationFor(23)).toBe(0.699);
  });

  it("page jewelry value equals the value calculateZakat books for the same karat", () => {
    for (const k of KARAT_OPTIONS) {
      const r = calculateZakat(preset("hanafi"), assets({ goldJewelryWeightGrams: 50, goldJewelryKarat: k }), 100, 1);
      const row = r.breakdown.find((b) => b.category.startsWith("Gold Jewelry"))!;
      expect(row.amount).toBe(jewelryGoldValue(50, 100, k));
    }
  });

  it("niṣāb previews equal the threshold calculateZakat uses", () => {
    for (const [g, s] of [[167, 2.76], [124.81, 1.58], [100, 1]]) {
      expect(goldNisabValue(g)).toBe(85 * g);
      expect(silverNisabValue(s)).toBe(595 * s);
      expect(calculateZakat(preset("shafii"), defaultAssets, g, s).nisabThreshold).toBe(goldNisabValue(g));
      expect(calculateZakat(preset("hanafi"), defaultAssets, g, s).nisabThreshold).toBe(silverNisabValue(s));
    }
    expect(goldPricePerOunce(167)).toBe(167 * 31.1035);
    expect(metalValue(12.5, 2.76)).toBe(12.5 * 2.76);
  });

  it("Khums preview and combined total equal the original expressions and calculateZakat's Khums", () => {
    const k = khumsPreview(60000, 45000);
    expect(k).toEqual({ surplus: 15000, khumsDue: (60000 - 45000) * 0.2, sahmImam: (60000 - 45000) * 0.1, sahmSadat: (60000 - 45000) * 0.1 });
    expect(showKhumsPreview(60000, 45000)).toBe(true);
    expect(showKhumsPreview(45000, 45000)).toBe(false);
    const r = calculateZakat(preset("jafari"), assets({ annualIncome: 60000, annualExpenses: 45000 }), 100, 1);
    expect(r.khums!.khumsDue).toBeCloseTo(k.khumsDue, 9);
    expect(combinedObligation(r.totalZakatDue, r.khums!.khumsDue)).toBe(r.totalZakatDue + r.khums!.khumsDue);
  });

  it("holdings select mapping and progress match the original", () => {
    expect(equityPercentToHoldings(0)).toBe("cash");
    expect(equityPercentToHoldings(100)).toBe("equities");
    expect(equityPercentToHoldings(55)).toBe("mixed");
    expect(holdingsToEquityPercent("cash")).toBe(0);
    expect(holdingsToEquityPercent("equities")).toBe(100);
    expect(holdingsToEquityPercent("mixed")).toBe(70);
    expect(progressPercent(0, 14)).toBe((1 / 14) * 100);
    expect(progressPercent(13, 14)).toBe(100);
  });

  it("default state equals the original page defaults", () => {
    const a = ORIGINAL_PAGE.match(/const defaultAssets: AssetInputs = (\{[\s\S]*?\n\});/);
    expect(new Function(`return ${a![1]}`)()).toEqual(defaultAssets);
    expect(ORIGINAL_PAGE).toContain('const defaultChoices: MethodologyChoices = {\n  madhab: "hanafi",\n  ...MADHAB_PRESETS.hanafi,\n};');
    expect(defaultChoices).toEqual({ madhab: "hanafi", ...MADHAB_PRESETS.hanafi });
    const p = ORIGINAL_PAGE.match(/useState<MetalPrices>\((\{[\s\S]*?\})\);/);
    expect(new Function(`return ${p![1]}`)()).toEqual(INITIAL_METAL_PRICES);
  });

  it("choice updaters are the original code, verbatim", () => {
    const src = squash(readFileSync(path.resolve(__dirname, "../src/lib/zakat/choices.ts"), "utf8"));
    const upd = ORIGINAL_PAGE.match(/setChoices\(\(prev\) => \{\n([\s\S]*?)\n      return updated;/);
    expect(src).toContain(squash(upd![1]));
    // behaviour
    const c1 = applyChoice(defaultChoices, "nisabStandard", "gold");
    expect(c1.madhab).toBe("custom");
    const c2 = applyChoice(defaultChoices, "nisabStandard", "silver");
    expect(c2.madhab).toBe("hanafi");
    const c3 = applyChoice(c1, "nisabStandard", "silver");
    expect(c3.madhab).toBe("custom"); // once custom, stays custom (original behaviour)
    expect(applyMadhab(c1, "shafii")).toEqual({ madhab: "shafii", ...MADHAB_PRESETS.shafii });
    expect(applyMadhab(defaultChoices, "custom")).toEqual({ ...defaultChoices, madhab: "custom" });
  });
});

// ---------------------------------------------------------------------------
// 2. Current calculate.ts vs frozen original calculate.ts: deep-equal results
// ---------------------------------------------------------------------------
interface Case {
  name: string;
  choices: MethodologyChoices;
  assets: AssetInputs;
  gold?: number;
  silver?: number;
}

const CASES: Case[] = [
  { name: "01 Hanafi preset, cash above silver nisab", choices: preset("hanafi"), assets: assets({ cashOnHand: 4000, bankAccounts: 6000 }), gold: 100, silver: 1 },
  { name: "02 Hanafi preset, cash below silver nisab", choices: preset("hanafi"), assets: assets({ cashOnHand: 500 }), gold: 100, silver: 1 },
  { name: "03 Shafii preset, below gold nisab, debts ignored", choices: preset("shafii"), assets: assets({ bankAccounts: 8000, creditCardBalance: 1000 }), gold: 100, silver: 1 },
  { name: "04 Shafii preset, above gold nisab, RRSP deferred", choices: preset("shafii"), assets: assets({ bankAccounts: 20000, monthlyMortgagePrincipal: 1000, stocksMarketValue: 30000, rrsp401kBalance: 50000, employerMatchVested: 4000 }), gold: 124.81, silver: 1.58 },
  { name: "05 Maliki preset, zakatable-assets 40%, RRSP net 30% mixed 70%", choices: preset("maliki"), assets: assets({ bankAccounts: 15000, stocksMarketValue: 50000, stocksZakatablePercent: 40, rrsp401kBalance: 100000, rrspEquityPercent: 70, employerMatchVested: 5000, creditCardBalance: 2000 }), gold: 167, silver: 2.76 },
  { name: "06 Maliki preset, hidden-wealth debts with livestock and crops", choices: preset("maliki"), assets: assets({ cashOnHand: 30000, sheepGoats: 120, cropValueOrWeight: 2000, personalLoans: 5000, monthlyCarLoanPrincipal: 300 }), gold: 100, silver: 1 },
  { name: "07 Hanbali preset, crypto, RRSP net 20%, 12-month debts", choices: preset("hanbali"), assets: assets({ bankAccounts: 40000, cryptoValue: 7000, rrsp401kBalance: 60000, rrspWithholdingTaxPercent: 20, monthlyStudentLoanPrincipal: 250, otherShortTermDebt: 900 }), gold: 124.81, silver: 1.58 },
  { name: "08 Jafari preset, Khums + coins + crops + livestock + excluded assets", choices: preset("jafari"), assets: assets({ annualIncome: 80000, annualExpenses: 52000, cashOnHand: 20000, goldWeightGrams: 100, goldJewelryWeightGrams: 30, stocksMarketValue: 10000, rentalIncome: 6000, propertyForSale: 90000, businessCash: 5000, tfsaRothBalance: 3000, rrsp401kBalance: 9000, employerMatchVested: 1000, cryptoValue: 2000, cropValueOrWeight: 900, sheepGoats: 45, cattle: 30 }), gold: 100, silver: 1 },
  { name: "09 Custom: silver nisab, worn jewelry exempt, 18kt, dividends only", choices: custom("shafii", { nisabStandard: "silver", jewelryZakatable: false, stockMethod: "dividends_only" }), assets: assets({ bankAccounts: 3000, goldJewelryWeightGrams: 60, goldJewelryKarat: 18, silverJewelryWeightGrams: 200, stocksMarketValue: 25000, stocksDividends: 900 }), gold: 124.81, silver: 1.58 },
  { name: "10 Custom: gold nisab, jewelry zakatable, 14kt + silver jewelry, CRI 30%, solar", choices: custom("hanafi", { nisabStandard: "gold", stockMethod: "cri_approximation", yearType: "solar" }), assets: assets({ cashOnHand: 12000, goldJewelryWeightGrams: 25, goldJewelryKarat: 14, silverJewelryWeightGrams: 300, mutualFundsETFs: 40000, bonds: 5000, otherInvestments: 1000 }), gold: 124.81, silver: 1.58 },
  { name: "11 Custom: RRSP full balance, mixed holdings, TFSA cash-only", choices: custom("hanafi", { rrspApproach: "full_balance" }), assets: assets({ bankAccounts: 5000, tfsaRothBalance: 20000, tfsaEquityPercent: 0, rrsp401kBalance: 80000, rrspEquityPercent: 60, rrspZakatableAssetsPercent: 25, employerMatchVested: 6000, employerMatchUnvested: 3000 }), gold: 100, silver: 1 },
  { name: "12 Custom: RRSP excluded, employer match excluded", choices: custom("hanafi", { rrspApproach: "exclude" }), assets: assets({ bankAccounts: 10000, rrsp401kBalance: 70000, employerMatchVested: 4000, employerMatchUnvested: 2000 }), gold: 100, silver: 1 },
  { name: "13 Custom: RRSP deferred, single-installment debts (all four loans)", choices: custom("hanafi", { rrspApproach: "defer_to_withdrawal", debtDeduction: "single_installment" }), assets: assets({ bankAccounts: 25000, rrsp401kBalance: 45000, employerMatchVested: 2500, creditCardBalance: 800, monthlyMortgagePrincipal: 900, monthlyStudentLoanPrincipal: 200, monthlyCarLoanPrincipal: 350, monthlyOtherLongTermPrincipal: 100 }), gold: 124.81, silver: 1.58 },
  { name: "14 Custom: crypto like trade goods, zakatable-assets default % (0 -> 30)", choices: custom("hanafi", { cryptoTreatment: "like_trade_goods", stockMethod: "zakatable_assets" }), assets: assets({ cryptoValue: 15000, stocksMarketValue: 20000, stocksZakatablePercent: 0 }), gold: 100, silver: 1 },
  { name: "15 Custom: crypto not zakatable", choices: custom("hanafi", { cryptoTreatment: "not_zakatable" }), assets: assets({ cryptoValue: 50000, cashOnHand: 1000 }), gold: 100, silver: 1 },
  { name: "16 Crops irrigated, 5-wasq minimum, just below (652)", choices: custom("shafii", { agriculturalMinimum: true }), assets: assets({ cropValueOrWeight: 652, isIrrigated: true, bankAccounts: 10000 }), gold: 100, silver: 1 },
  { name: "17 Crops rain-fed, 5-wasq minimum, at boundary (653)", choices: preset("shafii"), assets: assets({ cropValueOrWeight: 653, bankAccounts: 10000 }), gold: 100, silver: 1 },
  { name: "18 Crops rain-fed, no minimum (Hanafi), 100", choices: preset("hanafi"), assets: assets({ cropValueOrWeight: 100, cashOnHand: 1000 }), gold: 100, silver: 1 },
  { name: "19 Livestock just below minimums (39/29/4)", choices: preset("hanafi"), assets: assets({ sheepGoats: 39, cattle: 29, camels: 4, cashOnHand: 1000 }), gold: 100, silver: 1 },
  { name: "20 Livestock at minimums (40/30/5)", choices: preset("hanafi"), assets: assets({ sheepGoats: 40, cattle: 30, camels: 5, cashOnHand: 1000 }), gold: 100, silver: 1 },
  { name: "21 Livestock tier edges (121/60/25)", choices: preset("hanafi"), assets: assets({ sheepGoats: 121, cattle: 60, camels: 25, cashOnHand: 1000 }), gold: 100, silver: 1 },
  { name: "22 Livestock large herds (400/80/36)", choices: preset("hanafi"), assets: assets({ sheepGoats: 400, cattle: 80, camels: 36, cashOnHand: 1000 }), gold: 100, silver: 1 },
  { name: "23 Lunar vs solar: Hanafi solar year, business + rental", choices: preset("hanafi", { yearType: "solar" }), assets: assets({ businessCash: 8000, inventory: 12000, receivables: 3000, rentalIncome: 9000, propertyForSale: 150000 }), gold: 100, silver: 1 },
  { name: "24 Debts exceed assets (net wealth floors at 0)", choices: preset("hanafi"), assets: assets({ bankAccounts: 5000, creditCardBalance: 9000 }), gold: 100, silver: 1 },
  { name: "25 Unknown karat (23) and karat 0 fallbacks", choices: preset("hanafi"), assets: assets({ goldJewelryWeightGrams: 10, goldJewelryKarat: 23, bankAccounts: 2000 }), gold: 100, silver: 1 },
  { name: "26 All defaults, calculate.ts default (fallback) prices", choices: defaultChoices, assets: defaultAssets },
  { name: "27 Karat 0 -> 22 in calculate.ts", choices: preset("hanafi"), assets: assets({ goldJewelryWeightGrams: 10, goldJewelryKarat: 0 }), gold: 100, silver: 1 },
];

function run(fn: typeof calculateZakat, c: Case) {
  // fresh copies so neither implementation can see the other's objects
  const ch = structuredClone(c.choices);
  const as = structuredClone(c.assets);
  return c.gold === undefined ? fn(ch, as) : fn(ch, as, c.gold, c.silver);
}

describe("calculateZakat: current vs frozen original (deep equal)", () => {
  it.each(CASES.map((c) => [c.name, c] as const))("%s", (_name, c) => {
    const now = run(calculateZakat, c);
    const orig = run(calculateZakatOriginal as typeof calculateZakat, c);
    expect(now).toEqual(orig);
  });

  it("prints the comparison table", () => {
    const rows = CASES.map((c) => {
      const now = run(calculateZakat, c);
      const orig = run(calculateZakatOriginal as typeof calculateZakat, c);
      return {
        case: c.name,
        original: Number(orig.totalZakatDue.toFixed(4)),
        current: Number(now.totalZakatDue.toFixed(4)),
        nisab: Number(now.nisabThreshold.toFixed(2)),
        meets: now.meetsNisab,
        khums: now.khums ? now.khums.khumsDue : "",
        match: JSON.stringify(now) === JSON.stringify(orig),
      };
    });
    console.table(rows);
    expect(rows.every((r) => r.match)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Hand-verified worked examples
// ---------------------------------------------------------------------------
describe("hand-verified worked examples", () => {
  it("A. Hanafi, $10,000 cash, silver niṣāb at $1/g", () => {
    // niṣāb = 595 g x $1 = $595. Wealth $10,000 >= $595, so Zakat is due.
    // Zakat = 10,000 x 2.5% = $250.
    const r = calculateZakat(preset("hanafi"), assets({ cashOnHand: 10000 }), 100, 1);
    expect(r.nisabThreshold).toBe(595);
    expect(r.meetsNisab).toBe(true);
    expect(r.totalZakatDue).toBeCloseTo(250, 10);
  });

  it("B. Shafii, $8,000 cash, gold niṣāb at $100/g: below niṣāb", () => {
    // niṣāb = 85 g x $100 = $8,500. Wealth $8,000 < $8,500, so nothing is due.
    // The $1,000 card balance is not deducted (no_deduction) and changes nothing.
    const r = calculateZakat(preset("shafii"), assets({ cashOnHand: 8000, creditCardBalance: 1000 }), 100, 1);
    expect(r.nisabThreshold).toBe(8500);
    expect(r.totalNetWealth).toBe(8000);
    expect(r.meetsNisab).toBe(false);
    expect(r.totalZakatDue).toBe(0);
  });

  it("C. Hanafi, $100,000 savings, $1,500/month mortgage principal (scholarly-info DEBT_INFO example)", () => {
    // Debt deduction (12 months of principal) = 12 x 1,500 = $18,000.
    // Net zakatable = 100,000 - 18,000 = $82,000. Zakat = 82,000 x 2.5% = $2,050.
    const r = calculateZakat(preset("hanafi"), assets({ bankAccounts: 100000, monthlyMortgagePrincipal: 1500 }), 100, 1);
    expect(r.totalZakatableWealth).toBe(82000);
    expect(r.totalZakatDue).toBeCloseTo(2050, 8);
    // Shafii (no deduction): full 100,000 x 2.5% = $2,500
    const s = calculateZakat(preset("shafii"), assets({ bankAccounts: 100000, monthlyMortgagePrincipal: 1500 }), 100, 1);
    expect(s.totalZakatDue).toBeCloseTo(2500, 8);
  });

  it("D. Hanafi, 50 g of 22kt worn jewelry at $100/g spot", () => {
    // 22kt liquidation fraction = 0.699, so jewelry price = 100 x 0.699 = $69.90/g.
    // Value = 50 x 69.90 = $3,495. niṣāb (silver) = 595 x $1 = $595, met.
    // Zakat = 3,495 x 2.5% = $87.375.
    const r = calculateZakat(preset("hanafi"), assets({ goldJewelryWeightGrams: 50, goldJewelryKarat: 22 }), 100, 1);
    expect(r.breakdown[0].amount).toBeCloseTo(3495, 10);
    expect(r.totalZakatDue).toBeCloseTo(87.375, 10);
    // Shafii exempts worn jewelry: nothing due.
    expect(calculateZakat(preset("shafii"), assets({ goldJewelryWeightGrams: 50 }), 100, 1).totalZakatDue).toBe(0);
  });

  it("E. Solar year: Hanafi, $10,000 cash", () => {
    // Lunar Zakat $250 x 1.0307 (solar multiplier in calculate.ts) = $257.675.
    const r = calculateZakat(preset("hanafi", { yearType: "solar" }), assets({ cashOnHand: 10000 }), 100, 1);
    expect(r.totalZakatDue).toBeCloseTo(257.675, 10);
  });

  it("F. Jafari Khums: income $60,000, expenses $45,000", () => {
    // Surplus = 60,000 - 45,000 = $15,000. Khums = 15,000 x 20% = $3,000,
    // split $1,500 Sahm al-Imam + $1,500 Sahm al-Sadat.
    // $20,000 cash carries no obligatory Zakat in this school, so Zakat = $0.
    const r = calculateZakat(preset("jafari"), assets({ annualIncome: 60000, annualExpenses: 45000, cashOnHand: 20000 }), 100, 1);
    expect(r.khums).toEqual({ annualIncome: 60000, annualExpenses: 45000, surplus: 15000, khumsDue: 3000, sahmImam: 1500, sahmSadat: 1500 });
    expect(r.totalZakatDue).toBe(0);
  });

  it("G. Livestock boundary: 39 vs 40 sheep with $10,000 cash (Hanafi)", () => {
    // 39 sheep: below the 40-head minimum, only cash Zakat = $250.
    // 40 sheep: 1 sheep due, valued in calculate.ts at $150, so total = 250 + 150 = $400.
    const a = calculateZakat(preset("hanafi"), assets({ cashOnHand: 10000, sheepGoats: 39 }), 100, 1);
    const b = calculateZakat(preset("hanafi"), assets({ cashOnHand: 10000, sheepGoats: 40 }), 100, 1);
    expect(a.totalZakatDue).toBeCloseTo(250, 10);
    expect(b.totalZakatDue).toBeCloseTo(400, 10);
  });

  it("H. The page's worked example (Hanafi, example prices $120/g gold, $1.50/g silver)", () => {
    // niṣāb = 595 x 1.50 = $892.50
    // Cash 2,000 + 18,000 = 20,000
    // Jewelry 40 g x 120 x 0.699 = 3,355.20
    // Shares, full market value = 15,000
    // TFSA 10,000 x (100% equities x 30%) = 3,000 zakatable
    // Gross zakatable base = 20,000 + 3,355.20 + 15,000 + 3,000 = 41,355.20
    // Debts = 1,200 + 12 x 500 = 7,200. Net = 34,155.20
    // Zakat = 34,155.20 x 2.5% = $853.88
    const r = calculateZakat(exampleChoices("hanafi"), EXAMPLE_ASSETS, EXAMPLE_GOLD_PER_GRAM, EXAMPLE_SILVER_PER_GRAM);
    expect(r.nisabThreshold).toBeCloseTo(892.5, 10);
    expect(r.totalZakatableWealth).toBeCloseTo(34155.2, 8);
    expect(r.totalZakatDue).toBeCloseTo(853.88, 8);
    for (const m of EXAMPLE_SCHOOLS) {
      expect(calculateZakat(exampleChoices(m), EXAMPLE_ASSETS, EXAMPLE_GOLD_PER_GRAM, EXAMPLE_SILVER_PER_GRAM)).toEqual(
        calculateZakatOriginal(exampleChoices(m), EXAMPLE_ASSETS, EXAMPLE_GOLD_PER_GRAM, EXAMPLE_SILVER_PER_GRAM)
      );
    }
  });
});
