// Default calculator state, copied VERBATIM from the original /zakat page
// (tests/reference/original/pages/zakat.page.tsx.txt, lines 38-91).
// tests/zakat.test.ts checks these against the frozen original.
import { AssetInputs, MethodologyChoices, MADHAB_PRESETS } from "@/lib/types";

export const defaultAssets: AssetInputs = {
  annualIncome: 0,
  annualExpenses: 0,
  cashOnHand: 0,
  bankAccounts: 0,
  otherLiquid: 0,
  goldWeightGrams: 0,
  silverWeightGrams: 0,
  goldJewelryWeightGrams: 0,
  goldJewelryKarat: 22,
  silverJewelryWeightGrams: 0,
  stocksMarketValue: 0,
  stocksZakatablePercent: 30,
  stocksDividends: 0,
  mutualFundsETFs: 0,
  bonds: 0,
  otherInvestments: 0,
  rentalIncome: 0,
  propertyForSale: 0,
  businessCash: 0,
  inventory: 0,
  receivables: 0,
  tfsaRothBalance: 0,
  tfsaEquityPercent: 100,
  tfsaZakatableAssetsPercent: 30,
  rrsp401kBalance: 0,
  rrspWithholdingTaxPercent: 30,
  rrspEquityPercent: 100,
  rrspZakatableAssetsPercent: 30,
  employerMatchVested: 0,
  employerMatchUnvested: 0,
  cryptoValue: 0,
  cropValueOrWeight: 0,
  isIrrigated: false,
  sheepGoats: 0,
  cattle: 0,
  camels: 0,
  creditCardBalance: 0,
  personalLoans: 0,
  otherShortTermDebt: 0,
  monthlyMortgagePayment: 0,
  monthlyMortgagePrincipal: 0,
  monthlyStudentLoanPayment: 0,
  monthlyStudentLoanPrincipal: 0,
  monthlyCarLoanPayment: 0,
  monthlyCarLoanPrincipal: 0,
  monthlyOtherLongTermPayment: 0,
  monthlyOtherLongTermPrincipal: 0,
};

export const defaultChoices: MethodologyChoices = {
  madhab: "hanafi",
  ...MADHAB_PRESETS.hanafi,
};

/**
 * Initial metal prices before /api/metals answers (original lines 99-101).
 * These are the March 2026 fallback figures; the page flags them as placeholders.
 */
export const INITIAL_METAL_PRICES = {
  goldPerGram: 167, silverPerGram: 2.76, goldPerOz: 5194, silverPerOz: 85.85, source: "fallback" as const, timestamp: 0,
};
