import {
  MethodologyChoices,
  AssetInputs,
  ZakatResult,
  ZakatBreakdown,
  KhumsResult,
} from "./types";

import { FALLBACK_GOLD_USD_PER_GRAM, FALLBACK_SILVER_USD_PER_GRAM } from "./metal-fallback";

// Fallback prices: live prices are fetched via /api/metals. The stored
// figures and their as-of date live in ./metal-fallback.ts.
const GOLD_PRICE_PER_GRAM = FALLBACK_GOLD_USD_PER_GRAM; // USD per gram
const SILVER_PRICE_PER_GRAM = FALLBACK_SILVER_USD_PER_GRAM; // USD per gram
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const WASQ_KG = 653; // 5 wasqs in kg
// Jaʿfarī figures, Sistani, Islamic Laws (sistani.org/english/book/48/):
// gold: 20 sharʿī mithqāls = 15 ṣayrafī mithqāls = 69.12 g (ruling 1912 and its
// footnote); silver: 105 ṣayrafī mithqāls (ruling 1913), which at the same
// 4.608 g per ṣayrafī mithqāl (69.12 / 15) is 483.84 g; wheat, barley, dates
// and raisins: about 847 kg (ruling 1880).
export const JAFARI_GOLD_NISAB_GRAMS = 69.12;
export const JAFARI_SILVER_NISAB_GRAMS = 483.84;
export const JAFARI_CROP_MINIMUM_KG = 847;

/**
 * For retirement accounts holding equities, returns the zakatable fraction.
 * The equity portion gets the zakatable-assets treatment (stocksZakatablePercent),
 * while the cash portion is fully zakatable (100%).
 *
 * Example: 70% equities, 30% cash, 30% zakatable assets rate
 *   → 0.70 * 0.30 + 0.30 * 1.0 = 0.21 + 0.30 = 0.51 (51% of balance is zakatable)
 *
 * If equityPercent is 0 (all cash), returns 1.0.
 * If equityPercent is 100, returns stocksZakatablePercent/100.
 */
function getRetirementZakatableFraction(
  equityPercent: number,
  stocksZakatablePercent: number
): number {
  const eqPct = Math.min(100, Math.max(0, equityPercent)) / 100;
  if (eqPct === 0) return 1.0; // all cash — fully zakatable
  const stockFraction = Math.min(100, Math.max(0, stocksZakatablePercent)) / 100;
  // Weighted: equity portion × zakatable rate + cash portion × 100%
  return eqPct * stockFraction + (1 - eqPct) * 1.0;
}

// Gold jewelry liquidation value as fraction of spot price.
// Based on real dealer buyback data (canadagold.ca, 2026-03-12).
// These are lower than pure purity fractions because of dealer margins.
const KARAT_LIQUIDATION: Record<number, number> = {
  24: 0.780, 22: 0.699, 21: 0.666, 18: 0.569, 14: 0.439, 10: 0.309, 9: 0.276,
};

// --- Livestock schedules ---------------------------------------------------
// Values used to price animals due: these are the site's existing rough
// estimates (one sheep ~$150, a one-year calf ~$300, a two-year cow ~$500).
// Camels due as camels are not priced: the site has no basis for a figure, so
// they are reported in kind and left out of the cash total.
const SHEEP_VALUE = 150;
const TABI_VALUE = 300;
const MUSINNA_VALUE = 500;

/**
 * Cattle (hadith of Muʿādh, Sunan Abī Dāwūd 1576: a tabīʿ for every 30, a
 * musinnah for every 40; Sistani, Islamic Laws ruling 1927). From 60 head the
 * herd is counted in 30s and 40s with no remainder above nine. Where both fit
 * (for example 120), Ḥanbalī and Jaʿfarī rules let the owner choose and Mālikī
 * and Shāfiʿī rules let the collector choose (al-Mughnī; al-Jazīrī).
 */
export function cattleDue(cattle: number, madhab: string): { tabi: number; musinna: number; alternatives: { tabi: number; musinna: number }[] } | null {
  if (cattle < 30) return null;
  if (cattle < 40) return { tabi: 1, musinna: 0, alternatives: [] };
  if (cattle < 60) return { tabi: 0, musinna: 1, alternatives: [] };
  const counted = Math.floor(cattle / 10) * 10;
  const options: { tabi: number; musinna: number }[] = [];
  for (let m = 0; m * 40 <= counted; m++) {
    const rest = counted - m * 40;
    if (rest % 30 === 0) options.push({ tabi: rest / 30, musinna: m });
  }
  const value = (o: { tabi: number; musinna: number }) => o.tabi * TABI_VALUE + o.musinna * MUSINNA_VALUE;
  options.sort((a, b) => value(a) - value(b));
  const ownerChooses = madhab === "hanbali" || madhab === "jafari";
  const chosen = ownerChooses ? options[0] : options[options.length - 1];
  return { ...chosen, alternatives: options.filter((o) => o !== chosen) };
}

type CamelDue = { sheep: number; bintMakhad: number; bintLabun: number; hiqqa: number; jadhaa: number; alternatives: string[] };

/**
 * Camels. Sunni schools: the letter of Abū Bakr (Ṣaḥīḥ al-Bukhārī 1454).
 * Above 120 the Mālikī, Shāfiʿī and Ḥanbalī schools count a bint labūn per 40
 * and a ḥiqqah per 50 (dorar.net/feqhia/2254, 2256); the Ḥanafī school restarts
 * the schedule after 120 and again after each 50 (al-Nahr al-Fāʾiq,
 * shamela.ws/book/13620/406). Jaʿfarī: Sistani, Islamic Laws ruling 1925
 * (25 camels owe five sheep; the first camel is due at 26).
 */
export function camelsDue(camels: number, madhab: string): CamelDue | null {
  const due: CamelDue = { sheep: 0, bintMakhad: 0, bintLabun: 0, hiqqa: 0, jadhaa: 0, alternatives: [] };
  const jafari = madhab === "jafari";
  if (camels < 5) return null;
  const sheepLimit = jafari ? 25 : 24;
  if (camels <= sheepLimit) { due.sheep = Math.floor(camels / 5); return due; }
  if (camels <= 35) { due.bintMakhad = 1; return due; }
  if (camels <= 45) { due.bintLabun = 1; return due; }
  if (camels <= 60) { due.hiqqa = 1; return due; }
  if (camels <= 75) { due.jadhaa = 1; return due; }
  if (camels <= 90) { due.bintLabun = 2; return due; }
  if (camels <= 120) { due.hiqqa = 2; return due; }
  if (madhab === "hanafi") {
    // Restart (istiʾnāf): 121-149 is two ḥiqqah plus the restarted count above
    // 120; from 150 it is one ḥiqqah per 50 plus the restarted count above.
    const base = camels < 150 ? 2 : Math.floor(camels / 50);
    const extra = camels < 150 ? camels - 120 : camels - base * 50;
    due.hiqqa = base;
    if (extra >= 46) due.hiqqa += 1;
    else if (extra >= 36) due.bintLabun = 1;
    else if (extra >= 25) due.bintMakhad = 1;
    else due.sheep = Math.floor(extra / 5);
    if (camels % 200 === 0) due.alternatives.push(`${camels / 40} bint labūn`);
    return due;
  }
  // Majority and Jaʿfarī: groups of 40 and 50 with no remainder above nine.
  const counted = Math.floor(camels / 10) * 10;
  const options: { l: number; h: number }[] = [];
  for (let h = 0; h * 50 <= counted; h++) {
    const rest = counted - h * 50;
    if (rest % 40 === 0) options.push({ l: rest / 40, h });
  }
  options.sort((a, b) => b.h - a.h);
  const chosen = options[0];
  due.bintLabun = chosen.l;
  due.hiqqa = chosen.h;
  for (const o of options.slice(1)) due.alternatives.push(`${o.l} bint labūn${o.h ? ` and ${o.h} ḥiqqah` : ""}`);
  if (madhab === "maliki" && camels <= 129) due.alternatives.push("2 ḥiqqah (the collector may choose this at 121 to 129)");
  return due;
}

function describeCamels(d: CamelDue): string {
  const parts: string[] = [];
  if (d.sheep) parts.push(`${d.sheep} sheep`);
  if (d.bintMakhad) parts.push(`${d.bintMakhad} bint makhāḍ (female camel in its second year)`);
  if (d.bintLabun) parts.push(`${d.bintLabun} bint labūn (female camel in its third year)`);
  if (d.hiqqa) parts.push(`${d.hiqqa} ḥiqqah (female camel in its fourth year)`);
  if (d.jadhaa) parts.push(`${d.jadhaa} jadhaʿah (female camel in its fifth year)`);
  return parts.join(" and ");
}

function calculateLivestockZakat(
  sheepGoats: number,
  cattle: number,
  camels: number,
  madhab: string = "hanafi"
): ZakatBreakdown[] {
  const results: ZakatBreakdown[] = [];
  const jafari = madhab === "jafari";

  // Sheep/Goats (letter of Abū Bakr, Ṣaḥīḥ al-Bukhārī 1454; Jaʿfarī: Sistani,
  // Islamic Laws ruling 1928, where 301 to 399 owe four sheep)
  if (sheepGoats >= 40) {
    let zakatAnimals = 0;
    if (sheepGoats <= 120) zakatAnimals = 1;
    else if (sheepGoats <= 200) zakatAnimals = 2;
    else if (sheepGoats <= 300) zakatAnimals = 3;
    else if (sheepGoats <= 399) zakatAnimals = jafari ? 4 : 3;
    else zakatAnimals = 3 + Math.floor((sheepGoats - 300) / 100);

    // Approximate value of one sheep/goat at ~$150
    const zakatValue = zakatAnimals * 150;
    results.push({
      category: "Sheep & Goats",
      amount: sheepGoats,
      rate: 0,
      zakatDue: zakatValue,
      notes: `${sheepGoats} head → ${zakatAnimals} animal(s) due in Zakat`,
    });
  }

  // Cattle
  const c = cattleDue(cattle, madhab);
  if (c) {
    const zakatValue = c.tabi * TABI_VALUE + c.musinna * MUSINNA_VALUE;
    const describe = (o: { tabi: number; musinna: number }) =>
      [o.tabi ? `${o.tabi} tabīʿ (calf in its second year)` : "", o.musinna ? `${o.musinna} musinnah (cow in its third year)` : ""].filter(Boolean).join(" and ");
    const alt = c.alternatives.length
      ? `. Also valid: ${c.alternatives.map(describe).join("; ")} (${madhab === "hanbali" || madhab === "jafari" ? "the owner chooses" : madhab === "maliki" || madhab === "shafii" ? "the collector chooses" : "schools differ on who chooses"}; the figure uses the option shown first)`
      : "";
    results.push({
      category: "Cattle",
      amount: cattle,
      rate: 0,
      zakatDue: zakatValue,
      notes: `${cattle} head: ${describe(c)} due, valued at about $${TABI_VALUE} per tabīʿ and $${MUSINNA_VALUE} per musinnah${alt}`,
    });
  }

  // Camels
  const k = camelsDue(camels, madhab);
  if (k) {
    const inKind = k.bintMakhad + k.bintLabun + k.hiqqa + k.jadhaa > 0;
    const alt = k.alternatives.length ? `. Also valid: ${k.alternatives.join("; ")}` : "";
    results.push({
      category: "Camels",
      amount: camels,
      rate: 0,
      zakatDue: inKind ? 0 : k.sheep * SHEEP_VALUE,
      ...(inKind ? { status: "in_kind" as const } : {}),
      notes: inKind
        ? `${camels} head: ${describeCamels(k)} due in kind${alt}. Not priced and not included in the cash total; add the market value of the animal(s) yourself.`
        : `${camels} head: ${k.sheep} sheep due, valued at about $${SHEEP_VALUE} each`,
    });
  }

  return results;
}

export function calculateZakat(
  choices: MethodologyChoices,
  inputs: AssetInputs,
  goldPrice: number = GOLD_PRICE_PER_GRAM,
  silverPrice: number = SILVER_PRICE_PER_GRAM
): ZakatResult {
  const breakdown: ZakatBreakdown[] = [];
  const isJafariNisab = choices.madhab === "jafari";
  const nisab =
    choices.nisabStandard === "gold"
      ? (isJafariNisab ? JAFARI_GOLD_NISAB_GRAMS : GOLD_NISAB_GRAMS) * goldPrice
      : (isJafariNisab ? JAFARI_SILVER_NISAB_GRAMS : SILVER_NISAB_GRAMS) * silverPrice;

  // AAOIFI standard: 365.25 solar days / 354.36 lunar days ≈ 1.0307
  const yearMultiplier = choices.yearType === "solar" ? 1.0307 : 1.0;
  let totalWealth = 0;
  const isJafari = choices.madhab === "jafari";

  // Khums calculation for Ja'fari school
  let khums: KhumsResult | undefined;
  if (isJafari && (inputs.annualIncome > 0 || inputs.annualExpenses > 0)) {
    const surplus = Math.max(0, inputs.annualIncome - inputs.annualExpenses);
    const khumsDue = surplus * 0.2;
    khums = {
      annualIncome: inputs.annualIncome,
      annualExpenses: inputs.annualExpenses,
      surplus,
      khumsDue,
      sahmImam: khumsDue / 2,
      sahmSadat: khumsDue / 2,
    };
  }

  // 1. Cash & Savings
  const cashTotal = inputs.cashOnHand + inputs.bankAccounts + inputs.otherLiquid;
  if (cashTotal > 0 && !isJafari) {
    breakdown.push({
      category: "Cash & Savings",
      amount: cashTotal,
      rate: 2.5,
      zakatDue: cashTotal * 0.025 * yearMultiplier,
      notes: "2.5% on all cash and liquid savings",
    });
    totalWealth += cashTotal;
  } else if (cashTotal > 0 && isJafari) {
    breakdown.push({
      category: "Cash & Savings",
      amount: cashTotal,
      rate: 0,
      zakatDue: 0,
      notes: "Not subject to obligatory Zakat in Ja'farī fiqh — covered by Khums instead",
    });
  }

  // 2. Gold
  const goldValue = inputs.goldWeightGrams * goldPrice;
  if (goldValue > 0) {
    if (isJafari) {
      breakdown.push({
        category: "Gold (coins/bullion)",
        amount: goldValue,
        rate: 2.5,
        zakatDue: goldValue * 0.025 * yearMultiplier,
        notes: `${inputs.goldWeightGrams}g — In Ja'farī fiqh, Zakat is obligatory only on minted gold coins. If this is bullion/bars, it is recommended (mustaḥab) Zakat only.`,
      });
    } else {
      breakdown.push({
        category: "Gold (non-jewelry)",
        amount: goldValue,
        rate: 2.5,
        zakatDue: goldValue * 0.025 * yearMultiplier,
        notes: `${inputs.goldWeightGrams}g of gold (non-jewelry)`,
      });
    }
    totalWealth += goldValue;
  }

  // Gold jewelry — purity-adjusted by karat
  if (inputs.goldJewelryWeightGrams > 0) {
    const karat = inputs.goldJewelryKarat || 22;
    const liquidation = KARAT_LIQUIDATION[karat] ?? 0.699;
    const jewelryGoldPrice = goldPrice * liquidation;
    const jewelryGoldValue = inputs.goldJewelryWeightGrams * jewelryGoldPrice;
    const karatLabel = ` at ${karat}kt (${(liquidation * 100).toFixed(0)}% of spot)`;

    if (choices.jewelryZakatable) {
      breakdown.push({
        category: `Gold Jewelry (worn, ${karat}kt)`,
        amount: jewelryGoldValue,
        rate: 2.5,
        zakatDue: jewelryGoldValue * 0.025 * yearMultiplier,
        notes: `${inputs.goldJewelryWeightGrams}g${karatLabel} — Zakatable per your methodology`,
      });
      totalWealth += jewelryGoldValue;
    } else {
      breakdown.push({
        category: `Gold Jewelry (worn, ${karat}kt)`,
        amount: jewelryGoldValue,
        rate: 0,
        zakatDue: 0,
        notes: `Exempt — worn jewelry not zakatable per your methodology`,
      });
    }
  }

  // 3. Silver
  const silverValue = inputs.silverWeightGrams * silverPrice;
  if (silverValue > 0) {
    breakdown.push({
      category: "Silver (non-jewelry)",
      amount: silverValue,
      rate: 2.5,
      zakatDue: silverValue * 0.025 * yearMultiplier,
      notes: `${inputs.silverWeightGrams}g of silver (non-jewelry)`,
    });
    totalWealth += silverValue;
  }

  // Silver jewelry
  if (inputs.silverJewelryWeightGrams > 0 && choices.jewelryZakatable) {
    const jewelrySilverValue = inputs.silverJewelryWeightGrams * silverPrice;
    breakdown.push({
      category: "Silver Jewelry (worn)",
      amount: jewelrySilverValue,
      rate: 2.5,
      zakatDue: jewelrySilverValue * 0.025 * yearMultiplier,
      notes: `${inputs.silverJewelryWeightGrams}g — Zakatable per your methodology`,
    });
    totalWealth += jewelrySilverValue;
  }

  // 4. Investments
  let investmentZakat = 0;
  const totalStockValue =
    inputs.stocksMarketValue + inputs.mutualFundsETFs + inputs.bonds + inputs.otherInvestments;

  if (totalStockValue > 0 && isJafari) {
    breakdown.push({
      category: "Investments",
      amount: totalStockValue,
      rate: 0,
      zakatDue: 0,
      notes: "Not subject to obligatory Zakat in Ja'farī fiqh — covered by Khums on surplus income",
    });
  } else if (totalStockValue > 0) {
    switch (choices.stockMethod) {
      case "full_market_value":
        investmentZakat = totalStockValue * 0.025;
        breakdown.push({
          category: "Investments (Full Market Value)",
          amount: totalStockValue,
          rate: 2.5,
          zakatDue: investmentZakat * yearMultiplier,
          notes: "2.5% on total market value of all investments",
        });
        break;
      case "zakatable_assets":
        const zakatablePercent = (inputs.stocksZakatablePercent || 30) / 100;
        investmentZakat = totalStockValue * zakatablePercent * 0.025;
        breakdown.push({
          category: "Investments (Zakatable Assets Method)",
          amount: totalStockValue * zakatablePercent,
          rate: 2.5,
          zakatDue: investmentZakat * yearMultiplier,
          notes: `2.5% on ${(zakatablePercent * 100).toFixed(0)}% of market value (zakatable portion)`,
        });
        break;
      case "dividends_only":
        investmentZakat = inputs.stocksDividends * 0.1;
        breakdown.push({
          category: "Investments (Dividends — 10%)",
          amount: inputs.stocksDividends,
          rate: 10,
          zakatDue: investmentZakat * yearMultiplier,
          notes: "10% on dividends received (Qaradawi method)",
        });
        break;
      case "cri_approximation": {
        const criPercent = (inputs.stocksZakatablePercent || 30) / 100;
        investmentZakat = totalStockValue * criPercent * 0.025;
        breakdown.push({
          category: `Investments (CRI ~${(criPercent * 100).toFixed(0)}% Approximation)`,
          amount: totalStockValue * criPercent,
          rate: 2.5,
          zakatDue: investmentZakat * yearMultiplier,
          notes: `2.5% on ~${(criPercent * 100).toFixed(0)}% of market value (CRI approximation for index funds)`,
        });
        break;
      }
    }
    totalWealth += totalStockValue;
  }

  // 5. Real Estate (not applicable for Ja'fari obligatory Zakat)
  if (inputs.rentalIncome > 0 && isJafari) {
    breakdown.push({
      category: "Rental Income",
      amount: inputs.rentalIncome,
      rate: 0,
      zakatDue: 0,
      notes: "Not subject to obligatory Zakat in Ja'farī fiqh — covered by Khums",
    });
  } else if (inputs.rentalIncome > 0) {
    breakdown.push({
      category: "Rental Income",
      amount: inputs.rentalIncome,
      rate: 2.5,
      zakatDue: inputs.rentalIncome * 0.025 * yearMultiplier,
      notes: "Net rental income added to zakatable wealth at 2.5%",
    });
    totalWealth += inputs.rentalIncome;
  }

  if (inputs.propertyForSale > 0 && isJafari) {
    breakdown.push({
      category: "Property Held for Sale",
      amount: inputs.propertyForSale,
      rate: 2.5,
      zakatDue: inputs.propertyForSale * 0.025 * yearMultiplier,
      notes: "Recommended (mustaḥab) Zakat on trade property in Ja'farī fiqh. Surplus also subject to Khums.",
    });
    totalWealth += inputs.propertyForSale;
  } else if (inputs.propertyForSale > 0) {
    breakdown.push({
      category: "Property Held for Sale",
      amount: inputs.propertyForSale,
      rate: 2.5,
      zakatDue: inputs.propertyForSale * 0.025 * yearMultiplier,
      notes: "2.5% on market value of property actively held for sale",
    });
    totalWealth += inputs.propertyForSale;
  }

  // 6. Business Assets
  const businessTotal = inputs.businessCash + inputs.inventory + inputs.receivables;
  if (businessTotal > 0 && isJafari) {
    breakdown.push({
      category: "Business Assets",
      amount: businessTotal,
      rate: 0,
      zakatDue: 0,
      notes: "Business merchandise has recommended (mustaḥab) Zakat in Ja'farī fiqh. Ayatollah Sistani considers it obligatory precaution (iḥtiyāṭ wājib). Surplus covered by Khums.",
    });
  } else if (businessTotal > 0) {
    breakdown.push({
      category: "Business Assets",
      amount: businessTotal,
      rate: 2.5,
      zakatDue: businessTotal * 0.025 * yearMultiplier,
      notes: "2.5% on business cash, inventory (wholesale value), and receivables",
    });
    totalWealth += businessTotal;
  }

  // 7. Tax-Sheltered / Registered & Retirement Accounts

  // 7a. TFSA / Roth IRA — always zakatable (full access, post-tax contributions)
  if (inputs.tfsaRothBalance > 0) {
    if (isJafari) {
      breakdown.push({
        category: "TFSA / Roth IRA",
        amount: inputs.tfsaRothBalance,
        rate: 0,
        zakatDue: 0,
        notes: "Not subject to obligatory Zakat in Ja'farī fiqh — covered by Khums",
      });
    } else {
      const tfsaFraction = getRetirementZakatableFraction(
        inputs.tfsaEquityPercent, inputs.tfsaZakatableAssetsPercent
      );
      const tfsaZakatable = inputs.tfsaRothBalance * tfsaFraction;
      const isReduced = tfsaFraction < 1;
      breakdown.push({
        category: isReduced ? `TFSA / Roth IRA (~${(tfsaFraction * 100).toFixed(0)}% zakatable)` : "TFSA / Roth IRA",
        amount: tfsaZakatable,
        rate: 2.5,
        zakatDue: tfsaZakatable * 0.025 * yearMultiplier,
        notes: isReduced
          ? `${inputs.tfsaEquityPercent}% equities × ${inputs.tfsaZakatableAssetsPercent}% zakatable assets + ${100 - inputs.tfsaEquityPercent}% cash at full value`
          : "Fully zakatable — unrestricted access, post-tax contributions, all scholars agree",
      });
      totalWealth += inputs.tfsaRothBalance;
    }
  }

  // 7b. RRSP / 401(k) / Traditional IRA — depends on chosen approach
  if (inputs.rrsp401kBalance > 0 && isJafari) {
    breakdown.push({
      category: "RRSP / 401(k) / IRA",
      amount: inputs.rrsp401kBalance,
      rate: 0,
      zakatDue: 0,
      notes: "Not subject to obligatory Zakat in Ja'farī fiqh — surplus covered by Khums",
    });
  } else if (inputs.rrsp401kBalance > 0) {
    switch (choices.rrspApproach) {
      case "full_balance": {
        const rrspFraction = getRetirementZakatableFraction(
          inputs.rrspEquityPercent, inputs.rrspZakatableAssetsPercent
        );
        const rrspZakatable = inputs.rrsp401kBalance * rrspFraction;
        const rrspReduced = rrspFraction < 1;
        breakdown.push({
          category: rrspReduced
            ? `RRSP / 401(k) / IRA (~${(rrspFraction * 100).toFixed(0)}% zakatable)`
            : "RRSP / 401(k) / IRA",
          amount: rrspZakatable,
          rate: 2.5,
          zakatDue: rrspZakatable * 0.025 * yearMultiplier,
          notes: rrspReduced
            ? `${inputs.rrspEquityPercent}% equities × ${inputs.rrspZakatableAssetsPercent}% zakatable assets + ${100 - inputs.rrspEquityPercent}% cash at full value (FCNA)`
            : "Full balance zakatable annually (FCNA position)",
        });
        totalWealth += inputs.rrsp401kBalance;
        break;
      }
      case "net_after_tax": {
        const taxRate = Math.min(100, Math.max(0, inputs.rrspWithholdingTaxPercent)) / 100;
        const netValue = inputs.rrsp401kBalance * (1 - taxRate);
        const netFraction = getRetirementZakatableFraction(
          inputs.rrspEquityPercent, inputs.rrspZakatableAssetsPercent
        );
        const netZakatable = netValue * netFraction;
        const netReduced = netFraction < 1;
        breakdown.push({
          category: netReduced
            ? `RRSP / 401(k) / IRA (Net, ~${(netFraction * 100).toFixed(0)}% zakatable)`
            : "RRSP / 401(k) / IRA (Net After Tax)",
          amount: netZakatable,
          rate: 2.5,
          zakatDue: netZakatable * 0.025 * yearMultiplier,
          notes: netReduced
            ? `Net after ${(taxRate * 100).toFixed(0)}% tax → ${inputs.rrspEquityPercent}% equities × ${inputs.rrspZakatableAssetsPercent}% zakatable + ${100 - inputs.rrspEquityPercent}% cash`
            : `Balance minus ${(taxRate * 100).toFixed(0)}% estimated withdrawal tax (NZF Canada position)`,
        });
        totalWealth += netValue;
        break;
      }
      case "defer_to_withdrawal":
        breakdown.push({
          category: "RRSP / 401(k) / IRA (Deferred)",
          amount: inputs.rrsp401kBalance,
          rate: 0,
          zakatDue: 0,
          notes: "Zakat deferred until withdrawal — pay accumulated back-Zakat when funds are accessed (Dr. Monzer Kahf position)",
        });
        break;
      case "exclude":
        breakdown.push({
          category: "RRSP / 401(k) / IRA",
          amount: inputs.rrsp401kBalance,
          rate: 0,
          zakatDue: 0,
          notes: "Excluded — restricted access means incomplete ownership",
        });
        break;
    }
  }

  // 7c. Employer-matched retirement (vested portion follows RRSP approach)
  if (inputs.employerMatchVested > 0) {
    if (isJafari || choices.rrspApproach === "exclude") {
      breakdown.push({
        category: "Employer Match (Vested)",
        amount: inputs.employerMatchVested,
        rate: 0,
        zakatDue: 0,
        notes: isJafari
          ? "Not subject to obligatory Zakat in Ja'farī fiqh — covered by Khums"
          : "Excluded per your retirement methodology",
      });
    } else if (choices.rrspApproach === "defer_to_withdrawal") {
      breakdown.push({
        category: "Employer Match (Vested, Deferred)",
        amount: inputs.employerMatchVested,
        rate: 0,
        zakatDue: 0,
        notes: "Zakat deferred until withdrawal — follows your RRSP treatment",
      });
    } else if (choices.rrspApproach === "net_after_tax") {
      const taxRate = Math.min(100, Math.max(0, inputs.rrspWithholdingTaxPercent)) / 100;
      const netVested = inputs.employerMatchVested * (1 - taxRate);
      const empFraction = getRetirementZakatableFraction(
        inputs.rrspEquityPercent, inputs.rrspZakatableAssetsPercent
      );
      const empZakatable = netVested * empFraction;
      breakdown.push({
        category: empFraction < 1
          ? `Employer Match (Vested, Net, ~${(empFraction * 100).toFixed(0)}% zakatable)`
          : "Employer Match (Vested, Net After Tax)",
        amount: empZakatable,
        rate: 2.5,
        zakatDue: empZakatable * 0.025 * yearMultiplier,
        notes: empFraction < 1
          ? `Vested match net of ${(taxRate * 100).toFixed(0)}% tax, ${inputs.rrspEquityPercent}% equities × ${inputs.rrspZakatableAssetsPercent}% zakatable`
          : `Vested employer match minus ${(taxRate * 100).toFixed(0)}% estimated withdrawal tax`,
      });
      totalWealth += netVested;
    } else {
      // full_balance
      const empFraction = getRetirementZakatableFraction(
        inputs.rrspEquityPercent, inputs.rrspZakatableAssetsPercent
      );
      const empZakatable = inputs.employerMatchVested * empFraction;
      breakdown.push({
        category: empFraction < 1
          ? `Employer Match (Vested, ~${(empFraction * 100).toFixed(0)}% zakatable)`
          : "Employer Match (Vested)",
        amount: empZakatable,
        rate: 2.5,
        zakatDue: empZakatable * 0.025 * yearMultiplier,
        notes: empFraction < 1
          ? `Vested match: ${inputs.rrspEquityPercent}% equities × ${inputs.rrspZakatableAssetsPercent}% zakatable + ${100 - inputs.rrspEquityPercent}% cash`
          : "Vested employer contributions — fully owned (FCNA position)",
      });
      totalWealth += inputs.employerMatchVested;
    }
  }

  // 7d. Unvested employer match — never zakatable
  if (inputs.employerMatchUnvested > 0) {
    breakdown.push({
      category: "Employer Match (Unvested)",
      amount: inputs.employerMatchUnvested,
      rate: 0,
      zakatDue: 0,
      notes: "Not zakatable — unvested matching can be revoked by employer (FCNA)",
    });
  }

  // 8. Crypto
  if (inputs.cryptoValue > 0 && isJafari) {
    breakdown.push({
      category: "Cryptocurrency",
      amount: inputs.cryptoValue,
      rate: 0,
      zakatDue: 0,
      notes: "Not subject to obligatory Zakat in Ja'farī fiqh — surplus covered by Khums",
    });
  } else if (inputs.cryptoValue > 0) {
    switch (choices.cryptoTreatment) {
      case "like_cash":
      case "like_trade_goods":
        breakdown.push({
          category: "Cryptocurrency",
          amount: inputs.cryptoValue,
          rate: 2.5,
          zakatDue: inputs.cryptoValue * 0.025 * yearMultiplier,
          notes: `Treated ${choices.cryptoTreatment === "like_cash" ? "as currency" : "as trade goods"} — 2.5%`,
        });
        totalWealth += inputs.cryptoValue;
        break;
      case "not_zakatable":
        breakdown.push({
          category: "Cryptocurrency",
          amount: inputs.cryptoValue,
          rate: 0,
          zakatDue: 0,
          notes: "Excluded from Zakat calculation per your methodology",
        });
        break;
    }
  }

  // 9. Agriculture
  // The five-wasq minimum is a weight, so it is checked against the harvest
  // weight in kg, never against its money value. The Jaʿfarī minimum is about
  // 847 kg (Sistani, Islamic Laws ruling 1880).
  const cropMinimumKg = isJafari ? JAFARI_CROP_MINIMUM_KG : WASQ_KG;
  const cropWeightKg = inputs.cropWeightKg ?? 0;
  const visibleItems: ZakatBreakdown[] = [];
  if (inputs.cropValueOrWeight > 0) {
    if (choices.agriculturalMinimum && cropWeightKg > 0 && cropWeightKg < cropMinimumKg) {
      visibleItems.push({
        category: "Agricultural Produce",
        amount: inputs.cropValueOrWeight,
        rate: 0,
        zakatDue: 0,
        notes: `${cropWeightKg} kg is below the 5-wasq minimum (${cropMinimumKg} kg), so it is exempt per your methodology`,
      });
    } else {
      const agRate = inputs.isIrrigated ? 5 : 10;
      const unchecked = choices.agriculturalMinimum && cropWeightKg <= 0
        ? `. Harvest weight not entered, so the ${cropMinimumKg} kg minimum was not checked`
        : "";
      visibleItems.push({
        category: "Agricultural Produce",
        amount: inputs.cropValueOrWeight,
        rate: agRate,
        zakatDue: inputs.cropValueOrWeight * (agRate / 100),
        notes: `${agRate}% of the harvest value, ${inputs.isIrrigated ? "irrigated" : "rain-fed/natural"} crops${unchecked}`,
      });
    }
  }

  // 10. Livestock
  visibleItems.push(...calculateLivestockZakat(
    inputs.sheepGoats,
    inputs.cattle,
    inputs.camels,
    choices.madhab
  ));
  breakdown.push(...visibleItems);
  // Crops and livestock carry their own minimum (five wasqs; 40 sheep, 30
  // cattle, 5 camels) and are never combined with money to reach a niṣāb
  // (Ṣaḥīḥ al-Bukhārī 1447 and 1454; al-Mughnī, Book of Zakat). They are kept
  // out of the money niṣāb test and out of the debt deduction below.
  const isVisible = (b: ZakatBreakdown) => visibleItems.includes(b);

  // 11. Debt deduction
  let debtDeduction = 0;

  // Short-term debts (fully deductible in all schools that allow debt deduction)
  const shortTermDebt =
    inputs.creditCardBalance +
    inputs.personalLoans +
    inputs.otherShortTermDebt;

  // Long-term debts — principal portions only (interest is not a legitimate Islamic liability)
  const monthlyLongTermPrincipal =
    inputs.monthlyMortgagePrincipal +
    inputs.monthlyStudentLoanPrincipal +
    inputs.monthlyCarLoanPrincipal +
    inputs.monthlyOtherLongTermPrincipal;

  const singleInstallmentPrincipal = monthlyLongTermPrincipal; // one month
  const twelveMonthsPrincipal = monthlyLongTermPrincipal * 12; // 12 months

  if (choices.debtDeduction === "twelve_months_principal") {
    // Ḥanafī / Ḥanbalī: short-term fully + up to 12 months of long-term principal
    debtDeduction = shortTermDebt + twelveMonthsPrincipal;
    if (debtDeduction > 0) {
      breakdown.push({
        category: "Debt Deduction (Short-term)",
        amount: -shortTermDebt,
        rate: 0,
        zakatDue: 0,
        notes: "Short-term debts due within 12 months — fully deducted",
      });
      if (twelveMonthsPrincipal > 0) {
        breakdown.push({
          category: "Debt Deduction (Long-term — 12 mo. principal)",
          amount: -twelveMonthsPrincipal,
          rate: 0,
          zakatDue: 0,
          notes: "12 months of principal payments on long-term debts (interest excluded)",
        });
      }
    }
  } else if (choices.debtDeduction === "single_installment") {
    // Stricter sub-opinion: only single currently-due installment
    debtDeduction = shortTermDebt + singleInstallmentPrincipal;
    if (debtDeduction > 0) {
      breakdown.push({
        category: "Debt Deduction (Short-term)",
        amount: -shortTermDebt,
        rate: 0,
        zakatDue: 0,
        notes: "Short-term debts due within 12 months — fully deducted",
      });
      if (singleInstallmentPrincipal > 0) {
        breakdown.push({
          category: "Debt Deduction (Long-term — single installment)",
          amount: -singleInstallmentPrincipal,
          rate: 0,
          zakatDue: 0,
          notes: "Single currently-due principal installment only (interest excluded)",
        });
      }
    }
  } else if (choices.debtDeduction === "hidden_wealth_only") {
    // Mālikī: debts deductible against hidden wealth (cash, gold, silver, trade goods)
    // but NOT against visible wealth (livestock, crops). For most modern users this
    // behaves like twelve_months_principal since their wealth is cash/investments.
    debtDeduction = shortTermDebt + twelveMonthsPrincipal;
    if (debtDeduction > 0) {
      breakdown.push({
        category: "Debt Deduction (Hidden Wealth — Short-term)",
        amount: -shortTermDebt,
        rate: 0,
        zakatDue: 0,
        notes: "Short-term debts deducted from hidden wealth (cash, gold, trade goods)",
      });
      if (twelveMonthsPrincipal > 0) {
        breakdown.push({
          category: "Debt Deduction (Hidden Wealth — Long-term principal)",
          amount: -twelveMonthsPrincipal,
          rate: 0,
          zakatDue: 0,
          notes: "12 months of principal on long-term debts, deducted from hidden wealth only",
        });
      }
    }
  }
  // "no_deduction" (Shāfiʿī / Jaʿfarī) — debtDeduction stays 0

  // NZF approach: debts decrease your overall zakatable wealth directly.
  // Sum zakatable amounts from breakdown, subtract debts, pay 2.5% on remainder.
  // Only money items that are actually charged count in the base: exempt rows
  // (rate 0: exempt jewellery, deferred or excluded retirement funds, unvested
  // match, Jaʿfarī rows covered by Khums) and crops and livestock (head counts
  // and harvest values) are left out, so a debt is not diluted across them.
  const grossZakatableBase = breakdown
    .filter((b) => b.amount > 0 && b.rate > 0 && !isVisible(b))
    .reduce((sum, b) => sum + b.amount, 0);
  const netZakatableWealth = Math.max(0, grossZakatableBase - debtDeduction);

  // How debts bear on crops and livestock differs by school (Dar al-Iftaa
  // al-Misriyyah fatwa 15928; Kashshaf al-Qina'; Bada'i' al-Sana'i'). Malikis and
  // Shafi'is: debts never reduce them. Hanafis: debts never reduce crops, and
  // reach livestock only after money and trade goods are used up. Hanbalis (relied-
  // upon view): debts reduce crops and livestock too. The calculator does not work
  // out those splits; where they apply it declines the affected lines.
  const warnings: string[] = [];
  const dueVisible = (b: ZakatBreakdown) => isVisible(b) && (b.zakatDue > 0 || b.status === "in_kind");
  const isLivestock = (b: ZakatBreakdown) => /^(Sheep & Goats|Cattle|Camels)$/.test(b.category);
  let declineVisible: ((b: ZakatBreakdown) => boolean) | null = null;
  if (debtDeduction > 0 && choices.madhab === "hanbali" && breakdown.some(dueVisible)) {
    declineVisible = (b) => dueVisible(b);
    warnings.push("In the relied-upon Hanbali view, debts also reduce Zakat on crops and livestock. This calculator does not yet work out how a debt is divided between money, crops and livestock, so the crop and livestock lines are not calculated, and the money figure assumes the whole debt is set against money. This case is not yet supported; please consult a scholar.");
  } else if (choices.madhab === "hanafi" && debtDeduction > grossZakatableBase && breakdown.some((b) => dueVisible(b) && isLivestock(b))) {
    declineVisible = (b) => dueVisible(b) && isLivestock(b);
    warnings.push("In the Hanafi school, debts that are larger than your money and trade goods also reduce Zakat on livestock (crops are not reduced). This calculator does not yet work out that reduction, so the livestock lines are not calculated. This case is not yet supported; please consult a scholar.");
  }
  if (declineVisible) {
    for (const b of breakdown) {
      if (declineVisible(b)) {
        b.zakatDue = 0;
        b.status = "not_calculated";
        b.notes = `Not calculated: your school counts debts against this too (see the warning above). ${b.notes}`;
      }
    }
  }
  if (debtDeduction > 0 && choices.madhab === "maliki") {
    warnings.push("In the Maliki school a debt reduces Zakat on money only when you have no other assets to pay it from, such as crops, livestock or goods you own beyond your basic needs that would be sold to pay creditors. The figure assumes you have none. If you do, the debt is set against them first and your Zakat on money may be higher, up to the figure without any debt deduction. Please check with a scholar.");
  }

  // For nisab check, use gross wealth minus debts (includes non-zakatable portions)
  totalWealth -= debtDeduction;
  totalWealth = Math.max(0, totalWealth);

  const meetsNisab = totalWealth >= nisab;

  // Recalculate zakat: 2.5% on net zakatable wealth (after debt subtraction)
  // Replace individual category zakat with simple flat calculation
  if (debtDeduction > 0 && grossZakatableBase > 0) {
    const reductionRatio = netZakatableWealth / grossZakatableBase;
    for (const item of breakdown) {
      if (item.zakatDue > 0 && !isVisible(item)) {
        item.zakatDue *= reductionRatio;
      }
    }
  }

  // The money niṣāb governs money items only; crops and livestock that reach
  // their own minimum stay due even when cash is below the money niṣāb.
  if (!meetsNisab) {
    for (const item of breakdown) {
      if (!isVisible(item)) item.zakatDue = 0;
    }
  }
  const totalZakatDue = breakdown.reduce((sum, b) => sum + b.zakatDue, 0);

  const madhabLabel = choices.madhab === "jafari" ? "Ja'farī" :
    choices.madhab === "custom" ? "Custom Configuration" :
    `${choices.madhab.charAt(0).toUpperCase() + choices.madhab.slice(1)}`;

  return {
    totalZakatableWealth: netZakatableWealth,
    totalNetWealth: totalWealth,
    totalZakatDue,
    nisabThreshold: nisab,
    meetsNisab,
    breakdown,
    methodology: choices.madhab === "custom" ? madhabLabel : `${madhabLabel} School`,
    khums,
    ...(warnings.length ? { warnings } : {}),
  };
}
