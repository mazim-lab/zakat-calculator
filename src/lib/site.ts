// Single source of truth for site-wide config, navigation, and the tool registry.

export const SITE = {
  name: "Islamic Ḥisāb",
  nameAscii: "Islamic Hisab",
  nameAr: "حساب إسلامي",
  url: "https://www.islamichisab.com",
  description:
    "Free Islamic calculators for Zakat, Zakat al-Fiṭr, inheritance (mīrāth), fidya and kaffārah, with the positions of the Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī and Jaʿfarī schools explained side by side.",
  locale: "en",
} as const;

export type Hue = "indigo" | "cyan" | "fuchsia" | "green" | "amber" | "neutral";

export interface ToolEntry {
  href: string;
  title: string;
  shortTitle: string;
  titleAr: string;
  hue: Hue;
  summary: string;
  detail: string;
}

/** Calculators, in the order they appear in navigation and on the home page. */
export const TOOLS: ToolEntry[] = [
  {
    href: "/zakat",
    title: "Zakat",
    shortTitle: "Zakat",
    titleAr: "زكاة",
    hue: "indigo",
    summary:
      "Annual obligatory almsgiving on wealth held for a year above the niṣāb: cash, gold, silver, investments, retirement accounts, business assets, crypto, crops and livestock.",
    detail: "Every methodology choice is configurable, with each school's position explained.",
  },
  {
    href: "/zakat-fitr",
    title: "Zakat al-Fiṭr",
    shortTitle: "Fiṭr",
    titleAr: "زكاة الفطر",
    hue: "cyan",
    summary:
      "The per-person charity due before the Eid al-Fiṭr prayer at the end of Ramadan. Separate from annual Zakat al-Māl.",
    detail: "Calculate for your whole household, by food weight or local cash equivalent.",
  },
  {
    href: "/inheritance",
    title: "Inheritance",
    shortTitle: "Inheritance",
    titleAr: "مِيرَاث",
    hue: "fuchsia",
    summary:
      "Divide an estate among the heirs according to the Qurʾānic shares (farāʾiḍ), after debts and any bequest.",
    detail: "Handles ʿawl (proportional reduction), radd (return of surplus) and ḥajb (exclusion).",
  },
  {
    href: "/fidya",
    title: "Fidya",
    shortTitle: "Fidya",
    titleAr: "فِدْيَة",
    hue: "green",
    summary:
      "Compensation for Ramadan fasts that cannot be made up because of chronic illness, old age or a permanent condition.",
    detail: "Amount per missed day by school, in food weight or local meal cost.",
  },
  {
    href: "/kaffarah",
    title: "Kaffārah",
    shortTitle: "Kaffārah",
    titleAr: "كَفَّارَة",
    hue: "amber",
    summary:
      "Expiation for a deliberately broken Ramadan fast, a broken oath, and other cases that require atonement.",
    detail: "Shows the required options in order, with the feeding cost estimated in your currency.",
  },
];

export const SCHOOL_FINDER = {
  href: "/find-your-school",
  title: "Find your school",
  hue: "neutral" as Hue,
};

/** Reference pages (non-calculator content). */
export const REFERENCE_PAGES = [
  { href: "/glossary", title: "Glossary" },
  { href: "/about", title: "About & methodology" },
];

export const NAV = [
  ...TOOLS.map((t) => ({ href: t.href, label: t.shortTitle })),
];

export function absoluteUrl(path: string): string {
  if (path === "/") return SITE.url + "/";
  return SITE.url + path;
}
