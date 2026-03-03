import { InfoPanel } from "@/lib/scholarly-info";

export const FITR_OVERVIEW_INFO: InfoPanel = {
  title: "What is Zakat al-Fiṭr? (زكاة الفطر)",
  description:
    "Zakat al-Fiṭr (also called Ṣadaqat al-Fiṭr or Fiṭrānah) is a mandatory charitable payment made at the end of Ramadan, before the Eid al-Fiṭr prayer. It is completely separate from annual Zakat al-Māl (wealth-based Zakat). Its purpose is to purify the fasting person from any shortcomings during Ramadan and to ensure that poor people can also celebrate Eid.",
  positions: [
    {
      school: "All Schools (agreed)",
      position:
        "Zakat al-Fiṭr is obligatory (wājib) on every Muslim who has enough food/wealth for themselves and their dependents on the day of Eid",
      reasoning:
        "Based on the hadith of Ibn ʿUmar: 'The Messenger of Allah ﷺ made Zakat al-Fiṭr obligatory — one ṣāʿ of dates or one ṣāʿ of barley — on every Muslim, slave or free, male or female, young or old.' (Bukhari & Muslim)",
    },
  ],
  note: "This is NOT the same as your annual Zakat (Zakat al-Māl). Zakat al-Māl is 2.5% of your wealth paid once a year. Zakat al-Fiṭr is a fixed per-person amount paid once at the end of Ramadan, regardless of your total wealth.",
};

export const FITR_AMOUNT_INFO: InfoPanel = {
  title: "How Much is Zakat al-Fiṭr?",
  description:
    "All schools agree the measure is based on the prophetic ṣāʿ (an ancient volumetric unit), but they differ on the food type, the exact weight, and whether cash is acceptable.",
  positions: [
    {
      school: "Ḥanafī School",
      position:
        "Half a ṣāʿ of wheat (~1.6 kg) or one ṣāʿ of other staples (~3.2 kg). Cash payment is permitted.",
      reasoning:
        "The Ḥanafī school considers wheat the most common and valuable staple, so half a ṣāʿ suffices. For less valuable staples (barley, dates, raisins), a full ṣāʿ is required. Uniquely among the Sunni schools, Ḥanafīs explicitly permit cash equivalent, arguing that the purpose is to meet the needs of the poor — which cash can accomplish equally or better than food.",
    },
    {
      school: "Mālikī, Shāfiʿī, and Ḥanbalī Schools",
      position:
        "One ṣāʿ (~2.5 kg) of the local staple food. Cash is NOT permitted in the classical position.",
      reasoning:
        "These three schools require actual food to be given, based on the literal hadith which mentions specific food items. The ṣāʿ should be of the predominant staple in your area (rice in Asia, wheat in the Middle East, corn in Africa, etc.). Many modern scholars within these schools have permitted cash when it better serves the poor, but the classical position remains food-only.",
    },
    {
      school: "Jaʿfarī School",
      position:
        "One ṣāʿ (~3 kg) of commonly consumed food. Cash equivalent is permitted.",
      reasoning:
        "The Jaʿfarī ṣāʿ is measured slightly larger (~3 kg). The food should be whatever is commonly eaten in your area. Cash is permitted as an equivalent. Notably, in Jaʿfarī fiqh, the obligation extends to every person in your household at the time of sunset on the eve of Eid — including guests.",
    },
  ],
  note: "In practice, most Islamic organizations today publish a recommended dollar amount per person each year (typically $10–15 in North America). This makes it easy to pay even if your school technically requires food.",
};

export const FITR_TIMING_INFO: InfoPanel = {
  title: "When is Zakat al-Fiṭr Due?",
  description:
    "The timing of payment differs slightly between schools, but all agree it must be paid before the Eid prayer.",
  positions: [
    {
      school: "Ḥanafī School",
      position: "Becomes obligatory at dawn (Fajr) on the day of Eid al-Fiṭr. Can be paid earlier during Ramadan.",
      reasoning:
        "The Ḥanafī school ties the obligation to the beginning of Eid day. Paying in advance during Ramadan is permitted and encouraged to give recipients time to use it for Eid.",
    },
    {
      school: "Shāfiʿī and Ḥanbalī Schools",
      position: "Becomes obligatory at sunset on the last day of Ramadan (the eve of Eid). Must be paid before the Eid prayer.",
      reasoning:
        "These schools tie the obligation to the moment Ramadan ends. Paying it after the Eid prayer is considered a regular charity (ṣadaqah), not Zakat al-Fiṭr.",
    },
    {
      school: "Mālikī School",
      position: "Becomes obligatory at sunset on the last day of Ramadan. Can be paid one or two days before Eid.",
      reasoning:
        "Based on the hadith of Ibn ʿUmar who would give it one or two days before Eid. Delaying it past Eid is sinful but still must be paid.",
    },
    {
      school: "Jaʿfarī School",
      position: "Becomes obligatory at sunset on the eve of Eid al-Fiṭr. Should be paid before the Eid prayer.",
      reasoning:
        "The obligation is tied to whoever is in your household at sunset on the eve of Eid. If a guest arrives before sunset, you owe their Fiṭr as well. It should be paid before or on the morning of Eid, before the prayer.",
    },
  ],
  note: "All schools agree: it is best to pay early enough that the recipient can use it to enjoy Eid. Delaying it past the Eid prayer is strongly discouraged or sinful in all schools.",
};

export const FITR_WHO_INFO: InfoPanel = {
  title: "Who Must Pay? Who Can Receive?",
  description: "Zakat al-Fiṭr is paid per person, not per household. You pay for yourself and every dependent.",
  positions: [
    {
      school: "All Schools (agreed)",
      position:
        "You pay for yourself, your spouse, your minor children, and any dependents you are financially responsible for.",
      reasoning:
        "The head of household pays on behalf of all members. This includes infants born before the Eid prayer and anyone you financially support.",
    },
    {
      school: "Jaʿfarī School (additional)",
      position:
        "Also includes guests present in your home at sunset on the eve of Eid.",
      reasoning:
        "The Jaʿfarī school extends the obligation to any person — including guests — who is in your household at the moment the obligation becomes binding (sunset on the eve of Eid).",
    },
    {
      school: "All Schools (recipients)",
      position:
        "Recipients are the same categories as Zakat al-Māl: the poor (fuqarāʾ), the needy (masākīn), and other eligible categories mentioned in Quran 9:60.",
      reasoning: "The primary purpose is ensuring the poor can celebrate Eid with dignity.",
    },
  ],
};
