// Net estate helper for the inheritance calculator.
// The original calculator asked only for the estate "after all debts, funeral
// costs, and bequests (Waṣiyyah) have been paid". This helper lets the user
// enter those amounts separately and subtracts them in that order. With all
// deductions at 0 the net estate equals the gross estate, which is exactly the
// original behaviour. It does not cap the bequest: it only reports whether the
// bequest is above one third of what is left after funeral costs and debts, so
// the page can show a warning and the user decides.

export interface EstateDeductions {
  gross: number;
  funeral: number;
  debts: number;
  bequest: number;
}

export interface NetEstate {
  /** Gross estate minus funeral costs, debts and bequest, never below 0. */
  net: number;
  /** Amount left after funeral costs and debts, never below 0. */
  afterDebts: number;
  /** One third of afterDebts. */
  oneThirdAfterDebts: number;
  /** True when the bequest is larger than one third of afterDebts. */
  bequestAboveOneThird: boolean;
  /** True when deductions exceed the gross estate. */
  deductionsExceedEstate: boolean;
}

const clean = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function computeNetEstate({ gross, funeral, debts, bequest }: EstateDeductions): NetEstate {
  const g = clean(gross);
  const f = clean(funeral);
  const d = clean(debts);
  const b = clean(bequest);
  const afterDebts = Math.max(0, g - f - d);
  const oneThirdAfterDebts = afterDebts / 3;
  return {
    net: Math.max(0, afterDebts - b),
    afterDebts,
    oneThirdAfterDebts,
    bequestAboveOneThird: b > oneThirdAfterDebts + 1e-9,
    deductionsExceedEstate: f + d + b > g,
  };
}
