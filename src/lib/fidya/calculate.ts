// Pure fidya arithmetic.
// The body of calculateFidya is copied VERBATIM from the useMemo in the original
// src/app/fidya/page.tsx (frozen copy: tests/reference/original/pages/fidya.page.tsx.txt,
// lines 37-59). Only the closure variables became named inputs. Proven equal in tests/fidya.test.ts.
// Do not change the arithmetic or the description strings (including the hard-coded "$").
import { FIDYA_WEIGHTS, type Madhab } from "./types";

/** The food types offered by the calculator's select (original page line 33). */
export type FidyaFoodType = "wheat" | "barley" | "dates" | "raisins" | "rice";

export interface FidyaInputs {
  madhab: Madhab;
  missedDays: number;
  costPerMeal: number;
  useWeight: boolean;
  pricePerKg: number;
  foodType: FidyaFoodType;
}

export function calculateFidya({ madhab, missedDays, costPerMeal, useWeight, pricePerKg, foodType }: FidyaInputs) {
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
}

export type FidyaResult = NonNullable<ReturnType<typeof calculateFidya>>;
