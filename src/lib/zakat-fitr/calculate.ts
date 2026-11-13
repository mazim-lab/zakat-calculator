// Pure Zakat al-Fiṭr arithmetic.
// The body of calculateFitr is copied VERBATIM from the useMemo in the original
// src/app/zakat-fitr/page.tsx (frozen copy: tests/reference/original/pages/zakat-fitr.page.tsx.txt,
// lines 41-60). Only the closure variables became named inputs. Proven equal in tests/fitr.test.ts.
// Do not change the arithmetic or the method strings (including the hard-coded "$").
import type { FitrAmountInfo } from "./types";

export interface FitrInputs {
  /** FITR_AMOUNTS[madhab] */
  fitrInfo: Pick<FitrAmountInfo, "weightKg">;
  /** adults + children + otherDependents */
  totalPeople: number;
  useWeight: boolean;
  pricePerKg: number;
  costPerPerson: number;
}

export interface FitrResult {
  perPerson: number;
  total: number;
  totalPeople: number;
  method: string;
}

export function calculateFitr({ fitrInfo, totalPeople, useWeight, pricePerKg, costPerPerson }: FitrInputs): FitrResult | null {
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
}
