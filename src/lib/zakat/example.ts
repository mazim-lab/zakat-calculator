// Inputs for the worked example on the /zakat page. The page computes the
// result at build time by calling calculateZakat() with these values, so the
// arithmetic shown is always the calculator's own. Prices are EXAMPLES only.
import type { AssetInputs, Madhab, MethodologyChoices } from "@/lib/types";
import { MADHAB_PRESETS } from "@/lib/types";
import { defaultAssets } from "./defaults";

/** Example prices in USD per gram. Not current market prices. */
export const EXAMPLE_GOLD_PER_GRAM = 120;
export const EXAMPLE_SILVER_PER_GRAM = 1.5;
export const EXAMPLE_CURRENCY = "USD";

export const EXAMPLE_ASSETS: AssetInputs = {
  ...defaultAssets,
  cashOnHand: 2000,
  bankAccounts: 18000,
  goldJewelryWeightGrams: 40,
  goldJewelryKarat: 22,
  stocksMarketValue: 15000,
  tfsaRothBalance: 10000, // defaults: 100% equities, 30% zakatable assets rate
  creditCardBalance: 1200,
  monthlyMortgagePrincipal: 500,
};

/** Plain-language list of the example inputs, for the page. */
export const EXAMPLE_INPUT_ROWS: { label: string; value: string }[] = [
  { label: "Cash at home", value: "$2,000" },
  { label: "Bank accounts", value: "$18,000" },
  { label: "Gold jewelry, worn", value: "40 g, 22 karat" },
  { label: "Shares (market value)", value: "$15,000" },
  { label: "TFSA / Roth IRA, all in index funds", value: "$10,000" },
  { label: "Credit card balance", value: "$1,200" },
  { label: "Mortgage principal per month", value: "$500" },
];

export function exampleChoices(madhab: Exclude<Madhab, "custom">): MethodologyChoices {
  return { madhab, ...MADHAB_PRESETS[madhab] };
}

export const EXAMPLE_SCHOOLS: Exclude<Madhab, "custom">[] = ["hanafi", "maliki", "shafii", "hanbali", "jafari"];
