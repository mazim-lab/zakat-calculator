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
import {
  FALLBACK_GOLD_USD_PER_GRAM,
  FALLBACK_SILVER_USD_PER_GRAM,
  FALLBACK_GOLD_USD_PER_OZ,
  FALLBACK_SILVER_USD_PER_OZ,
  FALLBACK_PRICES_AS_OF,
} from "@/lib/metal-fallback";
import { cattleDue, camelsDue } from "@/lib/calculate";
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
    // The initial (fallback) metal prices were deliberately refreshed in
    // November 2026; the shape is unchanged, the figures come from
    // src/lib/metal-fallback.ts with their as-of date.
    const p = ORIGINAL_PAGE.match(/useState<MetalPrices>\((\{[\s\S]*?\})\);/);
    const original = new Function(`return ${p![1]}`)();
    expect(Object.keys(INITIAL_METAL_PRICES).sort()).toEqual(Object.keys(original).sort());
    expect(INITIAL_METAL_PRICES).toEqual({
      goldPerGram: FALLBACK_GOLD_USD_PER_GRAM,
      silverPerGram: FALLBACK_SILVER_USD_PER_GRAM,
      goldPerOz: FALLBACK_GOLD_USD_PER_OZ,
      silverPerOz: FALLBACK_SILVER_USD_PER_OZ,
      source: "fallback",
      timestamp: 0,
    });
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

// Cases whose result was deliberately corrected in November 2026, with the new
// total (each explained below) and the reason.
const CORRECTED_TOTAL: Record<string, { total: number; why: string }> = {
  // Cash 30,000 - debts (5,000 + 12 x 300) = 21,400 x 2.5% = 535; plus 1 sheep
  // (150) and 10% of 2,000 (200), which the Mālikī note says debts do not reduce.
  "06 Maliki preset, hidden-wealth debts with livestock and crops": { total: 885, why: "debts no longer reduce crops and livestock" },
  // Base no longer includes the deferred RRSP and match: (25,000 - 800 - 1,550) x 2.5%.
  "13 Custom: RRSP deferred, single-installment debts (all four loans)": { total: 566.25, why: "exempt items left out of the debt base" },
  // Harvest value 652 with no weight: the 653 kg minimum is a weight, so it is
  // not checked against a money value; 250 + 5% of 652 = 282.60.
  "16 Crops irrigated, 5-wasq minimum, just below (652)": { total: 282.6, why: "minimum checked against weight, not value" },
  // 121 sheep: 2 (300); 60 cattle: 2 tabīʿ (600); 25 camels: 1 bint makhāḍ in kind, not priced.
  "21 Livestock tier edges (121/60/25)": { total: 25 + 300 + 600, why: "camel schedule from 25 head" },
  // 400 sheep: 4 (600); 80 cattle: 2 musinnah (1,000); 36 camels: 1 bint labūn in kind.
  "22 Livestock large herds (400/80/36)": { total: 25 + 600 + 1000, why: "cattle and camel schedules" },
};
// Cases where the amount due is unchanged but a reported field changed:
// totalZakatableWealth no longer counts exempt rows, row notes were reworded,
// the Jaʿfarī niṣāb uses Sistani's 69.12 g, and the fallback prices changed.
const SAME_DUE = new Set<string>([
  "04 Shafii preset, above gold nisab, RRSP deferred",
  "08 Jafari preset, Khums + coins + crops + livestock + excluded assets",
  "09 Custom: silver nisab, worn jewelry exempt, 18kt, dividends only",
  "11 Custom: RRSP full balance, mixed holdings, TFSA cash-only",
  "12 Custom: RRSP excluded, employer match excluded",
  "15 Custom: crypto not zakatable",
  "17 Crops rain-fed, 5-wasq minimum, at boundary (653)",
  "18 Crops rain-fed, no minimum (Hanafi), 100",
  "20 Livestock at minimums (40/30/5)",
  "26 All defaults, calculate.ts default (fallback) prices",
  // Senior review: the Maliki debt caveat (debts are first set against other
  // assets) is now reported as a warning; the amount is unchanged.
  "05 Maliki preset, zakatable-assets 40%, RRSP net 30% mixed 70%",
]);

describe("calculateZakat: current vs frozen original (deep equal)", () => {
  it.each(CASES.map((c) => [c.name, c] as const))("%s", (_name, c) => {
    const now = run(calculateZakat, c);
    const orig = run(calculateZakatOriginal as typeof calculateZakat, c);
    if (CORRECTED_TOTAL[c.name]) {
      expect(now.totalZakatDue).toBeCloseTo(CORRECTED_TOTAL[c.name].total, 8);
      expect(now.totalZakatDue).not.toBeCloseTo(orig.totalZakatDue, 2);
    } else if (SAME_DUE.has(c.name)) {
      expect(now.totalZakatDue).toBeCloseTo(orig.totalZakatDue, 8);
      expect(now.meetsNisab).toBe(orig.meetsNisab);
      expect(now.khums).toEqual(orig.khums);
    } else {
      expect(now).toEqual(orig);
    }
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
        intended: !!CORRECTED_TOTAL[c.name] || SAME_DUE.has(c.name),
      };
    });
    console.table(rows);
    expect(rows.every((r) => r.match || r.intended)).toBe(true);
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
    // Ḥanafī and Shāfiʿī totals are unchanged. Mālikī and Ḥanbalī exempt worn
    // jewellery, which used to dilute the debt deduction:
    // (20,000 + 15,000 x 30% + 3,000) - 7,200 = 20,300 x 2.5% = 507.50 (was 527.07).
    const due = (m: (typeof EXAMPLE_SCHOOLS)[number]) =>
      calculateZakat(exampleChoices(m), EXAMPLE_ASSETS, EXAMPLE_GOLD_PER_GRAM, EXAMPLE_SILVER_PER_GRAM).totalZakatDue;
    const dueOrig = (m: (typeof EXAMPLE_SCHOOLS)[number]) =>
      calculateZakatOriginal(exampleChoices(m), EXAMPLE_ASSETS, EXAMPLE_GOLD_PER_GRAM, EXAMPLE_SILVER_PER_GRAM).totalZakatDue;
    for (const m of EXAMPLE_SCHOOLS) {
      if (m === "maliki" || m === "hanbali") expect(due(m)).toBeCloseTo(507.5, 8);
      else expect(due(m)).toBeCloseTo(dueOrig(m), 8);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Corrections made in November 2026 (each with its source in the commit)
// ---------------------------------------------------------------------------
describe("senior review: debts against crops and livestock by school", () => {
  // Kashshaf al-Qina' (shamela.ws/book/622/1823): Hanbali debts reduce crops and
  // livestock too. Bada'i' and Dar al-Iftaa 15928: Hanafi debts never reduce
  // crops and reach livestock only after money and trade goods.
  it("Hanbali: debt with crops due declines the crop line and warns", () => {
    const r = calculateZakat(preset("hanbali"), assets({ cashOnHand: 20000, creditCardBalance: 5000, cropValueOrWeight: 2000, cropWeightKg: 900 }), 124.81, 1.58);
    const crop = r.breakdown.find((b) => b.category === "Agricultural Produce")!;
    expect(crop.status).toBe("not_calculated");
    expect(crop.zakatDue).toBe(0);
    expect(r.warnings?.[0]).toMatch(/Hanbali/);
    expect(r.totalZakatDue).toBeCloseTo(375, 10);
  });
  it("Hanbali: no debt, crops are computed", () => {
    const r = calculateZakat(preset("hanbali"), assets({ cashOnHand: 20000, cropValueOrWeight: 2000, cropWeightKg: 900 }), 124.81, 1.58);
    expect(r.breakdown.find((b) => b.category === "Agricultural Produce")!.zakatDue).toBeCloseTo(200, 10);
    expect(r.warnings).toBeUndefined();
  });
  it("Hanafi: debt smaller than money leaves livestock due", () => {
    const r = calculateZakat(preset("hanafi"), assets({ cashOnHand: 20000, creditCardBalance: 5000, sheepGoats: 40 }), 124.81, 1.58);
    expect(r.breakdown.find((b) => b.category === "Sheep & Goats")!.zakatDue).toBe(150);
    expect(r.warnings).toBeUndefined();
  });
  it("Hanafi: debt larger than money declines livestock but not crops", () => {
    const r = calculateZakat(preset("hanafi"), assets({ cashOnHand: 1000, creditCardBalance: 5000, sheepGoats: 40, cropValueOrWeight: 1000 }), 124.81, 1.58);
    expect(r.breakdown.find((b) => b.category === "Sheep & Goats")!.status).toBe("not_calculated");
    expect(r.breakdown.find((b) => b.category === "Agricultural Produce")!.zakatDue).toBeCloseTo(100, 10);
    expect(r.warnings?.[0]).toMatch(/Hanafi/);
  });
  it("Maliki: a debt deduction carries the other-assets caveat", () => {
    const r = calculateZakat(preset("maliki"), assets({ cashOnHand: 20000, creditCardBalance: 5000 }), 124.81, 1.58);
    expect(r.warnings?.[0]).toMatch(/Maliki/);
  });
  it("camels due in kind are marked in kind, not exempt", () => {
    const r = calculateZakat(preset("shafii"), assets({ camels: 30 }), 124.81, 1.58);
    expect(r.breakdown.find((b) => b.category === "Camels")!.status).toBe("in_kind");
  });
});

describe("debt deduction base excludes exempt and non-money items", () => {
  it("20,000 cash, 5,000 debt, exempt worn jewellery: 375, not 412.97", () => {
    // (20,000 - 5,000) x 2.5% = 375. The exempt jewellery must not dilute the debt.
    const choices = preset("hanbali"); // jewellery exempt, 12-month debt deduction
    const r = calculateZakat(choices, assets({ cashOnHand: 20000, creditCardBalance: 5000, goldJewelryWeightGrams: 100 }), 124.81, 1.58);
    expect(r.totalZakatDue).toBeCloseTo(375, 10);
    expect(r.totalZakatableWealth).toBeCloseTo(15000, 10);
  });
  it("deferred retirement funds do not dilute the debt", () => {
    const r = calculateZakat(custom("hanafi", { rrspApproach: "defer_to_withdrawal" }), assets({ bankAccounts: 10000, rrsp401kBalance: 90000, creditCardBalance: 2000 }), 100, 1);
    expect(r.totalZakatDue).toBeCloseTo(200, 10); // (10,000 - 2,000) x 2.5%
  });
  it("livestock head counts and crop values are not part of the debt base", () => {
    const r = calculateZakat(preset("hanafi"), assets({ bankAccounts: 10000, creditCardBalance: 2000, sheepGoats: 40, cropValueOrWeight: 1000 }), 100, 1);
    // money: (10,000 - 2,000) x 2.5% = 200; sheep 150; crops 10% of 1,000 = 100
    expect(r.totalZakatDue).toBeCloseTo(450, 10);
  });
});

describe("crops and livestock have their own minimum, independent of the money niṣāb", () => {
  it("40 sheep and 30 cattle are due even when cash is below the niṣāb", () => {
    const r = calculateZakat(preset("hanafi"), assets({ cashOnHand: 100, sheepGoats: 45, cattle: 35 }), 100, 1);
    expect(r.meetsNisab).toBe(false);
    expect(r.totalZakatDue).toBeCloseTo(450, 10); // 1 sheep (150) + 1 tabīʿ (300); cash 0
  });
  it("crops above the minimum are due even when cash is below the niṣāb", () => {
    const r = calculateZakat(preset("shafii"), assets({ cashOnHand: 50, cropValueOrWeight: 4000, cropWeightKg: 900 }), 100, 1);
    expect(r.meetsNisab).toBe(false);
    expect(r.totalZakatDue).toBeCloseTo(400, 10);
  });
  it("Mālikī: debts reduce money, not crops or livestock", () => {
    const r = calculateZakat(preset("maliki"), assets({ cashOnHand: 20000, personalLoans: 20000, sheepGoats: 40, cropValueOrWeight: 1000, cropWeightKg: 700 }), 100, 1);
    expect(r.totalZakatDue).toBeCloseTo(150 + 100, 10);
  });
});

describe("crop minimum is checked against weight in kg", () => {
  it("652 kg exempt, 653 kg due (Sunni presets that apply the minimum)", () => {
    const below = calculateZakat(preset("shafii"), assets({ cropValueOrWeight: 5000, cropWeightKg: 652 }), 100, 1);
    const at = calculateZakat(preset("shafii"), assets({ cropValueOrWeight: 5000, cropWeightKg: 653 }), 100, 1);
    expect(below.totalZakatDue).toBe(0);
    expect(at.totalZakatDue).toBeCloseTo(500, 10);
  });
  it("Jaʿfarī minimum is about 847 kg (Sistani, ruling 1880)", () => {
    const below = calculateZakat(preset("jafari"), assets({ cropValueOrWeight: 5000, cropWeightKg: 846 }), 100, 1);
    const at = calculateZakat(preset("jafari"), assets({ cropValueOrWeight: 5000, cropWeightKg: 847 }), 100, 1);
    expect(below.totalZakatDue).toBe(0);
    expect(at.totalZakatDue).toBeCloseTo(500, 10);
  });
  it("a money value alone is charged, with a note that the minimum was not checked", () => {
    const r = calculateZakat(preset("shafii"), assets({ cropValueOrWeight: 600 }), 100, 1);
    const row = r.breakdown.find((b) => b.category === "Agricultural Produce")!;
    expect(row.zakatDue).toBeCloseTo(60, 10);
    expect(row.notes).toMatch(/not checked/);
  });
});

describe("cattle schedule (hadith of Muʿādh, Sunan Abī Dāwūd 1576; Sistani ruling 1927)", () => {
  const table: [number, number, number][] = [
    // head, tabīʿ, musinnah (collector's choice, Shāfiʿī)
    [29, -1, -1], [30, 1, 0], [39, 1, 0], [40, 0, 1], [59, 0, 1], [60, 2, 0], [69, 2, 0],
    [70, 1, 1], [79, 1, 1], [80, 0, 2], [90, 3, 0], [100, 2, 1], [110, 1, 2], [120, 0, 3], [130, 3, 1], [140, 2, 2],
  ];
  it.each(table)("%i head", (n, t, m) => {
    const d = cattleDue(n, "shafii");
    if (t < 0) { expect(d).toBeNull(); return; }
    expect({ tabi: d!.tabi, musinna: d!.musinna }).toEqual({ tabi: t, musinna: m });
  });
  it("at 120 the owner may give 4 tabīʿ instead (Ḥanbalī, Jaʿfarī)", () => {
    expect(cattleDue(120, "hanbali")).toMatchObject({ tabi: 4, musinna: 0 });
    expect(cattleDue(120, "hanbali")!.alternatives).toEqual([{ tabi: 0, musinna: 3 }]);
    expect(cattleDue(120, "jafari")).toMatchObject({ tabi: 4, musinna: 0 });
  });
});

describe("camel schedule (letter of Abū Bakr, Ṣaḥīḥ al-Bukhārī 1454; Sistani ruling 1925)", () => {
  const pick = (n: number, m: string) => {
    const d = camelsDue(n, m);
    return d && { s: d.sheep, bm: d.bintMakhad, bl: d.bintLabun, h: d.hiqqa, j: d.jadhaa };
  };
  it("Sunni schedule up to 120", () => {
    expect(pick(4, "shafii")).toBeNull();
    expect(pick(5, "shafii")).toEqual({ s: 1, bm: 0, bl: 0, h: 0, j: 0 });
    expect(pick(24, "shafii")).toEqual({ s: 4, bm: 0, bl: 0, h: 0, j: 0 });
    expect(pick(25, "shafii")).toEqual({ s: 0, bm: 1, bl: 0, h: 0, j: 0 });
    expect(pick(36, "shafii")).toEqual({ s: 0, bm: 0, bl: 1, h: 0, j: 0 });
    expect(pick(46, "shafii")).toEqual({ s: 0, bm: 0, bl: 0, h: 1, j: 0 });
    expect(pick(61, "shafii")).toEqual({ s: 0, bm: 0, bl: 0, h: 0, j: 1 });
    expect(pick(76, "shafii")).toEqual({ s: 0, bm: 0, bl: 2, h: 0, j: 0 });
    expect(pick(91, "shafii")).toEqual({ s: 0, bm: 0, bl: 0, h: 2, j: 0 });
    expect(pick(120, "hanafi")).toEqual({ s: 0, bm: 0, bl: 0, h: 2, j: 0 });
  });
  it("above 120, majority: a bint labūn per 40, a ḥiqqah per 50", () => {
    expect(pick(121, "hanbali")).toEqual({ s: 0, bm: 0, bl: 3, h: 0, j: 0 });
    expect(pick(130, "shafii")).toEqual({ s: 0, bm: 0, bl: 2, h: 1, j: 0 });
    expect(pick(140, "maliki")).toEqual({ s: 0, bm: 0, bl: 1, h: 2, j: 0 });
    expect(pick(150, "maliki")).toEqual({ s: 0, bm: 0, bl: 0, h: 3, j: 0 });
    expect(camelsDue(200, "shafii")!.alternatives).toEqual(["5 bint labūn"]);
  });
  it("above 120, Ḥanafī: the schedule restarts (istiʾnāf)", () => {
    expect(pick(124, "hanafi")).toEqual({ s: 0, bm: 0, bl: 0, h: 2, j: 0 });
    expect(pick(125, "hanafi")).toEqual({ s: 1, bm: 0, bl: 0, h: 2, j: 0 });
    expect(pick(140, "hanafi")).toEqual({ s: 4, bm: 0, bl: 0, h: 2, j: 0 });
    expect(pick(145, "hanafi")).toEqual({ s: 0, bm: 1, bl: 0, h: 2, j: 0 });
    expect(pick(150, "hanafi")).toEqual({ s: 0, bm: 0, bl: 0, h: 3, j: 0 });
    expect(pick(175, "hanafi")).toEqual({ s: 0, bm: 1, bl: 0, h: 3, j: 0 });
    expect(pick(186, "hanafi")).toEqual({ s: 0, bm: 0, bl: 1, h: 3, j: 0 });
    expect(pick(196, "hanafi")).toEqual({ s: 0, bm: 0, bl: 0, h: 4, j: 0 });
  });
  it("Jaʿfarī: 25 camels owe five sheep, the first camel is due at 26; 140 is 2 ḥiqqah + 1 bint labūn", () => {
    expect(pick(25, "jafari")).toEqual({ s: 5, bm: 0, bl: 0, h: 0, j: 0 });
    expect(pick(26, "jafari")).toEqual({ s: 0, bm: 1, bl: 0, h: 0, j: 0 });
    expect(pick(140, "jafari")).toEqual({ s: 0, bm: 0, bl: 1, h: 2, j: 0 });
  });
  it("camels due in kind are not priced into the cash total", () => {
    const r = calculateZakat(preset("hanafi"), assets({ camels: 30, cashOnHand: 1000 }), 100, 1);
    expect(r.totalZakatDue).toBeCloseTo(25, 10);
    expect(r.breakdown.find((b) => b.category === "Camels")!.notes).toMatch(/in kind/);
  });
});

describe("sheep schedule", () => {
  it("Sunni: 301 to 399 owe three sheep, 400 owe four (Bukhārī 1454)", () => {
    for (const [n, k] of [[300, 3], [301, 3], [399, 3], [400, 4], [500, 5]] as const) {
      const r = calculateZakat(preset("hanafi"), assets({ sheepGoats: n }), 100, 1);
      expect(r.totalZakatDue, String(n)).toBeCloseTo(k * 150, 10);
    }
  });
  it("Jaʿfarī: 301 to 399 owe four sheep (Sistani ruling 1928)", () => {
    const r = calculateZakat(preset("jafari"), assets({ sheepGoats: 301 }), 100, 1);
    expect(r.totalZakatDue).toBeCloseTo(4 * 150, 10);
  });
});

describe("Jaʿfarī niṣāb follows Sistani (rulings 1912, 1913)", () => {
  it("gold 69.12 g, silver 105 ṣayrafī mithqāls = 483.84 g", () => {
    expect(calculateZakat(preset("jafari", { nisabStandard: "gold" }), defaultAssets, 100, 1).nisabThreshold).toBeCloseTo(6912, 8);
    expect(calculateZakat(preset("jafari", { nisabStandard: "silver" }), defaultAssets, 100, 1).nisabThreshold).toBeCloseTo(483.84, 8);
    // Sunni schools unchanged
    expect(calculateZakat(preset("shafii"), defaultAssets, 100, 1).nisabThreshold).toBe(8500);
  });
});

describe("fallback metal prices", () => {
  it("are dated and come from the same Yahoo futures source as /api/metals", () => {
    expect(FALLBACK_PRICES_AS_OF).toBe("2026-11-13");
    expect(FALLBACK_GOLD_USD_PER_GRAM).toBeCloseTo(FALLBACK_GOLD_USD_PER_OZ / 31.1035, 2);
    expect(FALLBACK_SILVER_USD_PER_GRAM).toBeCloseTo(FALLBACK_SILVER_USD_PER_OZ / 31.1035, 2);
    // calculate.ts defaults use the same stored figures
    const r = calculateZakat(preset("shafii"), defaultAssets);
    expect(r.nisabThreshold).toBeCloseTo(85 * FALLBACK_GOLD_USD_PER_GRAM, 8);
  });
});
