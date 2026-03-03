export type Madhab = "hanafi" | "maliki" | "shafii" | "hanbali" | "jafari";

export type FidyaUnit = "wheat" | "barley" | "dates" | "raisins" | "rice" | "cash";

export interface FidyaInputs {
  madhab: Madhab;
  missedDays: number;
  fidyaUnit: FidyaUnit;
  localFoodCostPerMeal: number; // cost of one average meal in user's area
  useCustomAmount: boolean;
  customAmountPerDay: number;
}

export interface FidyaResult {
  perDay: number;
  totalDue: number;
  missedDays: number;
  unit: string;
  methodology: string;
  notes: string[];
}

// Fidya amounts in weight (per day) — classical measures
// weightKg is now a function of the chosen food unit for schools where it varies
export interface FidyaWeightInfo {
  measure: string;
  description: string;
  getWeightKg: (unit: FidyaUnit) => number;
}

export const FIDYA_WEIGHTS: Record<Madhab, FidyaWeightInfo> = {
  hanafi: {
    measure: "Half a ṣāʿ of wheat (approximately 1.6 kg), or one ṣāʿ of barley/dates/raisins (~3.2 kg)",
    description: "The Ḥanafī school uses half a ṣāʿ (an ancient unit of volume, roughly 1.6 kg) of wheat per day, or its monetary equivalent. Alternatively, one full ṣāʿ (~3.2 kg) of barley, dates, or raisins.",
    getWeightKg: (unit) => unit === "wheat" ? 1.6 : unit === "rice" ? 1.6 : 3.2, // wheat/rice = half sa'; barley/dates/raisins = full sa'
  },
  maliki: {
    measure: "One mudd of the predominant local staple food (~0.51 kg)",
    description: "The Mālikī school requires one mudd (a smaller unit, roughly 510 grams) of the predominant staple food of your area for each missed day.",
    getWeightKg: () => 0.51,
  },
  shafii: {
    measure: "One mudd of the predominant local staple food (~0.51 kg)",
    description: "The Shāfiʿī school also requires one mudd (~510g) of staple food per day. The mudd is defined as filling two average-sized cupped hands.",
    getWeightKg: () => 0.51,
  },
  hanbali: {
    measure: "One mudd of wheat (~0.51 kg) or half a ṣāʿ of other staples (~1.6 kg)",
    description: "The Ḥanbalī school requires one mudd of wheat per day. For other staples (barley, dates, raisins), half a ṣāʿ (~1.6 kg) is required.",
    getWeightKg: (unit) => unit === "wheat" ? 0.51 : 1.6, // wheat = one mudd; others = half sa'
  },
  jafari: {
    measure: "One mudd of food (~750g, approximately 3/4 kg)",
    description: "The Jaʿfarī school requires one mudd of food (typically wheat or flour) per day. The Jaʿfarī mudd is slightly larger than the Sunni measurement, approximately 750 grams.",
    getWeightKg: () => 0.75,
  },
};
