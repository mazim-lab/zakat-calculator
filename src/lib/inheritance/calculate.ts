
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
    const commonDivisor = SimpleFraction.gcd(this.numerator, this.denominator);
    return new SimpleFraction(this.numerator / commonDivisor, this.denominator / commonDivisor);
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
      const numberOfSiblings = (heirs.fullBrother ?? 0) + (heirs.fullSister ?? 0) + (heirs.paternalHalfBrother ?? 0) + (heirs.paternalHalfSister ?? 0) + (heirs.maternalHalfBrother ?? 0) + (heirs.maternalHalfSister ?? 0);
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

  // Sisters' fixed shares (when no sons, daughters, father, grandfather)
  const hasDirectDescendants = (heirs.son ?? 0) > 0 || (heirs.daughter ?? 0) > 0 || (heirs.sonsSon ?? 0) > 0 || (heirs.sonsDaughter ?? 0) > 0;
  const hasMaleAncestors = heirs.father || heirs.paternalGrandfather;
  
  if ((heirs.fullSister ?? 0) > 0 && !hasDirectDescendants && !hasMaleAncestors) {
    if (heirs.fullSister === 1) {
      shares.fullSister = new SimpleFraction(1, 2);
      reasons.fullSister = "Single full sister receives 1/2 as fixed share.";
    } else if ((heirs.fullSister ?? 0) > 1) {
      shares.fullSister = new SimpleFraction(2, 3);
      reasons.fullSister = "Multiple full sisters share 2/3 as fixed share.";
    }
  }

  // Grandparents
  if(heirs.paternalGrandfather && !heirs.father){
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

            // Distribute what remains after grandfather's share to siblings
            const siblingRemainder = remainder.sub(bestShare);
            if (siblingRemainder.numerator > 0) {
              const sibParts = brothers * 2 + sisters;
              if (sibParts > 0) {
                if ((heirs.fullBrother ?? 0) > 0) {
                  shares.fullBrother = (shares.fullBrother ?? new SimpleFraction(0, 1)).add(siblingRemainder.mul((heirs.fullBrother ?? 0) * 2).div(sibParts));
                }
                if ((heirs.fullSister ?? 0) > 0) {
                  shares.fullSister = (shares.fullSister ?? new SimpleFraction(0, 1)).add(siblingRemainder.mul(heirs.fullSister ?? 0).div(sibParts));
                }
                if ((heirs.paternalHalfBrother ?? 0) > 0) {
                  shares.paternalHalfBrother = (shares.paternalHalfBrother ?? new SimpleFraction(0, 1)).add(siblingRemainder.mul((heirs.paternalHalfBrother ?? 0) * 2).div(sibParts));
                }
                if ((heirs.paternalHalfSister ?? 0) > 0) {
                  shares.paternalHalfSister = (shares.paternalHalfSister ?? new SimpleFraction(0, 1)).add(siblingRemainder.mul(heirs.paternalHalfSister ?? 0).div(sibParts));
                }
              }
            }
          } else {
            // No siblings or Hanafi (grandfather blocks siblings): takes full remainder
            shares.paternalGrandfather = (shares.paternalGrandfather ?? new SimpleFraction(0, 1)).add(remainder);
          }
      }
  }


  // --- 5. Handle ʿAwl and Radd ---
  let wasAwlApplied = false;
  let awlExplanation = undefined;
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
