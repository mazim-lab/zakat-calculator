// Worked examples shown on /inheritance. They are COMPUTED at build time with
// the real calculateInheritance function, and tests/inheritance.test.ts checks
// the results against the hand-written arithmetic on the page.
import type { Heirs, Madhab } from "@/lib/inheritance/types";
import type { EstateDeductions } from "@/lib/inheritance/deductions";

export interface WorkedExample {
  id: string;
  title: string;
  madhab: Madhab;
  madhabLabel: string;
  heirs: Heirs;
  heirsLabel: string;
  estate: EstateDeductions;
}

/** Example 1: a family with a spouse, both parents and children. Example figures only. */
export const EXAMPLE_FAMILY: WorkedExample = {
  id: "family",
  title: "A wife, both parents, a son and a daughter",
  madhab: "hanafi",
  madhabLabel: "Ḥanafī",
  heirs: { wife: 1, father: true, mother: true, son: 1, daughter: 1 },
  heirsLabel: "Wife, father, mother, 1 son, 1 daughter",
  estate: { gross: 150000, funeral: 5000, debts: 15000, bequest: 10000 },
};

/** Example 2: the classic ʿawl case. Example figures only. */
export const EXAMPLE_AWL: WorkedExample = {
  id: "awl",
  title: "A husband, the mother and two full sisters (ʿawl)",
  madhab: "shafii",
  madhabLabel: "Shāfiʿī",
  heirs: { husband: 1, mother: true, fullSister: 2 },
  heirsLabel: "Husband, mother, 2 full sisters",
  estate: { gross: 120000, funeral: 0, debts: 0, bequest: 0 },
};
