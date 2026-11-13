
import { Heirs, CalculationResult, Share, Madhab } from './types';

// --- Helper Functions ---
function hasAnyHeirs(heirs: Heirs): boolean {
  return Object.values(heirs).some(value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return false;
  });
}

// --- Simple Fraction Class ---
class SimpleFraction {
  constructor(public numerator: number, public denominator: number) {
    if (denominator === 0) {
      throw new Error("Denominator cannot be zero.");
    }
  }

  static gcd(a: number, b: number): number {
    return b === 0 ? a : SimpleFraction.gcd(b, a % b);
  }

  simplify(): SimpleFraction {
    const commonDivisor = SimpleFraction.gcd(Math.abs(this.numerator), Math.abs(this.denominator));
    let num = this.numerator / commonDivisor;
    let den = this.denominator / commonDivisor;
    // Normalize: keep sign in the numerator, denominator always positive
    if (den < 0) { num = -num; den = -den; }
    return new SimpleFraction(num, den);
  }

  add(other: SimpleFraction): SimpleFraction {
    const newNumerator = this.numerator * other.denominator + other.numerator * this.denominator;
    const newDenominator = this.denominator * other.denominator;
    return new SimpleFraction(newNumerator, newDenominator).simplify();
  }
  
  sub(other: SimpleFraction): SimpleFraction {
    const newNumerator = this.numerator * other.denominator - other.numerator * this.denominator;
    const newDenominator = this.denominator * other.denominator;
    return new SimpleFraction(newNumerator, newDenominator).simplify();
  }

  mul(other: SimpleFraction | number): SimpleFraction {
      if(typeof other === 'number'){
          return new SimpleFraction(this.numerator * other, this.denominator).simplify();
      }
    return new SimpleFraction(this.numerator * other.numerator, this.denominator * other.denominator).simplify();
  }

  div(other: SimpleFraction | number): SimpleFraction {
     if(typeof other === 'number'){
         if(other === 0) throw new Error("Cannot divide by zero.");
          return new SimpleFraction(this.numerator, this.denominator * other).simplify();
      }
    if (other.numerator === 0) {
      throw new Error("Cannot divide by zero.");
    }
    return new SimpleFraction(this.numerator * other.denominator, this.denominator * other.numerator).simplify();
  }

  valueOf(): number {
    return this.numerator / this.denominator;
  }
  
  toFractionString(): string {
      if(this.denominator === 1) return this.numerator.toString();
      return `${this.numerator}/${this.denominator}`;
  }
}


// --- Ja'fari Calculation (class-based, no 'asabah, no 'awl) ---
function calculateJafari(
  estate: number,
  heirs: Heirs
): CalculationResult {
  const shares: Partial<Record<keyof Heirs, SimpleFraction>> = {};
  const reasons: Partial<Record<keyof Heirs, string>> = {};
  const blockedHeirs: (keyof Heirs)[] = [];
  const initialHeirs = { ...heirs };

  // Check for no heirs at all
  if (!hasAnyHeirs(heirs)) {
    return {
      shares: [],
      blocked: [],
      totalShares: 0,
      wasAwlApplied: false,
      wasRaddApplied: false,
      baytAlMalAmount: estate,
      baytAlMalExplanation: "No eligible heirs were selected. In Islamic law, when there are no heirs, the entire estate goes to Bayt al-Māl (بيت المال — the public treasury).",
      notes: [
        "Jaʿfarī inheritance uses a class-based system: Class 1 (parents/children) blocks Class 2 (grandparents/siblings), which blocks Class 3 (uncles/aunts).",
        "The Jaʿfarī school rejects ʿaṣabah (residuary heirs). Surplus always returns to fixed-share heirs via radd.",
        "ʿAwl (proportional reduction) is not applied in Jaʿfarī fiqh.",
      ],
    };
  }

  // Ja'fari uses a class system:
  // Class 1: Parents + Children (+ grandchildren via representation)
  // Class 2: Grandparents + Siblings (+ their descendants)
  // Class 3: Uncles + Aunts (+ their descendants)
  // A higher class completely blocks all lower classes.
  // Spouse always inherits regardless of class.

  const hasClass1 =
    heirs.father || heirs.mother ||
    (heirs.son ?? 0) > 0 || (heirs.daughter ?? 0) > 0 ||
    (heirs.sonsSon ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0;

  const hasClass2 =
    heirs.paternalGrandfather || heirs.paternalGrandmother || heirs.maternalGrandmother ||
    (heirs.fullBrother ?? 0) > 0 || (heirs.fullSister ?? 0) > 0 ||
    (heirs.paternalHalfBrother ?? 0) > 0 || (heirs.paternalHalfSister ?? 0) > 0 ||
    (heirs.maternalHalfBrother ?? 0) > 0 || (heirs.maternalHalfSister ?? 0) > 0;

  // Block lower classes
  if (hasClass1) {
    const class2Heirs: (keyof Heirs)[] = [
      'paternalGrandfather', 'paternalGrandmother', 'maternalGrandmother',
      'fullBrother', 'fullSister', 'paternalHalfBrother', 'paternalHalfSister',
      'maternalHalfBrother', 'maternalHalfSister',
    ];
    for (const h of class2Heirs) {
      if (heirs[h]) {
        blockedHeirs.push(h);
        reasons[h] = "Blocked: Class 2 heirs are excluded when Class 1 heirs (parents/children) exist (Jaʿfarī class system).";
        delete heirs[h];
      }
    }
  }

  // In Ja'fari, children block grandchildren (no representation when children alive)
  if ((heirs.son ?? 0) > 0 || (heirs.daughter ?? 0) > 0) {
    if (heirs.sonsSon) { blockedHeirs.push('sonsSon'); reasons.sonsSon = "Blocked by the presence of sons/daughters."; delete heirs.sonsSon; }
    if (heirs.sonsDaughter) { blockedHeirs.push('sonsDaughter'); reasons.sonsDaughter = "Blocked by the presence of sons/daughters."; delete heirs.sonsDaughter; }
  }

  // Mother blocks grandmothers
  if (heirs.mother) {
    if (heirs.paternalGrandmother) { blockedHeirs.push('paternalGrandmother'); reasons.paternalGrandmother = "Blocked by the mother."; delete heirs.paternalGrandmother; }
    if (heirs.maternalGrandmother) { blockedHeirs.push('maternalGrandmother'); reasons.maternalGrandmother = "Blocked by the mother."; delete heirs.maternalGrandmother; }
  }
  // Father blocks paternal grandfather
  if (heirs.father && heirs.paternalGrandfather) {
    blockedHeirs.push('paternalGrandfather'); reasons.paternalGrandfather = "Blocked by the father."; delete heirs.paternalGrandfather;
  }

  const hasDescendants = (heirs.son ?? 0) > 0 || (heirs.daughter ?? 0) > 0 || (heirs.sonsSon ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0;

  // --- Spouse shares (always inherit) ---
  if (heirs.husband) {
    shares.husband = hasDescendants ? new SimpleFraction(1, 4) : new SimpleFraction(1, 2);
    reasons.husband = `Receives ${shares.husband.toFractionString()}` + (hasDescendants ? " (descendants present)." : " (no descendants).");
  }
  if (heirs.wife) {
    shares.wife = hasDescendants ? new SimpleFraction(1, 8) : new SimpleFraction(1, 4);
    reasons.wife = `Receives ${shares.wife.toFractionString()}` + (hasDescendants ? " (descendants present)." : " (no descendants).");
  }

  // --- Parents ---
  if (heirs.father) {
    if (hasDescendants) {
      shares.father = new SimpleFraction(1, 6);
      reasons.father = "Receives 1/6 (descendants present).";
    } else {
      // Father gets remainder in Ja'fari too (but via radd, not 'asabah)
      shares.father = new SimpleFraction(1, 6);
      reasons.father = "Receives 1/6 fixed share; remainder distributed via radd.";
    }
  }
  if (heirs.mother) {
    const siblingCount = (heirs.fullBrother ?? 0) + (heirs.fullSister ?? 0) +
      (heirs.paternalHalfBrother ?? 0) + (heirs.paternalHalfSister ?? 0) +
      (heirs.maternalHalfBrother ?? 0) + (heirs.maternalHalfSister ?? 0);
    if (hasDescendants || siblingCount >= 2) {
      shares.mother = new SimpleFraction(1, 6);
      reasons.mother = "Receives 1/6" + (hasDescendants ? " (descendants present)." : " (two or more siblings present).");
    } else {
      shares.mother = new SimpleFraction(1, 3);
      reasons.mother = "Receives 1/3 (no descendants, fewer than two siblings).";
    }
  }

  // --- Children distribution (Ja'fari: no 'asabah — sons/daughters share remainder) ---
  const sons = heirs.son ?? 0;
  const daughters = heirs.daughter ?? 0;
  const sonsSons = heirs.sonsSon ?? 0;
  const sonsDaughters = heirs.sonsDaughter ?? 0;

  // Calculate remaining after spouse & parents
  let fixedTotal = new SimpleFraction(0, 1);
  Object.values(shares).forEach(s => fixedTotal = fixedTotal.add(s!));
  let remainder = new SimpleFraction(1, 1).sub(fixedTotal);

  if (sons > 0 || daughters > 0) {
    const parts = sons * 2 + daughters;
    if (parts > 0 && remainder.numerator > 0) {
      if (sons > 0) {
        shares.son = remainder.mul(sons * 2).div(parts);
        reasons.son = `Receives share of remainder with 2:1 male-to-female ratio.`;
      }
      if (daughters > 0) {
        shares.daughter = remainder.mul(daughters).div(parts);
        reasons.daughter = `Receives share of remainder with 2:1 male-to-female ratio.`;
      }
    } else if (daughters > 0 && sons === 0) {
      // Only daughters — get 2/3 (multiple) or 1/2 (single), remainder goes to parents via radd
      if (daughters === 1) {
        shares.daughter = new SimpleFraction(1, 2);
        reasons.daughter = "Single daughter receives 1/2 as fixed share.";
      } else {
        shares.daughter = new SimpleFraction(2, 3);
        reasons.daughter = "Multiple daughters share 2/3 as fixed share.";
      }
    }
  } else if (sonsSons > 0 || sonsDaughters > 0) {
    // Grandchildren via representation (only when no sons/daughters)
    const gParts = sonsSons * 2 + sonsDaughters;
    if (gParts > 0 && remainder.numerator > 0) {
      if (sonsSons > 0) {
        shares.sonsSon = remainder.mul(sonsSons * 2).div(gParts);
        reasons.sonsSon = "Son's son inherits via representation with 2:1 ratio.";
      }
      if (sonsDaughters > 0) {
        shares.sonsDaughter = remainder.mul(sonsDaughters).div(gParts);
        reasons.sonsDaughter = "Son's daughter inherits via representation with 2:1 ratio.";
      }
    }
  }

  // --- Class 2 heirs (only if Class 1 absent): Grandparents + Siblings ---
  if (!hasClass1 && hasClass2) {
    // Paternal grandfather in Ja'fari gets 1/6 if present
    if (heirs.paternalGrandfather) {
      shares.paternalGrandfather = new SimpleFraction(1, 6);
      reasons.paternalGrandfather = "Paternal grandfather receives 1/6 (Class 2 heir).";
    }
    
    // Grandmothers get 1/6 split between them
    if (heirs.paternalGrandmother && heirs.maternalGrandmother) {
      shares.paternalGrandmother = new SimpleFraction(1, 12);
      shares.maternalGrandmother = new SimpleFraction(1, 12);
      reasons.paternalGrandmother = "Paternal grandmother shares 1/6 with maternal grandmother.";
      reasons.maternalGrandmother = "Maternal grandmother shares 1/6 with paternal grandmother.";
    } else if (heirs.paternalGrandmother) {
      shares.paternalGrandmother = new SimpleFraction(1, 6);
      reasons.paternalGrandmother = "Paternal grandmother receives 1/6.";
    } else if (heirs.maternalGrandmother) {
      shares.maternalGrandmother = new SimpleFraction(1, 6);
      reasons.maternalGrandmother = "Maternal grandmother receives 1/6.";
    }

    // Calculate new remainder after grandparents
    let grandparentTotal = new SimpleFraction(0, 1);
    if (shares.paternalGrandfather) grandparentTotal = grandparentTotal.add(shares.paternalGrandfather);
    if (shares.paternalGrandmother) grandparentTotal = grandparentTotal.add(shares.paternalGrandmother);
    if (shares.maternalGrandmother) grandparentTotal = grandparentTotal.add(shares.maternalGrandmother);
    
    const newRemainder = remainder.sub(grandparentTotal);
    
    // Siblings share the remainder after grandparents
    const fb = heirs.fullBrother ?? 0;
    const fs = heirs.fullSister ?? 0;
    const phb = heirs.paternalHalfBrother ?? 0;
    const phs = heirs.paternalHalfSister ?? 0;
    const mhb = heirs.maternalHalfBrother ?? 0;
    const mhs = heirs.maternalHalfSister ?? 0;
    
    const sibParts = (fb + phb) * 2 + fs + phs + mhb + mhs;
    if (sibParts > 0 && newRemainder.numerator > 0) {
      if (fb > 0) {
        shares.fullBrother = newRemainder.mul(fb * 2).div(sibParts);
        reasons.fullBrother = "Full brother shares remainder with 2:1 ratio.";
      }
      if (fs > 0) {
        shares.fullSister = newRemainder.mul(fs).div(sibParts);
        reasons.fullSister = "Full sister shares remainder with 2:1 ratio.";
      }
      if (phb > 0) {
        shares.paternalHalfBrother = newRemainder.mul(phb * 2).div(sibParts);
        reasons.paternalHalfBrother = "Paternal half brother shares remainder with 2:1 ratio.";
      }
      if (phs > 0) {
        shares.paternalHalfSister = newRemainder.mul(phs).div(sibParts);
        reasons.paternalHalfSister = "Paternal half sister shares remainder.";
      }
      if (mhb > 0) {
        shares.maternalHalfBrother = newRemainder.mul(mhb).div(sibParts);
        reasons.maternalHalfBrother = "Maternal half brother shares remainder equally.";
      }
      if (mhs > 0) {
        shares.maternalHalfSister = newRemainder.mul(mhs).div(sibParts);
        reasons.maternalHalfSister = "Maternal half sister shares remainder equally.";
      }
    }
  }

  // --- Radd (Ja'fari always applies radd, including to spouse in some cases) ---
  let finalTotal = new SimpleFraction(0, 1);
  Object.values(shares).forEach(s => finalTotal = finalTotal.add(s!));

  let wasRaddApplied = false;
  let raddExplanation: string | undefined;

  if (finalTotal.valueOf() < 1 && finalTotal.numerator > 0) {
    wasRaddApplied = true;
    const surplus = new SimpleFraction(1, 1).sub(finalTotal);
    // In Ja'fari, radd goes to all heirs EXCEPT spouse (unless no other heirs)
    let raddRecipients: string[] = Object.keys(shares).filter(h => h !== 'husband' && h !== 'wife');
    if (raddRecipients.length === 0) {
      // Only spouse — radd goes to spouse
      raddRecipients = Object.keys(shares);
    }
    const raddTotal = raddRecipients.reduce((sum, h) => sum.add(shares[h as keyof Heirs]!), new SimpleFraction(0, 1));
    if (raddTotal.numerator > 0) {
      raddExplanation = `The shares totaled ${finalTotal.toFractionString()}, leaving a surplus of ${surplus.toFractionString()}. In the Jaʿfarī school, surplus is redistributed (radd) proportionally to non-spouse heirs (no ʿaṣabah concept).`;
      for (const heir of raddRecipients) {
        const k = heir as keyof Heirs;
        shares[k] = shares[k]!.add(surplus.mul(shares[k]!).div(raddTotal));
      }
    }
  }

  // --- Format ---
  const result: CalculationResult = {
    shares: [],
    blocked: [],
    totalShares: 0,
    wasAwlApplied: false, // Ja'fari does not use 'awl
    awlExplanation: undefined,
    wasRaddApplied,
    raddExplanation,
    notes: [
      "Jaʿfarī inheritance uses a class-based system: Class 1 (parents/children) blocks Class 2 (grandparents/siblings), which blocks Class 3 (uncles/aunts).",
      "The Jaʿfarī school rejects ʿaṣabah (residuary heirs). Surplus always returns to fixed-share heirs via radd.",
      "ʿAwl (proportional reduction) is not applied in Jaʿfarī fiqh.",
    ],
  };

  for (const key in shares) {
    const heirKey = key as keyof Heirs;
    result.shares.push({
      heir: heirKey as any,
      label: heirKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      count: (typeof initialHeirs[heirKey] === 'number' ? initialHeirs[heirKey] : 1) as number,
      share: shares[heirKey]?.valueOf() ?? 0,
      reason: reasons[heirKey] ?? '',
      amount: (shares[heirKey]?.valueOf() ?? 0) * estate,
    });
  }
  for (const heirKey of [...new Set(blockedHeirs)]) {
    if (initialHeirs[heirKey]) {
      result.blocked.push({
        heir: heirKey as any,
        label: heirKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
        count: (typeof initialHeirs[heirKey] === 'number' ? initialHeirs[heirKey] : 1) as number,
        share: null,
        reason: reasons[heirKey] ?? 'Blocked by a closer heir.',
        amount: 0,
      });
    }
  }
  result.totalShares = Object.values(shares).reduce((sum, s) => sum + (s?.valueOf() ?? 0), 0);
  return result;
}


// --- Main Calculation Function ---
export function calculateInheritance(
  estate: number,
  heirs: Heirs,
  madhab: Madhab
): CalculationResult {
  // Ja'fari uses a completely different system
  if (madhab === 'jafari') {
    return calculateJafari(estate, { ...heirs });
  }

  // Check for no heirs at all
  if (!hasAnyHeirs(heirs)) {
    return {
      shares: [],
      blocked: [],
      totalShares: 0,
      wasAwlApplied: false,
      wasRaddApplied: false,
      baytAlMalAmount: estate,
      baytAlMalExplanation: "No eligible heirs were selected. In Islamic law, when there are no heirs, the entire estate goes to Bayt al-Māl (بيت المال — the public treasury).",
      notes: [],
    };
  }

  let shares: Partial<Record<keyof Heirs, SimpleFraction>> = {};
  let reasons: Partial<Record<keyof Heirs, string>> = {};
  let blockedHeirs: (keyof Heirs)[] = [];
  let baytAlMalAmount: number | undefined;
  let baytAlMalExplanation: string | undefined;

  const initialHeirs = { ...heirs };

  // --- 1. Blocking (Ḥajb) ---
  // A son blocks son's children and all siblings
  if (heirs.son && heirs.son > 0) {
    blockedHeirs.push('sonsSon', 'sonsDaughter', 'fullBrother', 'fullSister', 'paternalHalfBrother', 'paternalHalfSister', 'maternalHalfBrother', 'maternalHalfSister');
    reasons.sonsSon = reasons.sonsDaughter = "Blocked by the son.";
    reasons.fullBrother = reasons.fullSister = "Blocked by the son.";
    reasons.paternalHalfBrother = reasons.paternalHalfSister = "Blocked by the son.";
    reasons.maternalHalfBrother = reasons.maternalHalfSister = "Blocked by the son.";
  }

  // A father blocks the paternal grandfather and all siblings
  if (heirs.father) {
      blockedHeirs.push('paternalGrandfather', 'fullBrother', 'fullSister', 'paternalHalfBrother', 'paternalHalfSister', 'maternalHalfBrother', 'maternalHalfSister');
      reasons.paternalGrandfather = "Blocked by the father.";
      reasons.fullBrother = reasons.fullSister = "Blocked by the father.";
      reasons.paternalHalfBrother = reasons.paternalHalfSister = "Blocked by the father.";
      reasons.maternalHalfBrother = reasons.maternalHalfSister = "Blocked by the father.";
  }
  
  // A mother blocks grandmothers
  if(heirs.mother){
      blockedHeirs.push('paternalGrandmother', 'maternalGrandmother');
      reasons.paternalGrandmother = reasons.maternalGrandmother = "Blocked by the mother.";
  }
  
  // Paternal Grandfather blocks... (depends on madhab for siblings)
  if(heirs.paternalGrandfather){
      if(madhab === 'hanafi'){
          blockedHeirs.push('fullBrother', 'fullSister', 'paternalHalfBrother', 'paternalHalfSister');
          reasons.fullBrother = reasons.fullSister = "Blocked by the paternal grandfather (Ḥanafī view).";
          reasons.paternalHalfBrother = reasons.paternalHalfSister = "Blocked by the paternal grandfather (Ḥanafī view).";
      }
  }


  // Filter out blocked heirs
  for (const heir of blockedHeirs) {
    if (heirs[heir]) {
        delete heirs[heir];
    }
  }

  // Further exclusions agreed by the four Sunni schools. Each one only applies
  // to an heir still present, and keeps any reason a closer heir already gave.
  const block = (heir: keyof Heirs, reason: string) => {
    if (!heirs[heir]) return;
    blockedHeirs.push(heir);
    if (!reasons[heir]) reasons[heir] = reason;
    delete heirs[heir];
  };
  const SIBLINGS: (keyof Heirs)[] = ['fullBrother', 'fullSister', 'paternalHalfBrother', 'paternalHalfSister', 'maternalHalfBrother', 'maternalHalfSister'];
  // A son's son, like a son, excludes every kind of sibling.
  if ((heirs.sonsSon ?? 0) > 0) {
    for (const h of SIBLINGS) block(h, "Blocked by the son's son.");
  }
  // Maternal half-siblings inherit only when there is no child or child of a son,
  // and no father or paternal grandfather (Qurʾān 4:12, kalālah).
  const anyDescendant = (heirs.son ?? 0) > 0 || (heirs.daughter ?? 0) > 0 || (heirs.sonsSon ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0;
  if (anyDescendant) {
    block('maternalHalfBrother', "Blocked by a descendant of the deceased (Qurʾān 4:12 gives maternal siblings a share only when there is no child).");
    block('maternalHalfSister', "Blocked by a descendant of the deceased (Qurʾān 4:12 gives maternal siblings a share only when there is no child).");
  }
  if (heirs.paternalGrandfather) {
    block('maternalHalfBrother', "Blocked by the paternal grandfather.");
    block('maternalHalfSister', "Blocked by the paternal grandfather.");
  }
  // Two or more daughters complete the two-thirds; a son's daughter then inherits
  // only as a residuary with a son's son.
  if ((heirs.daughter ?? 0) >= 2 && !((heirs.sonsSon ?? 0) > 0)) {
    block('sonsDaughter', "Blocked: two or more daughters take the full two-thirds and there is no son's son to make her a residuary.");
  }
  // Sibling exclusions among full and paternal half-siblings. When a paternal
  // grandfather inherits with siblings (Mālikī, Shāfiʿī, Ḥanbalī), the grandfather
  // step below handles these heirs instead.
  const grandfatherSharesWithSiblings = !!heirs.paternalGrandfather && madhab !== 'hanafi';
  if (!grandfatherSharesWithSiblings) {
    const femaleDescendant = (heirs.daughter ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0;
    if ((heirs.fullBrother ?? 0) > 0) {
      block('paternalHalfBrother', "Blocked by the full brother.");
      block('paternalHalfSister', "Blocked by the full brother.");
    } else if ((heirs.fullSister ?? 0) > 0 && femaleDescendant) {
      block('paternalHalfBrother', "Blocked by the full sister, who takes the residue alongside the daughter(s).");
      block('paternalHalfSister', "Blocked by the full sister, who takes the residue alongside the daughter(s).");
    } else if ((heirs.fullSister ?? 0) >= 2 && !((heirs.paternalHalfBrother ?? 0) > 0)) {
      block('paternalHalfSister', "Blocked: two or more full sisters take the full two-thirds and there is no paternal half-brother to make her a residuary.");
    }
  }

  const hasDescendants = (heirs.son ?? 0) > 0 || (heirs.daughter ?? 0) > 0 || (heirs.sonsSon ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0;

  // --- 2. Fixed Shares (Furūḍ) ---

  // Spouse shares
  if (heirs.husband) {
    shares.husband = hasDescendants ? new SimpleFraction(1, 4) : new SimpleFraction(1, 2);
    reasons.husband = `Receives ${shares.husband.toFractionString()}` + (hasDescendants ? " due to presence of descendants." : " as there are no descendants.");
  }
  if (heirs.wife) {
    shares.wife = hasDescendants ? new SimpleFraction(1, 8) : new SimpleFraction(1, 4);
    reasons.wife = `Receives ${shares.wife.toFractionString()}` + (hasDescendants ? " due to presence of descendants." : " as there are no descendants.");
  }

  // Parents shares
  if (heirs.father) {
    shares.father = new SimpleFraction(1, 6);
    reasons.father = `Receives 1/6 as a fixed share due to the presence of descendants. Will also take remainder if any.`;
  }
  if (heirs.mother) {
      // Qurʾān 4:11: the mother takes 1/6 if the deceased had brothers or sisters.
      // Siblings count even when they are themselves excluded (for example by the
      // father), so they are counted from the heirs as entered, before exclusion.
      const numberOfSiblings = (initialHeirs.fullBrother ?? 0) + (initialHeirs.fullSister ?? 0) + (initialHeirs.paternalHalfBrother ?? 0) + (initialHeirs.paternalHalfSister ?? 0) + (initialHeirs.maternalHalfBrother ?? 0) + (initialHeirs.maternalHalfSister ?? 0);
      if(numberOfSiblings >= 2){
          shares.mother = new SimpleFraction(1,6);
          reasons.mother = `Receives 1/6 due to the presence of two or more siblings.`
      } else if (hasDescendants) {
          shares.mother = new SimpleFraction(1, 6);
          reasons.mother = `Receives 1/6 due to the presence of descendants.`;
      }
      // Umariyyatan Cases
      else if((heirs.husband && heirs.father) || (heirs.wife && heirs.father)){
          shares.mother = new SimpleFraction(1,3); // Placeholder, will be 1/3 of remainder
          reasons.mother = `Receives 1/3 of the remainder (Special "ʿUmariyyatān" case).`;
      }
      else {
          shares.mother = new SimpleFraction(1, 3);
          reasons.mother = `Receives 1/3 as there are no descendants or multiple siblings.`;
      }
  }

  // Daughters' fixed shares (when no sons)
  if ((heirs.daughter ?? 0) > 0 && (heirs.son ?? 0) === 0) {
    if (heirs.daughter === 1) {
      shares.daughter = new SimpleFraction(1, 2);
      reasons.daughter = "Single daughter receives 1/2 as fixed share.";
    } else if ((heirs.daughter ?? 0) > 1) {
      shares.daughter = new SimpleFraction(2, 3);
      reasons.daughter = "Multiple daughters share 2/3 as fixed share.";
    }
  }

  // Son's daughters' fixed shares (when no sons or daughters)
  if ((heirs.sonsDaughter ?? 0) > 0 && (heirs.son ?? 0) === 0 && (heirs.daughter ?? 0) === 0 && (heirs.sonsSon ?? 0) === 0) {
    if (heirs.sonsDaughter === 1) {
      shares.sonsDaughter = new SimpleFraction(1, 2);
      reasons.sonsDaughter = "Single son's daughter receives 1/2 as fixed share.";
    } else if ((heirs.sonsDaughter ?? 0) > 1) {
      shares.sonsDaughter = new SimpleFraction(2, 3);
      reasons.sonsDaughter = "Multiple son's daughters share 2/3 as fixed share.";
    }
  }
  // With exactly one daughter and no son's son, the son's daughter(s) take 1/6 to
  // complete two-thirds (Ibn Masʿūd's report, Ṣaḥīḥ al-Bukhārī 6736).
  if ((heirs.sonsDaughter ?? 0) > 0 && (heirs.son ?? 0) === 0 && heirs.daughter === 1 && (heirs.sonsSon ?? 0) === 0) {
    shares.sonsDaughter = new SimpleFraction(1, 6);
    reasons.sonsDaughter = "Receives 1/6 with one daughter, completing two-thirds (Ṣaḥīḥ al-Bukhārī 6736).";
  }

  // Sisters' fixed shares (when no sons, daughters, father, grandfather)
  const hasDirectDescendants = (heirs.son ?? 0) > 0 || (heirs.daughter ?? 0) > 0 || (heirs.sonsSon ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0;
  const hasMaleAncestors = heirs.father || heirs.paternalGrandfather;
  
  // A full brother makes the full sisters residuaries with him (Qurʾān 4:176), so
  // they take no fixed share when he is present.
  const hasFullBrother = (heirs.fullBrother ?? 0) > 0;
  if ((heirs.fullSister ?? 0) > 0 && !hasDirectDescendants && !hasMaleAncestors && !hasFullBrother) {
    if (heirs.fullSister === 1) {
      shares.fullSister = new SimpleFraction(1, 2);
      reasons.fullSister = "Single full sister receives 1/2 as fixed share.";
    } else if ((heirs.fullSister ?? 0) > 1) {
      shares.fullSister = new SimpleFraction(2, 3);
      reasons.fullSister = "Multiple full sisters share 2/3 as fixed share.";
    }
  }

  // Paternal half-sisters (Qurʾān 4:176 covers sisters through the father too):
  // 1/2 alone, 2/3 for two or more, 1/6 beside exactly one full sister. A paternal
  // half-brother makes them residuaries instead.
  if ((heirs.paternalHalfSister ?? 0) > 0 && !hasDirectDescendants && !hasMaleAncestors && !hasFullBrother && !((heirs.paternalHalfBrother ?? 0) > 0)) {
    const fullSisters = heirs.fullSister ?? 0;
    if (fullSisters === 0) {
      if (heirs.paternalHalfSister === 1) {
        shares.paternalHalfSister = new SimpleFraction(1, 2);
        reasons.paternalHalfSister = "Single paternal half-sister receives 1/2 as fixed share.";
      } else {
        shares.paternalHalfSister = new SimpleFraction(2, 3);
        reasons.paternalHalfSister = "Paternal half-sisters share 2/3 as fixed share.";
      }
    } else if (fullSisters === 1) {
      shares.paternalHalfSister = new SimpleFraction(1, 6);
      reasons.paternalHalfSister = "Receives 1/6 beside one full sister, completing two-thirds.";
    }
  }

  // Maternal half-siblings (Qurʾān 4:12): one takes 1/6; two or more share 1/3
  // equally, male and female alike. Exclusions were applied above.
  const maternalSiblings = (heirs.maternalHalfBrother ?? 0) + (heirs.maternalHalfSister ?? 0);
  if (maternalSiblings > 0) {
    const pool = maternalSiblings === 1 ? new SimpleFraction(1, 6) : new SimpleFraction(1, 3);
    const why = maternalSiblings === 1
      ? "Receives 1/6 as the only maternal half-sibling (Qurʾān 4:12)."
      : "Maternal half-siblings share 1/3 equally, male and female alike (Qurʾān 4:12).";
    if ((heirs.maternalHalfBrother ?? 0) > 0) {
      shares.maternalHalfBrother = pool.mul(heirs.maternalHalfBrother ?? 0).div(maternalSiblings);
      reasons.maternalHalfBrother = why;
    }
    if ((heirs.maternalHalfSister ?? 0) > 0) {
      shares.maternalHalfSister = pool.mul(heirs.maternalHalfSister ?? 0).div(maternalSiblings);
      reasons.maternalHalfSister = why;
    }
  }

  // Grandparents
  const grandfatherWithSiblings = grandfatherSharesWithSiblings && (
    (heirs.fullBrother ?? 0) > 0 || (heirs.fullSister ?? 0) > 0 ||
    (heirs.paternalHalfBrother ?? 0) > 0 || (heirs.paternalHalfSister ?? 0) > 0
  );
  // When he shares with siblings (Mālikī, Shāfiʿī, Ḥanbalī), the grandfather's
  // whole entitlement is the best of the options computed in step 4, so he takes
  // no separate fixed 1/6 here.
  if(heirs.paternalGrandfather && !heirs.father && !grandfatherWithSiblings){
      shares.paternalGrandfather = new SimpleFraction(1,6);
      reasons.paternalGrandfather = 'Receives 1/6 in place of the father.'
  }
   if(heirs.paternalGrandmother && !heirs.mother){
      shares.paternalGrandmother = new SimpleFraction(1,6);
      reasons.paternalGrandmother = 'Receives 1/6 as there is no mother.'
  }
   if(heirs.maternalGrandmother && !heirs.mother){
      shares.maternalGrandmother = new SimpleFraction(1,6);
      reasons.maternalGrandmother = 'Receives 1/6 as there is no mother.'
  }
  if(shares.paternalGrandmother && shares.maternalGrandmother){
      // They share the 1/6
      shares.paternalGrandmother = new SimpleFraction(1,12);
      shares.maternalGrandmother = new SimpleFraction(1,12);
      reasons.paternalGrandmother = reasons.maternalGrandmother = "Shares 1/6 with the other grandmother.";
  }


  // --- 3. Residuary (ʿAṣabah) ---
  let residuaries: (keyof Heirs)[] = [];
  if ((heirs.son ?? 0) > 0) {
      residuaries.push('son', 'daughter');
  } else if ((heirs.sonsSon ?? 0) > 0){
      residuaries.push('sonsSon', 'sonsDaughter');
  } else if (heirs.father){
      residuaries.push('father');
  } else if(heirs.paternalGrandfather){
      // Grandfather vs siblings rules differ by school
      const hasSiblings = ((heirs.fullBrother ?? 0) > 0 || (heirs.fullSister ?? 0) > 0 ||
                           (heirs.paternalHalfBrother ?? 0) > 0 || (heirs.paternalHalfSister ?? 0) > 0);
      if(madhab !== 'hanafi' && hasSiblings) {
           // Mālikī/Shāfiʿī/Ḥanbalī: Grandfather gets the best of three options
           // (Rules of Zayd ibn Thābit):
           //   Option A: 1/6 of the total estate
           //   Option B: 1/3 of the remainder (after fixed shares)
           //   Option C: Share as if he were a brother (muqāsama)
           // We calculate all three after fixed shares are determined, then pick the best.
           // For now, mark grandfather as a special residuary and calculate below.
           residuaries.push('paternalGrandfather');
           reasons.paternalGrandfather = "Grandfather shares with siblings (Zayd ibn Thābit rules): gets the best of 1/6 of estate, 1/3 of remainder, or equal share with brothers.";
      } else {
           // Ḥanafī: grandfather blocks siblings entirely, or no siblings present
           residuaries.push('paternalGrandfather');
      }
  } else if ((heirs.fullBrother ?? 0) > 0) {
      // Full brother, with any full sisters at 2:1 (Qurʾān 4:176).
      residuaries.push('fullBrother', 'fullSister');
  } else if ((heirs.fullSister ?? 0) > 0 && ((heirs.daughter ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0)) {
      // Full sister takes the residue alongside daughters (ʿaṣabah maʿa al-ghayr).
      residuaries.push('fullSister');
  } else if ((heirs.paternalHalfBrother ?? 0) > 0) {
      residuaries.push('paternalHalfBrother', 'paternalHalfSister');
  } else if ((heirs.paternalHalfSister ?? 0) > 0 && ((heirs.daughter ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0)) {
      residuaries.push('paternalHalfSister');
  }


  // --- 4. Distribute Shares ---
  let totalFixedShares = new SimpleFraction(0, 1);
  Object.values(shares).forEach(s => totalFixedShares = totalFixedShares.add(s!));

  let remainder = new SimpleFraction(1, 1).sub(totalFixedShares);

  // Handle Umariyyatan case
  if (reasons.mother?.includes("ʿUmariyyatān")) {
      const spouseShare = shares.husband ?? shares.wife ?? new SimpleFraction(0, 1);
      const estateAfterSpouse = new SimpleFraction(1, 1).sub(spouseShare);
      shares.mother = estateAfterSpouse.mul(new SimpleFraction(1,3));
      // Recalculate total fixed shares
      totalFixedShares = new SimpleFraction(0, 1);
      Object.values(shares).forEach(s => totalFixedShares = totalFixedShares.add(s!));
      remainder = new SimpleFraction(1, 1).sub(totalFixedShares);
  }

  // A grandfather sharing with siblings never falls below 1/6 of the estate, even
  // when the fixed shares leave nothing (the shares are then reduced by ʿawl).
  if (grandfatherWithSiblings && remainder.numerator <= 0) {
      shares.paternalGrandfather = new SimpleFraction(1, 6);
      reasons.paternalGrandfather = "Grandfather with siblings (Zayd ibn Thābit): the fixed shares leave nothing, so he takes 1/6 of the estate.";
  }

  // Distribute remainder
  if (remainder.numerator > 0 && residuaries.length > 0) {
      if(residuaries.includes('son') || residuaries.includes('sonsSon')){
          const maleHeir = residuaries.includes('son') ? 'son' : 'sonsSon';
          const femaleHeir = residuaries.includes('son') ? 'daughter' : 'sonsDaughter';

          const sons = heirs[maleHeir] ?? 0;
          const daughters = heirs[femaleHeir] ?? 0;
          const parts = sons * 2 + daughters;
          if(parts > 0){
             shares[maleHeir] = (shares[maleHeir] ?? new SimpleFraction(0, 1)).add(remainder.mul(sons * 2).div(parts));
             shares[femaleHeir] = (shares[femaleHeir] ?? new SimpleFraction(0, 1)).add(remainder.mul(daughters).div(parts));
             reasons[maleHeir] = `Receives remainder as residuary (ʿaṣabah) with a 2:1 ratio.`;
             reasons[femaleHeir] = `Receives remainder as residuary (ʿaṣabah) with a 2:1 ratio.`;
          }
      } else if (residuaries.includes('father')){
          shares.father = (shares.father ?? new SimpleFraction(0, 1)).add(remainder);
          reasons.father = `Receives 1/6 fixed share + the remainder as residuary (ʿaṣabah).`;
      } else if (residuaries.includes('paternalGrandfather')){
          const hasSiblingsForSharing = madhab !== 'hanafi' && (
            (heirs.fullBrother ?? 0) > 0 || (heirs.fullSister ?? 0) > 0 ||
            (heirs.paternalHalfBrother ?? 0) > 0 || (heirs.paternalHalfSister ?? 0) > 0
          );

          if (hasSiblingsForSharing) {
            // Zayd ibn Thābit rules: grandfather gets the BEST of three options
            const oneSixth = new SimpleFraction(1, 6);
            const oneThirdRemainder = remainder.mul(new SimpleFraction(1, 3));

            // Option C (muqāsama): share as if grandfather is a brother
            const brothers = (heirs.fullBrother ?? 0) + (heirs.paternalHalfBrother ?? 0);
            const sisters = (heirs.fullSister ?? 0) + (heirs.paternalHalfSister ?? 0);
            const totalParts = (brothers + 1) * 2 + sisters; // +1 for grandfather as "brother"
            const muqasamaShare = remainder.mul(2).div(totalParts);

            // Pick the best option
            const optionA = oneSixth;
            const optionB = oneThirdRemainder;
            const optionC = muqasamaShare;

            let bestShare = optionA;
            let chosenOption = "1/6 of estate";
            if (optionB.valueOf() > bestShare.valueOf()) { bestShare = optionB; chosenOption = "1/3 of remainder"; }
            if (optionC.valueOf() > bestShare.valueOf()) { bestShare = optionC; chosenOption = "sharing as a brother (muqāsama)"; }

            shares.paternalGrandfather = (shares.paternalGrandfather ?? new SimpleFraction(0, 1)).add(bestShare);
            reasons.paternalGrandfather = `Grandfather with siblings (Zayd ibn Thābit): best of three options was ${chosenOption}.`;

            // Distribute what remains after grandfather's share to siblings.
            // Paternal half-siblings are counted against the grandfather above
            // (al-muʿāddah), but a full sibling then takes their portion: a full
            // brother takes it all with his sisters; full sisters alone take up to
            // their fixed share (1/2, or 2/3 for two or more) and the paternal
            // half-siblings keep whatever is left, at 2:1.
            const siblingRemainder = remainder.sub(bestShare);
            if (siblingRemainder.numerator > 0) {
              const fb = heirs.fullBrother ?? 0, fs = heirs.fullSister ?? 0;
              const pb = heirs.paternalHalfBrother ?? 0, ps = heirs.paternalHalfSister ?? 0;
              const give = (heir: keyof Heirs, amount: SimpleFraction, why: string) => {
                if (amount.numerator <= 0) return;
                shares[heir] = (shares[heir] ?? new SimpleFraction(0, 1)).add(amount);
                reasons[heir] = why;
              };
              const shareWithGrandfather = "Shares the residue with the paternal grandfather (Zayd ibn Thābit's method), male twice the female.";
              if (fb > 0) {
                const parts = fb * 2 + fs;
                give('fullBrother', siblingRemainder.mul(fb * 2).div(parts), shareWithGrandfather);
                give('fullSister', siblingRemainder.mul(fs).div(parts), shareWithGrandfather);
                if (pb > 0) reasons.paternalHalfBrother = "Counted against the grandfather, then excluded by the full brother (al-muʿāddah).";
                if (ps > 0) reasons.paternalHalfSister = "Counted against the grandfather, then excluded by the full brother (al-muʿāddah).";
                for (const h of ['paternalHalfBrother', 'paternalHalfSister'] as (keyof Heirs)[]) {
                  if (heirs[h]) blockedHeirs.push(h);
                }
              } else if (fs > 0) {
                const cap = fs === 1 ? new SimpleFraction(1, 2) : new SimpleFraction(2, 3);
                const toFull = siblingRemainder.valueOf() <= cap.valueOf() || (pb + ps) === 0 ? siblingRemainder : cap;
                give('fullSister', toFull, (pb + ps) > 0
                  ? "Full sister(s) take up to their fixed share from the siblings' portion beside the grandfather (al-muʿāddah)."
                  : shareWithGrandfather);
                const rest = siblingRemainder.sub(toFull);
                const halfParts = pb * 2 + ps;
                if (rest.numerator > 0 && halfParts > 0) {
                  give('paternalHalfBrother', rest.mul(pb * 2).div(halfParts), "Takes what is left of the siblings' portion after the full sister(s) (al-muʿāddah).");
                  give('paternalHalfSister', rest.mul(ps).div(halfParts), "Takes what is left of the siblings' portion after the full sister(s) (al-muʿāddah).");
                } else {
                  for (const h of ['paternalHalfBrother', 'paternalHalfSister'] as (keyof Heirs)[]) {
                    if (heirs[h]) {
                      blockedHeirs.push(h);
                      reasons[h] = "Counted against the grandfather, but nothing is left after the full sister(s) (al-muʿāddah).";
                    }
                  }
                }
              } else {
                const parts = pb * 2 + ps;
                give('paternalHalfBrother', siblingRemainder.mul(pb * 2).div(parts), shareWithGrandfather);
                give('paternalHalfSister', siblingRemainder.mul(ps).div(parts), shareWithGrandfather);
              }
            }
          } else {
            // No siblings or Hanafi (grandfather blocks siblings): takes full remainder
            shares.paternalGrandfather = (shares.paternalGrandfather ?? new SimpleFraction(0, 1)).add(remainder);
          }
      } else if (residuaries.includes('fullBrother') || residuaries.includes('paternalHalfBrother')) {
          // Brothers take the residue as ʿaṣabah, sisters of the same kind with
          // them at 2:1 (Qurʾān 4:176; Ṣaḥīḥ al-Bukhārī 6732).
          const maleHeir: keyof Heirs = residuaries.includes('fullBrother') ? 'fullBrother' : 'paternalHalfBrother';
          const femaleHeir: keyof Heirs = maleHeir === 'fullBrother' ? 'fullSister' : 'paternalHalfSister';
          const brothers = (heirs[maleHeir] as number | undefined) ?? 0;
          const sisters = (heirs[femaleHeir] as number | undefined) ?? 0;
          const parts = brothers * 2 + sisters;
          shares[maleHeir] = (shares[maleHeir] ?? new SimpleFraction(0, 1)).add(remainder.mul(brothers * 2).div(parts));
          reasons[maleHeir] = sisters > 0
            ? "Receives the remainder as residuary (ʿaṣabah) with the sister(s), male twice the female (Qurʾān 4:176)."
            : "Receives the remainder as residuary (ʿaṣabah).";
          if (sisters > 0) {
            shares[femaleHeir] = (shares[femaleHeir] ?? new SimpleFraction(0, 1)).add(remainder.mul(sisters).div(parts));
            reasons[femaleHeir] = "Receives the remainder as residuary with the brother(s), half a brother's share (Qurʾān 4:176).";
          }
      } else if (residuaries.includes('fullSister') || residuaries.includes('paternalHalfSister')) {
          const heir: keyof Heirs = residuaries.includes('fullSister') ? 'fullSister' : 'paternalHalfSister';
          shares[heir] = (shares[heir] ?? new SimpleFraction(0, 1)).add(remainder);
          reasons[heir] = "Receives the remainder as residuary alongside the daughter(s) (ʿaṣabah maʿa al-ghayr; Ṣaḥīḥ al-Bukhārī 6736).";
      }
  }

  // Residuaries left with nothing are shown as excluded rather than silently dropped.
  const possibleResiduaries: (keyof Heirs)[] = grandfatherWithSiblings
      ? [...residuaries, 'fullBrother', 'fullSister', 'paternalHalfBrother', 'paternalHalfSister']
      : residuaries;
  for (const h of possibleResiduaries) {
      if (heirs[h] && !shares[h] && !blockedHeirs.includes(h)) {
          blockedHeirs.push(h);
          reasons[h] = "Residuary heir: the fixed shares exhaust the estate, so nothing remains.";
      }
  }


  // al-Akdariyyah (Mālikī, Shāfiʿī, Ḥanbalī, following Zayd ibn Thābit): husband,
  // mother, paternal grandfather and one full or paternal sister, nobody else.
  // Base 6 is raised to 9 (husband 3, mother 2, grandfather 1, sister 3), then the
  // grandfather's and sister's 4 parts are re-divided 2:1, giving 27: husband 9,
  // mother 6, grandfather 8, sister 4 (islamqa.info/ar/answers/240582).
  const sisterKey: keyof Heirs | null =
      heirs.fullSister === 1 && !heirs.paternalHalfSister ? 'fullSister'
    : heirs.paternalHalfSister === 1 && !heirs.fullSister ? 'paternalHalfSister' : null;
  const isAkdariyya = madhab !== 'hanafi' && !!heirs.husband && !heirs.wife && !!heirs.mother &&
    !!heirs.paternalGrandfather && !heirs.father && sisterKey !== null && !hasDescendants &&
    !heirs.fullBrother && !heirs.paternalHalfBrother;
  let akdariyyaNote: string | undefined;
  if (isAkdariyya && sisterKey) {
    shares = {
      husband: new SimpleFraction(9, 27),
      mother: new SimpleFraction(6, 27),
      paternalGrandfather: new SimpleFraction(8, 27),
      [sisterKey]: new SimpleFraction(4, 27),
    };
    blockedHeirs = blockedHeirs.filter(h => h !== sisterKey);
    reasons.husband = "Receives 9/27 (al-Akdariyyah).";
    reasons.mother = "Receives 6/27 (al-Akdariyyah).";
    reasons.paternalGrandfather = "Receives 8/27 (al-Akdariyyah): his 1/6 and the sister's 1/2 are pooled and re-divided 2:1.";
    reasons[sisterKey] = "Receives 4/27 (al-Akdariyyah): her 1/2 is restored, then pooled with the grandfather's share and re-divided 2:1.";
    akdariyyaNote = "This is al-Akdariyyah: the shares (husband 1/2, mother 1/3, grandfather 1/6, sister 1/2) were raised from 6 to 9 by ʿawl, then the grandfather's and sister's parts were re-divided 2:1, giving a base of 27.";
  }

  // --- 5. Handle ʿAwl and Radd ---
  let wasAwlApplied = isAkdariyya;
  let awlExplanation = akdariyyaNote;
  let wasRaddApplied = false;
  let raddExplanation = undefined;
  
  const finalTotal = Object.values(shares).reduce((sum, s) => sum.add(s!), new SimpleFraction(0, 1));

  if (finalTotal.valueOf() > 1) {
    wasAwlApplied = true;
    awlExplanation = `The sum of shares (${finalTotal.toFractionString()}) exceeded the total estate, so all shares were proportionally reduced (ʿAwl).`;
    const awlFactor = finalTotal;
    for (const key in shares) {
        const heirKey = key as keyof Heirs;
        shares[heirKey] = shares[heirKey]!.div(awlFactor);
    }
  } else if (finalTotal.valueOf() < 1 && residuaries.length === 0) {
    const surplus = new SimpleFraction(1, 1).sub(finalTotal);
    let raddRecipients = Object.keys(shares) as (keyof Heirs)[];
    
    // Classical position of ALL four Sunni schools (including Ḥanbalī relied-upon):
    // Spouses do NOT receive Radd. The minority position allowing Radd to spouses
    // is attributed to ʿUthmān ibn ʿAffān and adopted in some modern personal status
    // laws, but is NOT the classical Ḥanbalī muʿtamad.
    raddRecipients = raddRecipients.filter(h => h !== 'husband' && h !== 'wife');
    
    const raddTotal = raddRecipients.reduce((sum, h) => sum.add(shares[h]!), new SimpleFraction(0, 1));
    
    if (raddTotal.numerator > 0) {
        wasRaddApplied = true;
        raddExplanation = `The sum of shares was less than the total estate, so the surplus of ${surplus.toFractionString()} was redistributed (Radd).`;
        for(const heir of raddRecipients){
            shares[heir] = shares[heir]!.add(surplus.mul(shares[heir]!).div(raddTotal));
        }
    } else if (raddRecipients.length === 0 && surplus.numerator > 0) {
        // Only spouse, no other heirs to receive radd
        const isOnlySpouse = Object.keys(shares).every(h => h === 'husband' || h === 'wife');
        if (isOnlySpouse) {
            baytAlMalAmount = surplus.valueOf() * estate;
            baytAlMalExplanation = `The spouse does not receive radd in the classical position of all four Sunni schools. The remainder of ${surplus.toFractionString()} goes to Bayt al-Māl (the public treasury).`;
        }
    }
  }


  // --- 6. Format Output ---
  const result: CalculationResult = {
    shares: [],
    blocked: [],
    totalShares: 0,
    wasAwlApplied,
    awlExplanation,
    wasRaddApplied,
    raddExplanation,
    baytAlMalAmount,
    baytAlMalExplanation,
    notes: [],
  };

  // TODO: Add full implementation for all heir types and edge cases

  // This is a simplified placeholder. A full implementation is very complex.
  for (const key in shares) {
      const heirKey = key as keyof Heirs;
      result.shares.push({
          heir: heirKey as any,
          label: heirKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
          count: initialHeirs[heirKey] as number ?? 1,
          share: shares[heirKey]?.valueOf() ?? 0,
          reason: reasons[heirKey] ?? '',
          amount: (shares[heirKey]?.valueOf() ?? 0) * estate,
      })
  }
   for (const heirKey of [...new Set(blockedHeirs)]) {
        if(initialHeirs[heirKey]){
            result.blocked.push({
                heir: heirKey as any,
                label: heirKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                count: initialHeirs[heirKey] as number ?? 1,
                share: null,
                reason: reasons[heirKey] ?? 'Blocked by a closer heir.',
                amount: 0,
            });
        }
    }

  result.totalShares = Object.values(shares).reduce((sum, s) => sum + (s?.valueOf() ?? 0), 0);

  return result;
}
