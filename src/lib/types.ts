export type Madhab = "hanafi" | "maliki" | "shafii" | "hanbali" | "jafari" | "custom";

export type NisabStandard = "gold" | "silver";

export type StockMethod =
  | "full_market_value"
  | "zakatable_assets"
  | "dividends_only"
  | "cri_approximation";

export type RrspApproach =
  | "full_balance"
  | "net_after_tax"
  | "defer_to_withdrawal"
  | "exclude";

export type DebtDeduction =
  | "twelve_months_principal"
  | "single_installment"
  | "hidden_wealth_only"
  | "no_deduction";

export type CryptoTreatment = "like_cash" | "like_trade_goods" | "not_zakatable";

export type YearType = "lunar" | "solar";

export interface MethodologyChoices {
  madhab: Madhab;
  nisabStandard: NisabStandard;
  jewelryZakatable: boolean;
  combineGoldSilver: boolean;
  stockMethod: StockMethod;
  rrspApproach: RrspApproach;
  debtDeduction: DebtDeduction;
  cryptoTreatment: CryptoTreatment;
  yearType: YearType;
  agriculturalMinimum: boolean; // true = requires 5 wasqs, false = any amount
}

export interface AssetInputs {
  // Khums (Ja'fari)
  annualIncome: number;
  annualExpenses: number;

  // Cash & Savings
  cashOnHand: number;
  bankAccounts: number;
  otherLiquid: number;

  // Gold & Silver
  goldWeightGrams: number;
  silverWeightGrams: number;
  goldJewelryWeightGrams: number;
  silverJewelryWeightGrams: number;

  // Investments
  stocksMarketValue: number;
  stocksZakatablePercent: number; // for zakatable assets method
  stocksDividends: number; // for dividends method
  mutualFundsETFs: number;
  bonds: number;
  otherInvestments: number;

  // Real Estate
  rentalIncome: number;
  propertyForSale: number;

  // Business
  businessCash: number;
  inventory: number;
  receivables: number;

  // Tax-Sheltered / Retirement Accounts
  tfsaRothBalance: number;
  tfsaEquityPercent: number; // 0 = all cash/GICs, 100 = all equities
  tfsaZakatableAssetsPercent: number; // zakatable assets rate for equity portion
  rrsp401kBalance: number;
  rrspWithholdingTaxPercent: number;
  rrspEquityPercent: number; // 0 = all cash/GICs, 100 = all equities
  rrspZakatableAssetsPercent: number; // zakatable assets rate for equity portion
  employerMatchVested: number;
  employerMatchUnvested: number;

  // Crypto
  cryptoValue: number;

  // Agricultural
  cropValueOrWeight: number;
  isIrrigated: boolean;

  // Livestock
  sheepGoats: number;
  cattle: number;
  camels: number;

  // Debts — Short-term (due in full within 12 months)
  creditCardBalance: number;
  personalLoans: number; // short-term, callable/due within 12 months
  otherShortTermDebt: number;

  // Debts — Long-term (mortgage, student loans, car loans)
  monthlyMortgagePayment: number;
  monthlyMortgagePrincipal: number; // principal portion only (excl. interest)
  monthlyStudentLoanPayment: number;
  monthlyStudentLoanPrincipal: number;
  monthlyCarLoanPayment: number;
  monthlyCarLoanPrincipal: number;
  monthlyOtherLongTermPayment: number;
  monthlyOtherLongTermPrincipal: number;
}

export interface ZakatBreakdown {
  category: string;
  amount: number;
  rate: number;
  zakatDue: number;
  notes: string;
}

export interface KhumsResult {
  annualIncome: number;
  annualExpenses: number;
  surplus: number;
  khumsDue: number;
  sahmImam: number;
  sahmSadat: number;
}

export interface ZakatResult {
  totalZakatableWealth: number;
  totalZakatDue: number;
  nisabThreshold: number;
  meetsNisab: boolean;
  breakdown: ZakatBreakdown[];
  methodology: string;
  khums?: KhumsResult;
}

export interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export const MADHAB_PRESETS: Record<
  Exclude<Madhab, "custom">,
  Omit<MethodologyChoices, "madhab">
> = {
  jafari: {
    nisabStandard: "gold",
    jewelryZakatable: false,
    combineGoldSilver: false,
    stockMethod: "full_market_value",
    rrspApproach: "exclude",
    debtDeduction: "no_deduction",
    cryptoTreatment: "not_zakatable",
    yearType: "lunar",
    agriculturalMinimum: true,
  },
  hanafi: {
    nisabStandard: "silver",
    jewelryZakatable: true,
    combineGoldSilver: true,
    stockMethod: "full_market_value",
    rrspApproach: "full_balance",
    debtDeduction: "twelve_months_principal",
    cryptoTreatment: "like_cash",
    yearType: "lunar",
    agriculturalMinimum: false,
  },
  maliki: {
    nisabStandard: "gold",
    jewelryZakatable: false,
    combineGoldSilver: false,
    stockMethod: "zakatable_assets",
    rrspApproach: "net_after_tax",
    debtDeduction: "hidden_wealth_only",
    cryptoTreatment: "like_cash",
    yearType: "lunar",
    agriculturalMinimum: true,
  },
  shafii: {
    nisabStandard: "gold",
    jewelryZakatable: false,
    combineGoldSilver: false,
    stockMethod: "zakatable_assets",
    rrspApproach: "defer_to_withdrawal",
    debtDeduction: "no_deduction",
    cryptoTreatment: "like_cash",
    yearType: "lunar",
    agriculturalMinimum: true,
  },
  hanbali: {
    nisabStandard: "gold",
    jewelryZakatable: false,
    combineGoldSilver: false,
    stockMethod: "zakatable_assets",
    rrspApproach: "net_after_tax",
    debtDeduction: "twelve_months_principal",
    cryptoTreatment: "like_cash",
    yearType: "lunar",
    agriculturalMinimum: true,
  },
};

export const STEPS: StepConfig[] = [
  {
    id: "welcome",
    title: "Begin Your Calculation",
    subtitle: "Choose your school of jurisprudence",
    icon: "☪",
  },
  {
    id: "methodology",
    title: "Methodology",
    subtitle: "Configure your calculation preferences",
    icon: "⚖",
  },
  {
    id: "cash",
    title: "Cash & Savings",
    subtitle: "Currency, bank accounts, and liquid assets",
    icon: "💰",
  },
  {
    id: "gold_silver",
    title: "Gold & Silver",
    subtitle: "Precious metals and jewelry",
    icon: "✦",
  },
  {
    id: "investments",
    title: "Investments",
    subtitle: "Stocks, bonds, mutual funds, and more",
    icon: "📈",
  },
  {
    id: "real_estate",
    title: "Real Estate",
    subtitle: "Rental income and property for sale",
    icon: "🏠",
  },
  {
    id: "business",
    title: "Business Assets",
    subtitle: "Cash, inventory, and receivables",
    icon: "🏢",
  },
  {
    id: "tax_sheltered",
    title: "Registered & Retirement",
    subtitle: "TFSA, RRSP, 401(k), IRA, pensions",
    icon: "🏦",
  },
  {
    id: "crypto",
    title: "Cryptocurrency",
    subtitle: "Digital assets and tokens",
    icon: "₿",
  },
  {
    id: "agriculture",
    title: "Agricultural Produce",
    subtitle: "Crops and harvest",
    icon: "🌾",
  },
  {
    id: "livestock",
    title: "Livestock",
    subtitle: "Sheep, cattle, and camels",
    icon: "🐑",
  },
  {
    id: "debts",
    title: "Debts & Liabilities",
    subtitle: "Outstanding obligations",
    icon: "📋",
  },
  {
    id: "khums",
    title: "Khums",
    subtitle: "20% on surplus annual income (Ja'farī)",
    icon: "🕌",
  },
  {
    id: "results",
    title: "Your Zakat",
    subtitle: "Complete calculation summary",
    icon: "🌙",
  },
];
