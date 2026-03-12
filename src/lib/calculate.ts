import {
  MethodologyChoices,
  AssetInputs,
  ZakatResult,
  ZakatBreakdown,
  KhumsResult,
} from "./types";

// Fallback prices — live prices fetched via /api/metals
// Last updated: 2026-03-11 (gold ~$5,180/oz, silver ~$86/oz)
const GOLD_PRICE_PER_GRAM = 167; // USD per gram
const SILVER_PRICE_PER_GRAM = 2.76; // USD per gram
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const WASQ_KG = 653; // 5 wasqs in kg

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

function calculateLivestockZakat(
  sheepGoats: number,
  cattle: number,
  camels: number
): ZakatBreakdown[] {
  const results: ZakatBreakdown[] = [];

  // Sheep/Goats
  if (sheepGoats >= 40) {
    let zakatAnimals = 0;
    if (sheepGoats <= 120) zakatAnimals = 1;
    else if (sheepGoats <= 200) zakatAnimals = 2;
    else if (sheepGoats <= 399) zakatAnimals = 3;
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
  if (cattle >= 30) {
    let zakatValue = 0;
    if (cattle <= 39) zakatValue = 300; // 1 yearling calf
    else if (cattle <= 59) zakatValue = 500; // 1 two-year-old cow
    else if (cattle <= 69) zakatValue = 600; // 2 yearling calves
    else zakatValue = Math.floor(cattle / 30) * 300 + (cattle % 30 >= 10 ? 200 : 0);

    results.push({
      category: "Cattle",
      amount: cattle,
      rate: 0,
      zakatDue: zakatValue,
      notes: `${cattle} head (based on standard livestock rates)`,
    });
  }

  // Camels (simplified — uses sheep equivalents as a value proxy)
  // Note: Classical fiqh switches from sheep to actual camels at 25+ head
  // (e.g., bint makhāḍ at 25, bint labūn at 36, etc.). Current implementation
  // uses sheep-equivalent valuation as a functional approximation for MVP.
  if (camels >= 5) {
    let zakatAnimals = 0;
    if (camels <= 9) zakatAnimals = 1;
    else if (camels <= 14) zakatAnimals = 2;
    else if (camels <= 19) zakatAnimals = 3;
    else if (camels <= 24) zakatAnimals = 4;
    else zakatAnimals = Math.ceil(camels / 5);

    const zakatValue = zakatAnimals * 150; // approximate sheep value
    results.push({
      category: "Camels",
      amount: camels,
      rate: 0,
      zakatDue: zakatValue,
      notes: `${camels} head → ${zakatAnimals} sheep equivalent(s) due in Zakat`,
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
  const nisab =
    choices.nisabStandard === "gold"
      ? GOLD_NISAB_GRAMS * goldPrice
      : SILVER_NISAB_GRAMS * silverPrice;

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

  // Gold jewelry
  if (inputs.goldJewelryWeightGrams > 0 && choices.jewelryZakatable) {
    const jewelryGoldValue = inputs.goldJewelryWeightGrams * goldPrice;
    breakdown.push({
      category: "Gold Jewelry (worn)",
      amount: jewelryGoldValue,
      rate: 2.5,
      zakatDue: jewelryGoldValue * 0.025 * yearMultiplier,
      notes: `${inputs.goldJewelryWeightGrams}g — Zakatable per your methodology`,
    });
    totalWealth += jewelryGoldValue;
  } else if (inputs.goldJewelryWeightGrams > 0) {
    const jewelryGoldValue = inputs.goldJewelryWeightGrams * goldPrice;
    breakdown.push({
      category: "Gold Jewelry (worn)",
      amount: jewelryGoldValue,
      rate: 0,
      zakatDue: 0,
      notes: "Exempt — worn jewelry not zakatable per your methodology",
    });
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
        inputs.tfsaEquityPercent, inputs.stocksZakatablePercent
      );
      const tfsaZakatable = inputs.tfsaRothBalance * tfsaFraction;
      const isReduced = tfsaFraction < 1;
      breakdown.push({
        category: isReduced ? `TFSA / Roth IRA (~${(tfsaFraction * 100).toFixed(0)}% zakatable)` : "TFSA / Roth IRA",
        amount: tfsaZakatable,
        rate: 2.5,
        zakatDue: tfsaZakatable * 0.025 * yearMultiplier,
        notes: isReduced
          ? `${inputs.tfsaEquityPercent}% equities × ${inputs.stocksZakatablePercent}% zakatable assets + ${100 - inputs.tfsaEquityPercent}% cash at full value`
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
          inputs.rrspEquityPercent, inputs.stocksZakatablePercent
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
            ? `${inputs.rrspEquityPercent}% equities × ${inputs.stocksZakatablePercent}% zakatable assets + ${100 - inputs.rrspEquityPercent}% cash at full value (FCNA)`
            : "Full balance zakatable annually (FCNA position)",
        });
        totalWealth += inputs.rrsp401kBalance;
        break;
      }
      case "net_after_tax": {
        const taxRate = Math.min(100, Math.max(0, inputs.rrspWithholdingTaxPercent)) / 100;
        const netValue = inputs.rrsp401kBalance * (1 - taxRate);
        const netFraction = getRetirementZakatableFraction(
          inputs.rrspEquityPercent, inputs.stocksZakatablePercent
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
            ? `Net after ${(taxRate * 100).toFixed(0)}% tax → ${inputs.rrspEquityPercent}% equities × ${inputs.stocksZakatablePercent}% zakatable + ${100 - inputs.rrspEquityPercent}% cash`
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
        inputs.rrspEquityPercent, inputs.stocksZakatablePercent
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
          ? `Vested match net of ${(taxRate * 100).toFixed(0)}% tax, ${inputs.rrspEquityPercent}% equities × ${inputs.stocksZakatablePercent}% zakatable`
          : `Vested employer match minus ${(taxRate * 100).toFixed(0)}% estimated withdrawal tax`,
      });
      totalWealth += netVested;
    } else {
      // full_balance
      const empFraction = getRetirementZakatableFraction(
        inputs.rrspEquityPercent, inputs.stocksZakatablePercent
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
          ? `Vested match: ${inputs.rrspEquityPercent}% equities × ${inputs.stocksZakatablePercent}% zakatable + ${100 - inputs.rrspEquityPercent}% cash`
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
  if (inputs.cropValueOrWeight > 0) {
    if (choices.agriculturalMinimum && inputs.cropValueOrWeight < WASQ_KG) {
      breakdown.push({
        category: "Agricultural Produce",
        amount: inputs.cropValueOrWeight,
        rate: 0,
        zakatDue: 0,
        notes: `Below 5 wasqs minimum (${WASQ_KG} kg) — exempt per your methodology`,
      });
    } else {
      const agRate = inputs.isIrrigated ? 5 : 10;
      breakdown.push({
        category: "Agricultural Produce",
        amount: inputs.cropValueOrWeight,
        rate: agRate,
        zakatDue: inputs.cropValueOrWeight * (agRate / 100),
        notes: `${agRate}% — ${inputs.isIrrigated ? "irrigated" : "rain-fed/natural"} crops`,
      });
    }
  }

  // 10. Livestock
  const livestockResults = calculateLivestockZakat(
    inputs.sheepGoats,
    inputs.cattle,
    inputs.camels
  );
  breakdown.push(...livestockResults);

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

  totalWealth -= debtDeduction;
  totalWealth = Math.max(0, totalWealth);

  // Debt deduction must proportionally reduce Zakat on each asset category.
  // Example: $100K assets - $90K debt = $10K net → Zakat is 2.5% of $10K, not $100K.
  if (debtDeduction > 0) {
    const grossWealth = totalWealth + debtDeduction;
    const netRatio = grossWealth > 0 ? totalWealth / grossWealth : 0;
    for (const item of breakdown) {
      if (item.zakatDue > 0) {
        item.zakatDue *= netRatio;
      }
    }
  }

  const meetsNisab = totalWealth >= nisab;
  const totalZakatDue = meetsNisab
    ? breakdown.reduce((sum, b) => sum + b.zakatDue, 0)
    : 0;

  // Zero out individual breakdown items if nisab isn't met
  if (!meetsNisab) {
    for (const item of breakdown) {
      item.zakatDue = 0;
    }
  }

  const madhabLabel = choices.madhab === "jafari" ? "Ja'farī" :
    choices.madhab === "custom" ? "Custom Configuration" :
    `${choices.madhab.charAt(0).toUpperCase() + choices.madhab.slice(1)}`;

  return {
    totalZakatableWealth: totalWealth,
    totalZakatDue,
    nisabThreshold: nisab,
    meetsNisab,
    breakdown,
    methodology: choices.madhab === "custom" ? madhabLabel : `${madhabLabel} School`,
    khums,
  };
}
