export interface ScholarlyPosition {
  school: string;
  position: string;
  reasoning: string;
}

export interface InfoPanel {
  title: string;
  description: string;
  positions: ScholarlyPosition[];
  note?: string;
}

export const MADHAB_INFO: Record<string, { name: string; nameAr: string; description: string; regions: string; founder: string }> = {
  jafari: {
    name: "Ja'farī",
    nameAr: "جعفري",
    description: "The primary school of Twelver Shia Islam. Zakat is obligatory on only 9 specific items (wheat, barley, dates, raisins, gold coins, silver coins, sheep, cattle, camels). Cash, investments, and modern financial assets are NOT subject to obligatory Zakat — instead, Khums (20% on surplus annual income) is the primary wealth obligation.",
    regions: "Iran, Iraq, Lebanon, Bahrain, parts of Gulf, South Asia",
    founder: "Imām Jaʿfar al-Ṣādiq (702–765 CE)",
  },
  hanafi: {
    name: "Ḥanafī",
    nameAr: "حنفي",
    description: "The most widely followed school globally, known for its use of analogical reasoning (qiyās) and juristic preference (istiḥsān). Generally the most cautious approach to Zakat — more assets are zakatable, and the silver nisab means more people meet the threshold.",
    regions: "South Asia, Turkey, Central Asia, parts of Middle East",
    founder: "Imām Abū Ḥanīfa al-Nuʿmān (699–767 CE)",
  },
  maliki: {
    name: "Mālikī",
    nameAr: "مالكي",
    description: "Rooted in the practice of the people of Madīnah and the principle of public interest (maṣlaḥa). Takes a moderate approach to Zakat with emphasis on the practical welfare of the community.",
    regions: "North Africa, West Africa, parts of Gulf",
    founder: "Imām Mālik ibn Anas (711–795 CE)",
  },
  shafii: {
    name: "Shāfiʿī",
    nameAr: "شافعي",
    description: "Known for its systematic methodology combining textual evidence with analogical reasoning. Takes a balanced approach — debts generally do not reduce zakatable wealth, but worn jewelry is exempt.",
    regions: "East Africa, Southeast Asia, parts of Middle East, Egypt",
    founder: "Imām Muḥammad ibn Idrīs al-Shāfiʿī (767–820 CE)",
  },
  hanbali: {
    name: "Ḥanbalī",
    nameAr: "حنبلي",
    description: "Most closely adheres to literal textual evidence from the Quran and Sunnah. Similar to the Ḥanafī school on debt deductions but aligns with the majority on jewelry exemption.",
    regions: "Saudi Arabia, parts of Gulf",
    founder: "Imām Aḥmad ibn Ḥanbal (780–855 CE)",
  },
};

export const NISAB_INFO: InfoPanel = {
  title: "Nisab Threshold",
  description: "The minimum amount of wealth a Muslim must possess for one lunar year before Zakat becomes obligatory. There are two standards used by scholars.",
  positions: [
    {
      school: "Gold Standard (Majority)",
      position: "85 grams of gold",
      reasoning: "Gold is a far more stable measure of actual wealth. Using silver would force genuinely poor people to pay Zakat. At the time of the Prophet ﷺ, 20 gold dinars equalled 200 silver dirhams — today they are drastically different in purchasing power.",
    },
    {
      school: "Silver Standard (Ḥanafī / Some Organizations)",
      position: "595 grams of silver",
      reasoning: "The more cautious (conservative) approach — more people meet the threshold, meaning more Zakat reaches those in need. Some scholars argue this was the original standard established by the Prophet ﷺ.",
    },
  ],
  note: "The practical difference is enormous. In 2026, the gold nisab is approximately $7,500–8,500 while the silver nisab is approximately $450–625.",
};

export const JEWELRY_INFO: InfoPanel = {
  title: "Zakat on Women's Jewelry",
  description: "One of the most well-known areas of disagreement between the schools of Islamic jurisprudence.",
  positions: [
    {
      school: "Ḥanafī School",
      position: "Zakat IS due on all gold and silver jewelry, even if worn",
      reasoning: "Gold and silver possess intrinsic monetary value regardless of their form or use. The Quran warns against hoarding gold and silver (9:34). The Prophet ﷺ asked women wearing gold bracelets: \"Do you pay Zakat on this?\" When they said no, he said: \"Would you like Allah to make bracelets of fire for you?\"",
    },
    {
      school: "Mālikī, Shāfiʿī, and Ḥanbalī Schools",
      position: "Zakat is NOT due on jewelry worn as personal adornment",
      reasoning: "Personal-use items are exempt from Zakat (like one's home and clothing). If the jewelry is worn regularly and not hoarded or held as investment, it falls under personal use. The hadith used by Ḥanafī scholars is debated in its grading.",
    },
  ],
  note: "NZF Canada recommends paying Zakat on jewelry as the more cautious position. Jewelry not worn or held as investment is zakatable according to all schools.",
};

export const STOCK_INFO: InfoPanel = {
  title: "Zakat on Stocks & Investments",
  description: "Modern scholars classify stocks based on the investor's relationship to their holdings.",
  positions: [
    {
      school: "Full Market Value (Short-term Traders)",
      position: "2.5% on the total market value of all holdings",
      reasoning: "When stocks are frequently bought and sold, they resemble trade goods (ʿurūḍ al-tijārah). The investor views them as commodities, not business ownership. AAOIFI and International Fiqh Academy endorsed.",
    },
    {
      school: "Zakatable Assets Method (Long-term Investors)",
      position: "2.5% on your prorated share of the company's zakatable assets (cash + receivables + inventory)",
      reasoning: "Long-term investors treat stocks as fractional business ownership. You only pay Zakat on the business's zakatable portion — not fixed assets like buildings and machinery. FCNA endorsed.",
    },
    {
      school: "Dividends Only (Qaradawi Method)",
      position: "10% on dividends received",
      reasoning: "Analogized to agricultural produce — profits from invested capital, like crops from land. Proposed by Yusuf al-Qaradawi in Fiqh al-Zakat. Not widely adopted by fiqh councils.",
    },
    {
      school: "CRI / 30% Approximation",
      position: "2.5% on approximately 30% of market value",
      reasoning: "A practical shortcut for index fund/ETF holders where individual company analysis is impractical. Approximates the zakatable assets as ~30% of total value. Used by some contemporary American scholars.",
    },
  ],
};

export const RETIREMENT_INFO: InfoPanel = {
  title: "Zakat on Retirement Accounts",
  description: "A modern question with significant scholarly disagreement, as retirement accounts (401k, IRA, RRSP, pensions) didn't exist in classical Islamic jurisprudence.",
  positions: [
    {
      school: "Zakat IS Due Annually (FCNA)",
      position: "Pay 2.5% on the full balance each year",
      reasoning: "It is your wealth — you chose to place it there. The restriction on early withdrawal is voluntary. The Fiqh Council considers these accounts analogous to any other investment that grows over time.",
    },
    {
      school: "Exclude Until Withdrawal (Zakat Foundation, others)",
      position: "No Zakat until funds are accessed",
      reasoning: "You do not have full ownership/access without significant penalty. Similar to a debt owed to you that you cannot collect. Zakat is only on wealth you freely control.",
    },
    {
      school: "Reduced Rate",
      position: "Pay on estimated accessible amount (~75% after penalties/taxes)",
      reasoning: "A middle position that acknowledges the wealth exists but accounts for the reduced value if accessed early. Practical compromise.",
    },
  ],
};

export const DEBT_INFO: InfoPanel = {
  title: "Debt & Zakat",
  description: "Whether and how debts reduce your zakatable wealth is a significant area of disagreement.",
  positions: [
    {
      school: "Ḥanafī & Ḥanbalī Schools",
      position: "Full debt can be deducted from zakatable wealth",
      reasoning: "Debt reduces your net wealth. If deducting debts brings you below nisab, you are not required to pay Zakat.",
    },
    {
      school: "Mālikī School",
      position: "Only debts that would bring wealth below nisab are deductible",
      reasoning: "Partial deduction — debts are considered but only to the extent they affect your nisab eligibility.",
    },
    {
      school: "Shāfiʿī School",
      position: "Debts generally do not reduce zakatable wealth",
      reasoning: "Zakat and debt are separate obligations. A minority opinion within the school allows some deduction.",
    },
    {
      school: "Modern Majority (for long-term debts)",
      position: "Only currently-due payments are deductible (not total mortgage/student loan balance)",
      reasoning: "Long-term debts like mortgages and student loans are repaid gradually. Only the payment currently owed at your Zakat Due Date should be deducted, not the entire remaining balance.",
    },
  ],
  note: "This is especially relevant for people with large mortgages or student loans. Under full deduction, a person with $100,000 in savings but $300,000 in mortgage debt would owe no Zakat. Under currently-due-only, they would deduct only the current monthly payment.",
};

export const CRYPTO_INFO: InfoPanel = {
  title: "Zakat on Cryptocurrency",
  description: "An emerging area where scholarly consensus has not yet fully formed.",
  positions: [
    {
      school: "Like Currency (Majority of scholars who consider crypto halal)",
      position: "Add market value to overall wealth, apply 2.5%",
      reasoning: "Cryptocurrency functions as a medium of exchange and store of value, similar to fiat currency. If it meets nisab and hawl requirements, it is zakatable.",
    },
    {
      school: "Like Trade Goods",
      position: "2.5% on market value (same calculation, different classification)",
      reasoning: "Crypto is more like a commodity traded for profit than a true currency. Treated as trade goods (ʿurūḍ al-tijārah).",
    },
    {
      school: "Not Zakatable (Minority)",
      position: "Excluded from Zakat",
      reasoning: "Some scholars who consider cryptocurrency impermissible (ḥarām) do not consider it subject to Zakat rules. However, even impermissible wealth carries Zakat obligations according to many scholars.",
    },
  ],
};

export const AGRICULTURE_INFO: InfoPanel = {
  title: "Zakat on Agricultural Produce",
  description: "Agricultural Zakat (ʿUshr) is due at harvest time — no waiting period (ḥawl) required.",
  positions: [
    {
      school: "Ḥanafī School",
      position: "Zakat on ANY quantity of crops — no minimum threshold",
      reasoning: "Based on the hadith: \"A tenth (1/10) is obliged on that which the sky waters\" (Bukhari). This sets the rate without specifying a minimum. Also applies Zakat on all types of produce including vegetables and honey.",
    },
    {
      school: "Majority (Mālikī, Shāfiʿī, Ḥanbalī)",
      position: "Minimum threshold of 5 wasqs (~653 kg / 1,439 lb)",
      reasoning: "Based on the hadith: \"No ṣadaqah is obligatory on anything less than five wasqs.\" The majority holds this hadith directly sets the nisab for agricultural produce.",
    },
  ],
  note: "Rate is 10% for rain-fed/natural irrigation, 5% for artificially irrigated crops, and 7.5% for mixed irrigation. Due immediately upon harvest.",
};

export const KHUMS_INFO: InfoPanel = {
  title: "Khums — The Fifth",
  description: "Khums is a 20% tax on surplus annual income, primarily observed in Twelver Shia Islam. It is based on Quran 8:41 and is considered one of the most important financial obligations.",
  positions: [
    {
      school: "Ja'farī (Twelver Shia) Position",
      position: "20% on surplus income after annual expenses",
      reasoning: "After deducting all legitimate living expenses for yourself and your family from your annual income, 20% of the remaining surplus must be paid as Khums. This applies to all forms of income including salary, business profits, gifts, and inheritance. Khums covers the financial obligation on wealth that Sunni schools address through Zakat on cash, investments, etc.",
    },
    {
      school: "Distribution",
      position: "Split equally into Sahm al-Imam and Sahm al-Sadat",
      reasoning: "Half goes to the Imam's share (Sahm al-Imam), directed by the Marja' al-Taqlid (religious authority), and half goes to Sahm al-Sadat, distributed to needy descendants of the Prophet ﷺ (Sayyids/Hashemites), who cannot receive regular Zakat.",
    },
    {
      school: "Sunni Schools",
      position: "Khums applies only to war booty (ghanima)",
      reasoning: "The four Sunni schools interpret Quran 8:41 as applying specifically to spoils of war, not to general income or surplus wealth. They do not recognize Khums as an ongoing tax on personal income.",
    },
  ],
  note: "Per Ayatollah Sistani: 'If your income exceeds the annual expenses of yourself and your family, Khums (20%) should be paid from the excess.' Cash in bank accounts has no obligatory Zakat — rather, Khums is payable on it if not spent.",
};

export const YEAR_INFO: InfoPanel = {
  title: "Lunar vs Solar Year",
  description: "Zakat traditionally follows the Islamic lunar calendar (Hijri), which has approximately 354 days. Some Muslims calculate based on the solar (Gregorian) calendar for convenience.",
  positions: [
    {
      school: "Lunar Year (Standard)",
      position: "Calculate Zakat on the lunar year (354 days)",
      reasoning: "The Islamic obligation follows the lunar calendar. This is the standard position of all four schools.",
    },
    {
      school: "Solar Year (with adjustment)",
      position: "Add approximately 3% to the Zakat amount to account for the extra 11 days",
      reasoning: "For those who calculate based on the Gregorian year for practical reasons. The 3% adjustment compensates for the additional days of wealth growth.",
    },
  ],
};
