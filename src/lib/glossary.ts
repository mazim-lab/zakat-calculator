// Glossary of the technical terms used across the calculators and the
// scholarly notes in src/lib/**. Definitions are plain dictionary-level
// meanings. Figures appear only where the site's own code uses them, and are
// then stated as "this calculator uses ...".

export interface GlossaryEntry {
  /** Anchor id on /glossary. Stable: other pages may link to /glossary#id. */
  id: string;
  /** Transliteration as used on the site. */
  term: string;
  /** Arabic script. */
  ar: string;
  /** Other spellings readers may meet. */
  also?: string;
  /** Plain-English definition, 1 to 3 sentences. */
  definition: string;
  /** Calculator page where the term is used. */
  href: string;
  /** Short label for that link. */
  hrefLabel: string;
}

const ZAKAT = { href: "/zakat", hrefLabel: "Zakat calculator" };
const FITR = { href: "/zakat-fitr", hrefLabel: "Zakat al-Fiṭr calculator" };
const INHERITANCE = { href: "/inheritance", hrefLabel: "Inheritance calculator" };
const FIDYA = { href: "/fidya", hrefLabel: "Fidya calculator" };
const KAFFARAH = { href: "/kaffarah", hrefLabel: "Kaffārah calculator" };
const FINDER = { href: "/find-your-school", hrefLabel: "Find your school" };

const ENTRIES: GlossaryEntry[] = [
  // ---- Zakat on wealth ----
  {
    id: "zakat",
    term: "Zakat",
    ar: "زكاة",
    also: "zakāh, zakah",
    definition:
      "The obligatory annual almsgiving, one of the five pillars of Islam. It is paid on certain kinds of wealth once they reach a minimum amount (niṣāb) and, for most kinds, have been held for a full year (ḥawl). This calculator applies a rate of 2.5% to most zakatable wealth.",
    ...ZAKAT,
  },
  {
    id: "zakat-al-mal",
    term: "Zakat al-Māl",
    ar: "زكاة المال",
    definition:
      "Zakat on wealth: the annual Zakat on money, gold, silver, trade goods, crops and livestock. The name separates it from Zakat al-Fiṭr, the per-person payment at the end of Ramadan.",
    ...ZAKAT,
  },
  {
    id: "nisab",
    term: "Niṣāb",
    ar: "نصاب",
    also: "nisab",
    definition:
      "The minimum amount of wealth you must own before Zakat is due. Schools differ on whether to measure it by gold or by silver. This calculator uses 85 g of gold or 595 g of silver, depending on the standard you choose; for the Jaʿfarī school it uses Sistani's 69.12 g of gold or about 483.84 g of silver (a derived conversion of his 105 ṣayrafī mithqāls; his Summary of the Rules of Worship says about 487 g).",
    ...ZAKAT,
  },
  {
    id: "hawl",
    term: "Ḥawl",
    ar: "حول",
    also: "hawl",
    definition:
      "The full year that zakatable wealth must stay at or above the niṣāb before Zakat is due on it. It is counted in lunar (Hijri) months. Crops are an exception: their Zakat is due at harvest, with no ḥawl.",
    ...ZAKAT,
  },
  {
    id: "hijri-year",
    term: "Hijri (lunar) year",
    ar: "السنة الهجرية",
    definition:
      "The Islamic calendar year of twelve lunar months, about 354 days, so roughly 11 days shorter than the solar year. Zakat traditionally follows it. If you choose a solar year, this calculator multiplies most Zakat amounts by 1.0307 to cover the extra days.",
    ...ZAKAT,
  },
  {
    id: "ushr",
    term: "ʿUshr and half ʿushr",
    ar: "العشر ونصف العشر",
    also: "ushr",
    definition:
      "ʿUshr means \"one tenth\": the Zakat on crops watered by rain or natural sources. Half ʿushr (one twentieth) applies to crops watered by artificial irrigation. This calculator uses 10% and 5%.",
    ...ZAKAT,
  },
  {
    id: "wasq",
    term: "Wasq",
    ar: "وسق",
    also: "plural awsuq; often written wasqs",
    definition:
      "An old Arabian measure of volume, used to set the niṣāb for crops at five wasqs. Most schools apply this minimum; the Ḥanafī school charges Zakat on any quantity. This calculator uses 653 kg for five wasqs, and about 847 kg for the Jaʿfarī school (Sistani), checked against the weight of the harvest.",
    ...ZAKAT,
  },
  {
    id: "mithqal",
    term: "Mithqāl",
    ar: "مثقال",
    definition:
      "A traditional unit of weight for gold and silver. The Jaʿfarī school states its niṣāb for gold and silver coins in mithqāls, as the site's Zakat notes explain.",
    ...ZAKAT,
  },
  {
    id: "urud-al-tijarah",
    term: "ʿUrūḍ al-tijārah",
    ar: "عروض التجارة",
    definition:
      "Trade goods: anything owned with the intention of selling it for profit, such as stock in a shop. Trade goods are zakatable at their value. Some scholars classify actively traded shares and cryptocurrency the same way.",
    ...ZAKAT,
  },
  {
    id: "milkiyyah-tammah",
    term: "Milkiyyah tāmmah",
    ar: "ملكية تامة",
    definition:
      "Complete ownership: you own the wealth and can use or dispose of it. It is a condition for Zakat, which is why scholars discuss accounts with restricted access, such as some retirement plans and unvested employer contributions.",
    ...ZAKAT,
  },
  {
    id: "batin-zahir",
    term: "Bāṭin and ẓāhir wealth",
    ar: "الأموال الباطنة والظاهرة",
    definition:
      "Hidden (bāṭin) wealth is wealth others cannot easily see, such as cash, gold, silver and trade goods. Visible (ẓāhir) wealth is wealth anyone can see, such as livestock and crops. The Mālikī school lets debts reduce hidden wealth only.",
    ...ZAKAT,
  },
  {
    id: "riba",
    term: "Ribā",
    ar: "ربا",
    also: "riba",
    definition:
      "Usury or interest, which Islam forbids. When this calculator deducts loan repayments from your Zakat, it counts only the principal, never the interest.",
    ...ZAKAT,
  },
  {
    id: "khums",
    term: "Khums",
    ar: "خمس",
    definition:
      "Literally \"one fifth\". In the Jaʿfarī school, Khums is 20% of the income left over after a year's living expenses (the rate this calculator uses), and it is the main obligation on cash and savings. The Sunni schools apply the Qurʾānic Khums to spoils of war only.",
    ...ZAKAT,
  },
  {
    id: "sahm-al-imam",
    term: "Sahm al-Imām and Sahm al-Sādah",
    ar: "سهم الإمام وسهم السادة",
    also: "Sahm al-Sadat",
    definition:
      "The two halves of Khums in the Jaʿfarī school. This calculator splits Khums equally between them. The Imam's share is directed by your religious authority (marjaʿ); the share of the Sayyids goes to needy descendants of the Prophet ﷺ, who may not receive ordinary Zakat.",
    ...ZAKAT,
  },
  {
    id: "marja",
    term: "Marjaʿ al-taqlīd",
    ar: "مرجع التقليد",
    also: "marja'",
    definition:
      "In Twelver Shia practice, the senior scholar whose rulings a believer follows (taqlīd means following). The marjaʿ also directs the Imam's share of Khums.",
    ...ZAKAT,
  },
  {
    id: "ghanimah",
    term: "Ghanīmah",
    ar: "غنيمة",
    also: "ghanima",
    definition:
      "Spoils of war. The four Sunni schools read the Khums verse of the Qurʾān (8:41) as applying to ghanīmah, not to ordinary income.",
    ...ZAKAT,
  },
  {
    id: "mustahab",
    term: "Mustaḥab",
    ar: "مستحب",
    definition:
      "Recommended: an act that earns reward if done, with no sin if left. The site uses it, for example, for Zakat that the Jaʿfarī school recommends but does not require.",
    ...ZAKAT,
  },
  {
    id: "wajib",
    term: "Wājib",
    ar: "واجب",
    definition:
      "Obligatory: an act you must do. In the Ḥanafī school, wājib is a separate category just below farḍ (a duty proven by decisive evidence). The other schools generally use the two words as equivalents.",
    ...FITR,
  },
  {
    id: "ihtiyat-wajib",
    term: "Iḥtiyāṭ wājib",
    ar: "احتياط واجب",
    definition:
      "Obligatory precaution: a term in Twelver Shia rulings. The scholar does not give a definite ruling but tells followers to act on the cautious view, or to follow another qualified scholar on that point.",
    ...ZAKAT,
  },

  // ---- Zakat al-Fitr ----
  {
    id: "zakat-al-fitr",
    term: "Zakat al-Fiṭr",
    ar: "زكاة الفطر",
    also: "Ṣadaqat al-Fiṭr, Fiṭrānah",
    definition:
      "A fixed charity paid for each member of a household at the end of Ramadan, before the Eid al-Fiṭr prayer. It is separate from Zakat al-Māl and does not depend on the size of your wealth.",
    ...FITR,
  },
  {
    id: "sadaqah",
    term: "Ṣadaqah",
    ar: "صدقة",
    also: "sadaqa",
    definition:
      "Charity. Usually it means voluntary giving, though the word can also cover obligatory alms. Zakat al-Fiṭr is also called Ṣadaqat al-Fiṭr.",
    ...FITR,
  },
  {
    id: "sa",
    term: "Ṣāʿ",
    ar: "صاع",
    also: "saa, sa'",
    definition:
      "A measure of volume from the time of the Prophet ﷺ, equal to four mudd. Its weight depends on the food and on the school. This calculator uses about 2.5 kg for one ṣāʿ (Mālikī, Shāfiʿī, Ḥanbalī), about 3 kg (Jaʿfarī), and 1.6 kg for the Ḥanafī half ṣāʿ of wheat.",
    ...FITR,
  },
  {
    id: "fuqara-masakin",
    term: "Fuqarāʾ and masākīn",
    ar: "الفقراء والمساكين",
    definition:
      "The poor and the needy: the first two of the eight groups who may receive Zakat, listed in the Qurʾān (9:60). Scholars differ on which of the two is in greater need.",
    ...FITR,
  },

  // ---- Fasting: fidya, kaffarah ----
  {
    id: "mudd",
    term: "Mudd",
    ar: "مد",
    definition:
      "A small measure of volume, a quarter of a ṣāʿ, roughly what two cupped hands hold. This calculator uses about 0.51 kg per mudd for the Sunni schools and about 0.75 kg for the larger Jaʿfarī mudd.",
    ...FIDYA,
  },
  {
    id: "fidya",
    term: "Fidya",
    ar: "فدية",
    also: "fidyah",
    definition:
      "Compensation paid for Ramadan fasts that a person cannot make up, for example because of old age or a chronic illness. It means feeding one poor person for each missed day. The amount of food differs by school.",
    ...FIDYA,
  },
  {
    id: "qada",
    term: "Qaḍāʾ",
    ar: "قضاء",
    also: "qada",
    definition:
      "Making up a missed obligation later, such as fasting one day after Ramadan for each day missed. If you can make up your fasts, qaḍāʾ is required instead of fidya.",
    ...FIDYA,
  },
  {
    id: "kaffarah",
    term: "Kaffārah",
    ar: "كفارة",
    also: "kaffara, kaffarah",
    definition:
      "Expiation: a prescribed act of atonement for certain violations, such as a broken oath or a deliberately broken Ramadan fast. Depending on the case, it means freeing a slave, fasting, feeding or clothing the poor. Schools differ on what triggers it and whether the options must be tried in order.",
    ...KAFFARAH,
  },
  {
    id: "kaffarat-al-jam",
    term: "Kaffārat al-jamʿ",
    ar: "كفارة الجمع",
    definition:
      "The combined expiation: all the options of a kaffārah performed together. Some Jaʿfarī authorities require it when a fast was broken with something forbidden.",
    ...KAFFARAH,
  },
  {
    id: "yamin",
    term: "Yamīn",
    ar: "يمين",
    definition:
      "An oath sworn by Allah. Breaking such an oath requires the kaffārah described in the Qurʾān (5:89).",
    ...KAFFARAH,
  },
  {
    id: "zihar",
    term: "Ẓihār",
    ar: "ظهار",
    also: "zihar",
    definition:
      "A pre-Islamic form of rejecting a wife, by a husband saying she is to him \"like my mother's back\". Islam condemned it. The husband must complete a kaffārah before the couple may resume marital relations (Qurʾān 58:3-4).",
    ...KAFFARAH,
  },
  {
    id: "diyah",
    term: "Diyah",
    ar: "دية",
    also: "diya",
    definition:
      "Blood money: compensation paid to a victim's family for killing or injury. For accidental killing it is owed in addition to the kaffārah, and the calculator does not compute it.",
    ...KAFFARAH,
  },
  {
    id: "aqilah",
    term: "ʿĀqilah",
    ar: "عاقلة",
    definition:
      "The group of relatives, usually the male paternal kin, who share the payment of diyah for an accidental killing.",
    ...KAFFARAH,
  },
  {
    id: "awrah",
    term: "ʿAwrah",
    ar: "عورة",
    definition:
      "The parts of the body that must be covered, for example in prayer. Clothing given as kaffārah for a broken oath must at least cover the ʿawrah.",
    ...KAFFARAH,
  },
  {
    id: "tawbah",
    term: "Tawbah",
    ar: "توبة",
    also: "tawba",
    definition:
      "Repentance: sincere regret for a sin, stopping it and resolving not to return to it. In the Shāfiʿī and Ḥanbalī schools, deliberately eating in Ramadan calls for tawbah and qaḍāʾ, not kaffārah.",
    ...KAFFARAH,
  },
  {
    id: "haram",
    term: "Ḥarām",
    ar: "حرام",
    definition: "Forbidden: an act that is sinful to do.",
    ...KAFFARAH,
  },

  // ---- Inheritance ----
  {
    id: "mirath",
    term: "Mīrāth",
    ar: "ميراث",
    also: "mirath",
    definition:
      "Inheritance: the transfer of a deceased person's estate to their heirs. In Islamic law it follows set shares and rules, applied after funeral costs, debts and any bequest.",
    ...INHERITANCE,
  },
  {
    id: "faraid",
    term: "Farāʾiḍ and furūḍ",
    ar: "الفرائض والفروض",
    also: "faraid, furud",
    definition:
      "Farāʾiḍ is the science of Islamic inheritance. Furūḍ are the fixed shares that the Qurʾān gives to certain heirs, such as one half, one quarter or one sixth.",
    ...INHERITANCE,
  },
  {
    id: "asabah",
    term: "ʿAṣabah",
    ar: "عصبة",
    also: "asaba, asabah",
    definition:
      "Residuary heirs: relatives, mainly male relatives through the male line, who take what is left after the fixed shares are paid. The Sunni schools use ʿaṣabah; the Jaʿfarī school does not.",
    ...INHERITANCE,
  },
  {
    id: "awl",
    term: "ʿAwl",
    ar: "عول",
    also: "awl",
    definition:
      "Proportional reduction: used when the fixed shares add up to more than the whole estate. Every fixed share is reduced in proportion so the total equals 100%. The Sunni schools apply it; the Jaʿfarī school rejects it.",
    ...INHERITANCE,
  },
  {
    id: "radd",
    term: "Radd",
    ar: "رد",
    definition:
      "Return of surplus: used when the fixed shares add up to less than the estate and there is no residuary heir. The surplus goes back to the fixed-share heirs in proportion. Schools differ on whether a spouse takes part.",
    ...INHERITANCE,
  },
  {
    id: "hajb",
    term: "Ḥajb",
    ar: "حجب",
    also: "hajb",
    definition:
      "Exclusion: a closer heir blocks a more distant one. Total exclusion (ḥajb al-ḥirmān) removes the share entirely, for example a son excludes a grandson. Partial exclusion (ḥajb al-nuqṣān) reduces it, for example a child reduces a spouse's share.",
    ...INHERITANCE,
  },
  {
    id: "umariyyatan",
    term: "ʿUmariyyatān",
    ar: "العمريتان",
    definition:
      "\"The two cases of ʿUmar\": an estate left to a spouse, a mother and a father only. Following the ruling of Caliph ʿUmar, the mother receives one third of what remains after the spouse's share, not one third of the whole. Ibn ʿAbbās held the other view.",
    ...INHERITANCE,
  },
  {
    id: "muqasamah",
    term: "Muqāsamah",
    ar: "مقاسمة",
    also: "muqasama",
    definition:
      "Sharing: in the Mālikī, Shāfiʿī and Ḥanbalī schools, one way a paternal grandfather can inherit alongside brothers and sisters, by sharing as if he were a brother. He takes whichever option gives him more. The Ḥanafī school instead lets the grandfather exclude the siblings.",
    ...INHERITANCE,
  },
  {
    id: "bayt-al-mal",
    term: "Bayt al-Māl",
    ar: "بيت المال",
    definition:
      "The public treasury of an Islamic state. Estate money with no heir to receive it goes to the Bayt al-Māl. Where none exists, scholars differ on where that money should go.",
    ...INHERITANCE,
  },
  {
    id: "wasiyyah",
    term: "Waṣiyyah",
    ar: "وصية",
    also: "wasiyya, wasiyyah",
    definition:
      "A will or bequest. Islamic inheritance shares are worked out on what is left after funeral costs, debts and any bequest have been paid. A waṣiyyah can also direct money that would otherwise have no Islamic recipient, such as a Bayt al-Māl portion, to a charity you choose.",
    ...INHERITANCE,
  },
  {
    id: "nasab",
    term: "Nasab",
    ar: "نسب",
    definition:
      "Lineage: family relationship by blood. Most heirs inherit through nasab; spouses inherit through marriage.",
    ...INHERITANCE,
  },

  // ---- Legal method ----
  {
    id: "madhhab",
    term: "Madhhab",
    ar: "مذهب",
    also: "madhab, mazhab; plural madhāhib",
    definition:
      "A school of Islamic law. This site supports the four Sunni schools (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī) and the Jaʿfarī school of Twelver Shia Islam. Choosing one applies that school's positions to every setting.",
    ...FINDER,
  },
  {
    id: "fiqh",
    term: "Fiqh",
    ar: "فقه",
    definition:
      "Islamic jurisprudence: the scholars' understanding of the rulings of Islamic law, worked out from the Qurʾān, the Sunnah and their methods of reasoning.",
    ...FINDER,
  },
  {
    id: "shariah",
    term: "Sharīʿah",
    ar: "شريعة",
    also: "sharia",
    definition: "Islamic law as a whole: the guidance that Muslims believe Allah has laid down.",
    ...FINDER,
  },
  {
    id: "fatwa",
    term: "Fatwā",
    ar: "فتوى",
    also: "fatwa",
    definition:
      "A ruling given by a qualified scholar in answer to a question. The calculators on this site are tools, not fatwās.",
    ...FINDER,
  },
  {
    id: "mutamad",
    term: "Muʿtamad",
    ar: "معتمد",
    also: "mu'tamad",
    definition: "The relied-upon position within a school: the view its scholars treat as the standard answer.",
    ...ZAKAT,
  },
  {
    id: "ijma",
    term: "Ijmāʿ",
    ar: "إجماع",
    also: "ijma",
    definition: "Scholarly consensus: agreement of the qualified scholars on a ruling.",
    ...INHERITANCE,
  },
  {
    id: "qiyas",
    term: "Qiyās",
    ar: "قياس",
    also: "qiyas",
    definition:
      "Analogical reasoning: applying the ruling of a case in the texts to a new case that shares the same underlying cause.",
    ...FINDER,
  },
  {
    id: "istihsan",
    term: "Istiḥsān",
    ar: "استحسان",
    also: "istihsan",
    definition:
      "Juristic preference: setting aside a strict analogy in favour of a ruling judged more suitable, for a recognised reason. It is especially associated with the Ḥanafī school.",
    ...FINDER,
  },
  {
    id: "maslahah",
    term: "Maṣlaḥah",
    ar: "مصلحة",
    also: "maslaha",
    definition:
      "Public interest or benefit. The Mālikī school is known for giving it weight when deriving rulings.",
    ...FINDER,
  },
];

/** ASCII sort/filter key: strips diacritics and the ʿ ʾ letters. */
export function glossaryKey(term: string): string {
  return term
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ʿʾ'’]/g, "")
    .toLowerCase();
}

export const GLOSSARY: GlossaryEntry[] = [...ENTRIES].sort((a, b) =>
  glossaryKey(a.term).localeCompare(glossaryKey(b.term), "en")
);

/** First letter (A to Z) of an entry, for the jump links. */
export function glossaryLetter(entry: GlossaryEntry): string {
  return glossaryKey(entry.term).charAt(0).toUpperCase();
}
