
import { Heirs, CalculationResult, Share, Madhab } from './types';

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


// --- Main Calculation Function ---
export function calculateInheritance(
  estate: number,
  heirs: Heirs,
  madhab: Madhab
): CalculationResult {
  let shares: Partial<Record<keyof Heirs, SimpleFraction>> = {};
  let reasons: Partial<Record<keyof Heirs, string>> = {};
  let blockedHeirs: (keyof Heirs)[] = [];

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
      // Complex logic for grandfather vs siblings in non-Hanafi schools
      // Simplified for now: grandfather takes remainder
      if(madhab !== 'hanafi' && ((heirs.fullBrother ?? 0) > 0 || (heirs.paternalHalfBrother ?? 0) > 0)) {
           // TODO: Implement complex Maliki/Shafii/Hanbali calculation
           reasons.paternalGrandfather = "Shares remainder with siblings (complex calculation not yet implemented).";
      } else {
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
          shares.paternalGrandfather = (shares.paternalGrandfather ?? new SimpleFraction(0, 1)).add(remainder);
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
    wasRaddApplied = true;
    const surplus = new SimpleFraction(1, 1).sub(finalTotal);
    let raddRecipients = Object.keys(shares) as (keyof Heirs)[];
    
    // Hanbali allows radd to spouse, others do not.
    if(madhab !== 'hanbali'){
        raddRecipients = raddRecipients.filter(h => h !== 'husband' && h !== 'wife');
    }
    
    const raddTotal = raddRecipients.reduce((sum, h) => sum.add(shares[h]!), new SimpleFraction(0, 1));
    
    if (raddTotal.numerator > 0) {
        raddExplanation = `The sum of shares was less than the total estate, so the surplus of ${surplus.toFractionString()} was redistributed (Radd).`;
        for(const heir of raddRecipients){
            shares[heir] = shares[heir]!.add(surplus.mul(shares[heir]!).div(raddTotal));
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
