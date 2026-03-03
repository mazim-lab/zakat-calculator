import {
  MethodologyChoices,
  AssetInputs,
  ZakatResult,
  ZakatBreakdown,
  KhumsResult,
} from "./types";

// Current approximate prices — in production, fetch from API
const GOLD_PRICE_PER_GRAM = 95; // USD — will be dynamic
const SILVER_PRICE_PER_GRAM = 1.05; // USD — will be dynamic
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const WASQ_KG = 653; // 5 wasqs in kg

function getNisabThreshold(choices: MethodologyChoices): number {
  if (choices.nisabStandard === "gold") {
    return GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM;
  }
  return SILVER_NISAB_GRAMS * SILVER_PRICE_PER_GRAM;
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
      notes: `${sheepGoats} head → ${zakatAnimals} animal(s) in Zakat (~$${zakatValue})`,
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
      notes: `${cattle} head → ~$${zakatValue} in Zakat (based on standard livestock rates)`,
    });
  }

  // Camels (simplified)
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
      notes: `${camels} head → ${zakatAnimals} sheep equivalent(s) in Zakat (~$${zakatValue})`,
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

  const yearMultiplier = choices.yearType === "solar" ? 1.03 : 1.0;
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
        notes: `${inputs.goldWeightGrams}g gold at $${goldPrice.toFixed(2)}/g`,
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
      notes: `${inputs.silverWeightGrams}g silver at $${silverPrice.toFixed(2)}/g`,
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
      case "cri_approximation":
        investmentZakat = totalStockValue * 0.3 * 0.025;
        breakdown.push({
          category: "Investments (CRI ~30% Approximation)",
          amount: totalStockValue * 0.3,
          rate: 2.5,
          zakatDue: investmentZakat * yearMultiplier,
          notes: "2.5% on ~30% of market value (CRI approximation for index funds)",
        });
        break;
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

  if (inputs.propertyForSale > 0) {
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

  // 7. Retirement
  if (inputs.retirementBalance > 0 && isJafari) {
    breakdown.push({
      category: "Retirement Accounts",
      amount: inputs.retirementBalance,
      rate: 0,
      zakatDue: 0,
      notes: "Not subject to obligatory Zakat in Ja'farī fiqh — surplus covered by Khums",
    });
  } else if (inputs.retirementBalance > 0) {
    switch (choices.retirementApproach) {
      case "include_annually":
        breakdown.push({
          category: "Retirement Accounts",
          amount: inputs.retirementBalance,
          rate: 2.5,
          zakatDue: inputs.retirementBalance * 0.025 * yearMultiplier,
          notes: "Full balance zakatable annually (FCNA position)",
        });
        totalWealth += inputs.retirementBalance;
        break;
      case "reduced_rate":
        const afterPenalty = inputs.retirementBalance * 0.75; // ~25% for taxes + penalty
        breakdown.push({
          category: "Retirement Accounts (Reduced)",
          amount: afterPenalty,
          rate: 2.5,
          zakatDue: afterPenalty * 0.025 * yearMultiplier,
          notes: "2.5% on estimated accessible amount (~75% after penalties/taxes)",
        });
        totalWealth += afterPenalty;
        break;
      case "exclude_until_withdrawal":
        breakdown.push({
          category: "Retirement Accounts",
          amount: inputs.retirementBalance,
          rate: 0,
          zakatDue: 0,
          notes: "Excluded until withdrawal (no direct access without penalty)",
        });
        break;
    }
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

  const totalZakatDue = breakdown.reduce((sum, b) => sum + b.zakatDue, 0);
  const meetsNisab = totalWealth >= nisab;

  const madhabLabel = choices.madhab === "jafari" ? "Ja'farī" :
    choices.madhab === "custom" ? "Custom Configuration" :
    `${choices.madhab.charAt(0).toUpperCase() + choices.madhab.slice(1)}`;

  return {
    totalZakatableWealth: totalWealth,
    totalZakatDue: meetsNisab ? totalZakatDue : 0,
    nisabThreshold: nisab,
    meetsNisab,
    breakdown,
    methodology: choices.madhab === "custom" ? madhabLabel : `${madhabLabel} School`,
    khums,
  };
}
