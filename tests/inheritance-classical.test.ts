// Classical farāʾiḍ cases, table-driven. Every row carries the source it was
// checked against (all loaded on 2026-11-13). Shares are exact fractions of the
// whole estate; every row must also sum to the estate.
import { describe, it, expect } from "vitest";
import { calculateInheritance } from "@/lib/inheritance/calculate";
import { numberToFraction } from "@/lib/inheritance/fraction";
import type { Heirs, Madhab, CalculationResult } from "@/lib/inheritance/types";

const SUNNI: Madhab[] = ["hanafi", "maliki", "shafii", "hanbali"];
const MSH: Madhab[] = ["maliki", "shafii", "hanbali"];
// Radd rows: the Ḥanafī and Ḥanbalī schools return the surplus to the sharers
// (islamqa.info/ar/answers/184914). The calculator also applies radd for the
// Mālikī and Shāfiʿī schools (see KEPT FOR OWNER), so those rows are pinned to
// the two schools whose classical position they state.
const RADD: Madhab[] = ["hanafi", "hanbali"];
const JAFARI: Madhab[] = ["jafari"];

const S = {
  q4_11: "https://quran.com/4/11",
  q4_12: "https://quran.com/4/12",
  q4_176: "https://quran.com/4/176",
  b6732: "https://sunnah.com/bukhari:6732",
  b6736: "https://sunnah.com/bukhari:6736",
  sisterWithDaughter: "https://islamqa.info/ar/answers/317709",
  fullBlocksPaternal: "https://binbaz.org.sa/fatwas/19189",
  motherSixth: "https://islamqa.info/ar/answers/13632",
  umariyyatan: "https://islamqa.info/ar/answers/566119",
  paternalSister: "https://islamqa.info/ar/answers/160012",
  grandfather: "https://islamqa.info/ar/answers/240582",
  radd: "https://islamqa.info/ar/answers/184914",
  awl8: "https://www.dar-alifta.org/ar/fatwa/details/13421",
  awl27: "https://dar-alifta.org/ar/fatwa/details/14206",
  maternalExcluded: "https://binbaz.org.sa/fatwas/19202",
  sistani1: "https://www.sistani.org/english/book/48/8237/",
  sistani2: "https://www.sistani.org/english/book/48/8238/",
  minhaj: "https://www.sistani.org/arabic/book/16/936/",
  minhajClass2: "https://www.sistani.org/arabic/book/16/938/",
  minhajSpouses: "https://www.sistani.org/arabic/book/16/940/",
  // Muwatta Malik, Kitab al-Fara'id (Malik's own ruling: full siblings share the
  // maternal third, male equal to female); al-Mughni 6/... (Hanafi and Hanbali
  // exclude, Malik and Shafi'i share); Mukhtasar Tuhfat al-Muhtaj (Shafi'i).
  mushtaraka: "https://sunnah.com/malik/27 https://shamela.ws/book/8463/2602 https://shamela.ws/book/20/1094 https://binbaz.org.sa/fatwas/14164",
};

type Row = {
  name: string;
  heirs: Record<string, number | boolean>;
  madhabs: Madhab[];
  expect: Record<string, string>;
  blocked?: string[];
  unresolved?: string;
  source: string;
};

const ROWS: Row[] = [
  // Spouse and children
  { name: "wife + son", heirs: { wife: 1, son: 1 }, madhabs: SUNNI, expect: { wife: "1/8", son: "7/8" }, source: `${S.q4_12} ${S.b6732}` },
  { name: "husband + son", heirs: { husband: true, son: 1 }, madhabs: SUNNI, expect: { husband: "1/4", son: "3/4" }, source: `${S.q4_12} ${S.b6732}` },
  { name: "son + daughter", heirs: { son: 1, daughter: 1 }, madhabs: [...SUNNI, "jafari"], expect: { son: "2/3", daughter: "1/3" }, source: S.q4_11 },
  { name: "husband + daughter (radd)", heirs: { husband: true, daughter: 1 }, madhabs: RADD, expect: { husband: "1/4", daughter: "3/4" }, source: `${S.q4_12} ${S.radd}` },
  { name: "husband + son's son + son's daughter", heirs: { husband: true, sonsSon: 1, sonsDaughter: 1 }, madhabs: SUNNI, expect: { husband: "1/4", sonsSon: "1/2", sonsDaughter: "1/4" }, source: `${S.q4_12} ${S.b6732}` },
  { name: "2 daughters + son's son + son's daughter", heirs: { daughter: 2, sonsSon: 1, sonsDaughter: 1 }, madhabs: SUNNI, expect: { daughter: "2/3", sonsSon: "2/9", sonsDaughter: "1/9" }, source: `${S.q4_11} ${S.b6732}` },
  // Parents
  { name: "wife + father + mother + son", heirs: { wife: 1, father: true, mother: true, son: 1 }, madhabs: SUNNI, expect: { wife: "1/8", father: "1/6", mother: "1/6", son: "13/24" }, source: `${S.q4_11} ${S.q4_12}` },
  { name: "father + mother", heirs: { father: true, mother: true }, madhabs: SUNNI, expect: { mother: "1/3", father: "2/3" }, source: S.q4_11 },
  { name: "father + mother + 2 full brothers (excluded, still reduce the mother)", heirs: { father: true, mother: true, fullBrother: 2 }, madhabs: SUNNI, expect: { mother: "1/6", father: "5/6" }, blocked: ["fullBrother"], source: `${S.q4_11} ${S.motherSixth}` },
  { name: "father + mother + full brother + maternal half-sister", heirs: { father: true, mother: true, fullBrother: 1, maternalHalfSister: 1 }, madhabs: SUNNI, expect: { mother: "1/6", father: "5/6" }, source: `${S.q4_11} ${S.motherSixth}` },
  { name: "father + mother + 1 full brother (one sibling does not reduce)", heirs: { father: true, mother: true, fullBrother: 1 }, madhabs: SUNNI, expect: { mother: "1/3", father: "2/3" }, source: S.q4_11 },
  { name: "husband + father + mother (first ʿUmariyyah)", heirs: { husband: true, father: true, mother: true }, madhabs: SUNNI, expect: { husband: "1/2", mother: "1/6", father: "1/3" }, source: S.umariyyatan },
  { name: "wife + father + mother (second ʿUmariyyah)", heirs: { wife: 1, father: true, mother: true }, madhabs: SUNNI, expect: { wife: "1/4", mother: "1/4", father: "1/2" }, source: S.umariyyatan },
  { name: "daughter + father", heirs: { daughter: 1, father: true }, madhabs: SUNNI, expect: { daughter: "1/2", father: "1/2" }, source: `${S.q4_11} ${S.b6732}` },
  { name: "2 daughters + father + mother", heirs: { daughter: 2, father: true, mother: true }, madhabs: SUNNI, expect: { daughter: "2/3", father: "1/6", mother: "1/6" }, source: S.q4_11 },
  { name: "daughter + mother (radd)", heirs: { daughter: 1, mother: true }, madhabs: RADD, expect: { daughter: "3/4", mother: "1/4" }, source: `${S.q4_11} ${S.radd}` },
  { name: "both grandmothers + 2 daughters (radd)", heirs: { paternalGrandmother: true, maternalGrandmother: true, daughter: 2 }, madhabs: RADD, expect: { daughter: "4/5", paternalGrandmother: "1/10", maternalGrandmother: "1/10" }, source: `${S.q4_11} ${S.radd}` },
  // Siblings as residuaries
  { name: "wife + full brother", heirs: { wife: 1, fullBrother: 1 }, madhabs: SUNNI, expect: { wife: "1/4", fullBrother: "3/4" }, source: `${S.q4_12} ${S.b6732}` },
  { name: "daughter + full brother", heirs: { daughter: 1, fullBrother: 1 }, madhabs: SUNNI, expect: { daughter: "1/2", fullBrother: "1/2" }, source: `${S.q4_11} ${S.b6732}` },
  { name: "full brother + full sister (kalālah, 4:176)", heirs: { fullBrother: 1, fullSister: 1 }, madhabs: [...SUNNI, "jafari"], expect: { fullBrother: "2/3", fullSister: "1/3" }, source: S.q4_176 },
  { name: "wife + paternal half-brother + paternal half-sister", heirs: { wife: 1, paternalHalfBrother: 1, paternalHalfSister: 1 }, madhabs: SUNNI, expect: { wife: "1/4", paternalHalfBrother: "1/2", paternalHalfSister: "1/4" }, source: `${S.q4_176} ${S.paternalSister}` },
  { name: "full brother + paternal half-brother", heirs: { fullBrother: 1, paternalHalfBrother: 1 }, madhabs: SUNNI, expect: { fullBrother: "1" }, blocked: ["paternalHalfBrother"], source: S.fullBlocksPaternal },
  // Sisters with daughters
  { name: "daughter + full sister", heirs: { daughter: 1, fullSister: 1 }, madhabs: SUNNI, expect: { daughter: "1/2", fullSister: "1/2" }, source: `${S.b6736} ${S.sisterWithDaughter}` },
  { name: "daughter + son's daughter + full sister (Ibn Masʿūd)", heirs: { daughter: 1, sonsDaughter: 1, fullSister: 1 }, madhabs: SUNNI, expect: { daughter: "1/2", sonsDaughter: "1/6", fullSister: "1/3" }, source: S.b6736 },
  { name: "2 daughters + son's daughter + full brother", heirs: { daughter: 2, sonsDaughter: 1, fullBrother: 1 }, madhabs: SUNNI, expect: { daughter: "2/3", fullBrother: "1/3" }, blocked: ["sonsDaughter"], source: `${S.q4_11} ${S.b6732}` },
  { name: "daughter + full sister + paternal half-brother", heirs: { daughter: 1, fullSister: 1, paternalHalfBrother: 1 }, madhabs: SUNNI, expect: { daughter: "1/2", fullSister: "1/2" }, blocked: ["paternalHalfBrother"], source: S.sisterWithDaughter },
  // Kalālah: sisters' fixed shares, ʿawl
  { name: "husband + full sister", heirs: { husband: true, fullSister: 1 }, madhabs: SUNNI, expect: { husband: "1/2", fullSister: "1/2" }, source: `${S.q4_12} ${S.q4_176}` },
  { name: "husband + 2 full sisters (ʿawl to 7)", heirs: { husband: true, fullSister: 2 }, madhabs: SUNNI, expect: { husband: "3/7", fullSister: "4/7" }, source: `${S.q4_176} ${S.awl8}` },
  { name: "husband + mother + 2 full sisters (ʿawl to 8)", heirs: { husband: true, mother: true, fullSister: 2 }, madhabs: SUNNI, expect: { husband: "3/8", mother: "1/8", fullSister: "1/2" }, source: S.awl8 },
  { name: "wife + 2 daughters + father + mother (ʿawl 24 to 27)", heirs: { wife: 1, daughter: 2, father: true, mother: true }, madhabs: SUNNI, expect: { wife: "1/9", daughter: "16/27", father: "4/27", mother: "4/27" }, source: S.awl27 },
  { name: "husband + full sister + paternal half-sister (1/6 completes two-thirds, ʿawl to 7)", heirs: { husband: true, fullSister: 1, paternalHalfSister: 1 }, madhabs: SUNNI, expect: { husband: "3/7", fullSister: "3/7", paternalHalfSister: "1/7" }, source: S.paternalSister },
  { name: "husband + 2 full sisters + paternal half-sister", heirs: { husband: true, fullSister: 2, paternalHalfSister: 1 }, madhabs: SUNNI, expect: { husband: "3/7", fullSister: "4/7" }, blocked: ["paternalHalfSister"], source: S.paternalSister },
  { name: "2 full sisters + paternal half-brother + paternal half-sister", heirs: { fullSister: 2, paternalHalfBrother: 1, paternalHalfSister: 1 }, madhabs: SUNNI, expect: { fullSister: "2/3", paternalHalfBrother: "2/9", paternalHalfSister: "1/9" }, source: S.paternalSister },
  // Maternal half-siblings (4:12)
  { name: "husband + mother + maternal half-brother", heirs: { husband: true, mother: true, maternalHalfBrother: 1 }, madhabs: SUNNI, expect: { husband: "1/2", mother: "1/3", maternalHalfBrother: "1/6" }, source: S.q4_12 },
  { name: "full brother + maternal half-brother + maternal half-sister", heirs: { fullBrother: 1, maternalHalfBrother: 1, maternalHalfSister: 1 }, madhabs: SUNNI, expect: { fullBrother: "2/3", maternalHalfBrother: "1/6", maternalHalfSister: "1/6" }, source: S.q4_12 },
  { name: "wife + full brother + 2 maternal half-brothers", heirs: { wife: 1, fullBrother: 1, maternalHalfBrother: 2 }, madhabs: SUNNI, expect: { wife: "1/4", maternalHalfBrother: "1/3", fullBrother: "5/12" }, source: S.q4_12 },
  { name: "daughter + full brother + maternal half-brother", heirs: { daughter: 1, fullBrother: 1, maternalHalfBrother: 1 }, madhabs: SUNNI, expect: { daughter: "1/2", fullBrother: "1/2" }, blocked: ["maternalHalfBrother"], source: `${S.q4_12} ${S.maternalExcluded}` },
  { name: "husband + 2 maternal half-sisters (radd)", heirs: { husband: true, maternalHalfSister: 2 }, madhabs: RADD, expect: { husband: "1/2", maternalHalfSister: "1/2" }, source: `${S.q4_12} ${S.radd}` },
  // Grandfather
  { name: "grandfather + full brother (Ḥanafī: excludes)", heirs: { paternalGrandfather: true, fullBrother: 1 }, madhabs: ["hanafi"], expect: { paternalGrandfather: "1" }, blocked: ["fullBrother"], source: S.grandfather },
  { name: "grandfather + full brother (muqāsamah)", heirs: { paternalGrandfather: true, fullBrother: 1 }, madhabs: MSH, expect: { paternalGrandfather: "1/2", fullBrother: "1/2" }, source: S.grandfather },
  { name: "grandfather + maternal half-sister + full brother", heirs: { paternalGrandfather: true, maternalHalfSister: 1, fullBrother: 1 }, madhabs: MSH, expect: { paternalGrandfather: "1/2", fullBrother: "1/2" }, blocked: ["maternalHalfSister"], source: `${S.grandfather} ${S.motherSixth}` },
  { name: "mother + grandfather + full sister", heirs: { mother: true, paternalGrandfather: true, fullSister: 1 }, madhabs: MSH, expect: { mother: "1/3", paternalGrandfather: "4/9", fullSister: "2/9" }, source: S.grandfather },
  { name: "wife + grandfather + 2 full brothers + full sister (1/3 of remainder)", heirs: { wife: 1, paternalGrandfather: true, fullBrother: 2, fullSister: 1 }, madhabs: MSH, expect: { wife: "1/4", paternalGrandfather: "1/4", fullBrother: "2/5", fullSister: "1/10" }, source: S.grandfather },
  { name: "al-Akdariyyah", heirs: { husband: true, mother: true, paternalGrandfather: true, fullSister: 1 }, madhabs: MSH, expect: { husband: "1/3", mother: "2/9", paternalGrandfather: "8/27", fullSister: "4/27" }, source: S.grandfather },
  { name: "husband + mother + grandfather + full sister (Ḥanafī)", heirs: { husband: true, mother: true, paternalGrandfather: true, fullSister: 1 }, madhabs: ["hanafi"], expect: { husband: "1/2", mother: "1/3", paternalGrandfather: "1/6" }, blocked: ["fullSister"], source: S.grandfather },
  { name: "al-Muʿāddah: grandfather + full brother + paternal half-brother", heirs: { paternalGrandfather: true, fullBrother: 1, paternalHalfBrother: 1 }, madhabs: MSH, expect: { paternalGrandfather: "1/3", fullBrother: "2/3" }, blocked: ["paternalHalfBrother"], source: S.grandfather },
  { name: "al-Muʿāddah: grandfather + full sister + paternal half-brother", heirs: { paternalGrandfather: true, fullSister: 1, paternalHalfBrother: 1 }, madhabs: MSH, expect: { paternalGrandfather: "2/5", fullSister: "1/2", paternalHalfBrother: "1/10" }, source: S.grandfather },

  // Jaʿfarī (Sistani)
  { name: "Jaʿfarī: father + mother", heirs: { father: true, mother: true }, madhabs: JAFARI, expect: { mother: "1/3", father: "2/3" }, source: `${S.sistani1} (ruling 2749)` },
  { name: "Jaʿfarī: father + mother + 2 full brothers", heirs: { father: true, mother: true, fullBrother: 2 }, madhabs: JAFARI, expect: { mother: "1/6", father: "5/6" }, blocked: ["fullBrother"], source: `${S.sistani1} (ruling 2749)` },
  { name: "Jaʿfarī: father + mother + 1 brother + 1 sister (not enough to reduce)", heirs: { father: true, mother: true, fullBrother: 1, fullSister: 1 }, madhabs: JAFARI, expect: { mother: "1/3", father: "2/3" }, source: `${S.sistani1} (ruling 2749)` },
  { name: "Jaʿfarī: father + mother + 2 maternal half-brothers (do not reduce)", heirs: { father: true, mother: true, maternalHalfBrother: 2 }, madhabs: JAFARI, expect: { mother: "1/3", father: "2/3" }, source: `${S.minhaj} (masʾalah 990)` },
  { name: "Jaʿfarī: father + mother + 4 paternal half-sisters", heirs: { father: true, mother: true, paternalHalfSister: 4 }, madhabs: JAFARI, expect: { mother: "1/6", father: "5/6" }, source: `${S.sistani1} (ruling 2749)` },
  { name: "Jaʿfarī: one daughter + father", heirs: { daughter: 1, father: true }, madhabs: JAFARI, expect: { daughter: "3/4", father: "1/4" }, source: `${S.sistani1} (ruling 2754)` },
  { name: "Jaʿfarī: 2 daughters + mother", heirs: { daughter: 2, mother: true }, madhabs: JAFARI, expect: { daughter: "4/5", mother: "1/5" }, source: `${S.sistani1} (ruling 2755)` },
  { name: "Jaʿfarī: daughter + father + mother", heirs: { daughter: 1, father: true, mother: true }, madhabs: JAFARI, expect: { daughter: "3/5", father: "1/5", mother: "1/5" }, source: `${S.sistani1} (ruling 2750)` },
  { name: "Jaʿfarī: daughter + father + mother + 2 brothers (1/30 settled by agreement)", heirs: { daughter: 1, father: true, mother: true, fullBrother: 2 }, madhabs: JAFARI, expect: { daughter: "3/5", father: "1/5", mother: "1/6" }, unresolved: "1/30", source: `${S.sistani1} (ruling 2750)` },
  { name: "Jaʿfarī: father + mother + son", heirs: { father: true, mother: true, son: 1 }, madhabs: JAFARI, expect: { father: "1/6", mother: "1/6", son: "2/3" }, source: `${S.sistani1} (ruling 2751)` },
  { name: "Jaʿfarī: husband + father + mother (no ʿUmariyyah)", heirs: { husband: true, father: true, mother: true }, madhabs: JAFARI, expect: { husband: "1/2", mother: "1/3", father: "1/6" }, source: `${S.minhaj} (masʾalah 989)` },
  { name: "Jaʿfarī: wife + father + mother", heirs: { wife: 1, father: true, mother: true }, madhabs: JAFARI, expect: { wife: "1/4", mother: "1/3", father: "5/12" }, source: `${S.minhaj} (masʾalah 989)` },
  { name: "Jaʿfarī: husband + daughter + father + mother (shortfall on the daughter)", heirs: { husband: true, daughter: 1, father: true, mother: true }, madhabs: JAFARI, expect: { husband: "1/4", father: "1/6", mother: "1/6", daughter: "5/12" }, source: `${S.minhaj} (masʾalah 997)` },
  { name: "Jaʿfarī: full brother + maternal half-sister", heirs: { fullBrother: 1, maternalHalfSister: 1 }, madhabs: JAFARI, expect: { fullBrother: "5/6", maternalHalfSister: "1/6" }, source: `${S.sistani2} (ruling 2761)` },
  { name: "Jaʿfarī: full brother + 2 maternal half-brothers", heirs: { fullBrother: 1, maternalHalfBrother: 2 }, madhabs: JAFARI, expect: { fullBrother: "2/3", maternalHalfBrother: "1/3" }, source: `${S.sistani2} (ruling 2762)` },
  { name: "Jaʿfarī: full brother + paternal half-brother", heirs: { fullBrother: 1, paternalHalfBrother: 1 }, madhabs: JAFARI, expect: { fullBrother: "1" }, blocked: ["paternalHalfBrother"], source: `${S.sistani2} (ruling 2759)` },
  { name: "Jaʿfarī: paternal grandmother + maternal half-brother", heirs: { paternalGrandmother: true, maternalHalfBrother: 1 }, madhabs: JAFARI, expect: { paternalGrandmother: "5/6", maternalHalfBrother: "1/6" }, source: `${S.sistani2} (ruling 2771, case 5)` },
  { name: "Jaʿfarī: paternal grandfather + full brother (all male, father's side: equal)", heirs: { paternalGrandfather: true, fullBrother: 1 }, madhabs: JAFARI, expect: { paternalGrandfather: "1/2", fullBrother: "1/2" }, source: `${S.sistani2} (ruling 2771, cases 2-3)` },
  { name: "Jaʿfarī: paternal grandparents + maternal grandmother", heirs: { paternalGrandfather: true, paternalGrandmother: true, maternalGrandmother: true }, madhabs: JAFARI, expect: { paternalGrandfather: "4/9", paternalGrandmother: "2/9", maternalGrandmother: "1/3" }, source: `${S.sistani2} (ruling 2769)` },
  { name: "Jaʿfarī: maternal grandmother + paternal half-sister (1/6 settled by agreement)", heirs: { maternalGrandmother: true, paternalHalfSister: 1 }, madhabs: JAFARI, expect: { maternalGrandmother: "1/3", paternalHalfSister: "1/2" }, unresolved: "1/6", source: `${S.sistani2} (ruling 2771, case 6)` },
  // Senior review additions (hand-worked by the reviewer).
  { name: "al-Mushtarakah, Ḥanafī and Ḥanbalī: full brother gets nothing", heirs: { husband: true, mother: true, maternalHalfBrother: 2, fullBrother: 1 }, madhabs: ["hanafi", "hanbali"], expect: { husband: "1/2", mother: "1/6", maternalHalfBrother: "1/3" }, blocked: ["fullBrother"], source: S.mushtaraka },
  { name: "al-Mushtarakah, Mālikī and Shāfiʿī: full brother shares the 1/3 per head", heirs: { husband: true, mother: true, maternalHalfBrother: 2, fullBrother: 1 }, madhabs: ["maliki", "shafii"], expect: { husband: "1/2", mother: "1/6", maternalHalfBrother: "2/9", fullBrother: "1/9" }, source: S.mushtaraka },
  { name: "al-Mushtarakah, Mālikī and Shāfiʿī: full brother and sister share per head", heirs: { husband: true, mother: true, maternalHalfSister: 2, fullBrother: 1, fullSister: 1 }, madhabs: ["maliki", "shafii"], expect: { husband: "1/2", mother: "1/6", maternalHalfSister: "1/6", fullBrother: "1/12", fullSister: "1/12" }, source: S.mushtaraka },
];

const ESTATE = 120000;
const run = (h: Record<string, number | boolean>, m: Madhab): CalculationResult =>
  calculateInheritance(ESTATE, JSON.parse(JSON.stringify(h)) as Heirs, m);

describe("classical cases (table-driven, sourced)", () => {
  it("has at least 40 rows, each with a source URL", () => {
    expect(ROWS.length).toBeGreaterThanOrEqual(40);
    for (const r of ROWS) expect(r.source, r.name).toMatch(/https:\/\//);
  });

  for (const row of ROWS) {
    for (const m of row.madhabs) {
      it(`${row.name} [${m}]`, () => {
        const r = run(row.heirs, m);
        for (const [heir, frac] of Object.entries(row.expect)) {
          const s = r.shares.find((x) => x.heir === heir)?.share ?? 0;
          expect(numberToFraction(s), `${heir}`).toBe(frac);
        }
        // No heir outside the expectation receives anything.
        for (const s of r.shares) {
          if (!(s.heir in row.expect)) expect(s.share ?? 0, `unexpected share for ${s.heir}`).toBe(0);
        }
        for (const b of row.blocked ?? []) expect(r.blocked.map((x) => x.heir), `blocked ${b}`).toContain(b);
        if (row.unresolved) expect(numberToFraction((r.unresolvedAmount ?? 0) / ESTATE)).toBe(row.unresolved);
        else expect(r.unresolvedAmount ?? 0).toBe(0);
        const total = r.totalShares + (r.baytAlMalAmount ?? 0) / ESTATE + (r.unresolvedAmount ?? 0) / ESTATE;
        expect(total).toBeCloseTo(1, 12);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// Property test: no heir set produces a negative share, a share above 100%, or
// a distribution that does not account for exactly the whole estate.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("property: every heir set allocates exactly the estate", () => {
  const COUNT_HEIRS = ["son", "daughter", "fullBrother", "fullSister", "paternalHalfBrother", "paternalHalfSister", "maternalHalfBrother", "maternalHalfSister", "sonsSon", "sonsDaughter"];
  const BOOL_HEIRS = ["father", "mother", "paternalGrandfather", "paternalGrandmother", "maternalGrandmother"];
  const rand = mulberry32(20261113);
  const sets: Record<string, number | boolean>[] = [];
  for (let i = 0; i < 4000; i++) {
    const h: Record<string, number | boolean> = {};
    const spouse = rand();
    if (spouse < 0.3) h.husband = true; else if (spouse < 0.6) h.wife = 1 + Math.floor(rand() * 4);
    for (const k of BOOL_HEIRS) if (rand() < 0.3) h[k] = true;
    for (const k of COUNT_HEIRS) if (rand() < 0.25) h[k] = 1 + Math.floor(rand() * 4);
    sets.push(h);
  }

  for (const m of ["hanafi", "maliki", "shafii", "hanbali", "jafari"] as Madhab[]) {
    it(`4000 random heir sets [${m}]`, () => {
      for (const h of sets) {
        const r = run(h, m);
        for (const s of r.shares) {
          const v = s.share ?? 0;
          expect(v, JSON.stringify(h)).toBeGreaterThanOrEqual(0);
          expect(v, JSON.stringify(h)).toBeLessThanOrEqual(1 + 1e-12);
          expect(Number.isFinite(s.amount)).toBe(true);
        }
        expect(r.baytAlMalAmount ?? 0).toBeGreaterThanOrEqual(0);
        expect(r.unresolvedAmount ?? 0).toBeGreaterThanOrEqual(0);
        const total = r.totalShares + (r.baytAlMalAmount ?? 0) / ESTATE + (r.unresolvedAmount ?? 0) / ESTATE;
        expect(total, JSON.stringify(h)).toBeCloseTo(1, 9);
      }
    });
  }
});
