export type Madhab = "hanafi" | "maliki" | "shafii" | "hanbali" | "jafari";

export type KaffarahType =
  | "broken_fast"      // Deliberately breaking a Ramadan fast
  | "broken_oath"      // Breaking a sworn oath (yamīn)
  | "zihar"            // Ẓihār — a specific marital declaration
  | "accidental_killing"; // Unintentional killing

export interface KaffarahTypeInfo {
  id: KaffarahType;
  title: string;
  titleAr: string;
  description: string;
  icon: string;
}

export const KAFFARAH_TYPES: KaffarahTypeInfo[] = [
  {
    id: "broken_fast",
    title: "Deliberately Broken Fast",
    titleAr: "كفارة الإفطار",
    description: "You intentionally broke your fast during Ramadan without a valid excuse — by eating, drinking, or sexual intercourse.",
    icon: "🌙",
  },
  {
    id: "broken_oath",
    title: "Broken Oath",
    titleAr: "كفارة اليمين",
    description: "You swore an oath (yamīn) in Allah's name and then broke it — e.g., 'I swear by Allah I will do X' and then did not.",
    icon: "🤝",
  },
  {
    id: "zihar",
    title: "Ẓihār (Marital Declaration)",
    titleAr: "كفارة الظهار",
    description: "A husband declared his wife to be 'like his mother's back' (an ancient form of marital rejection). This is a serious offense in Islam requiring expiation before resuming marital relations.",
    icon: "⚖",
  },
  {
    id: "accidental_killing",
    title: "Accidental Killing",
    titleAr: "كفارة القتل الخطأ",
    description: "Unintentional causing of death — such as a car accident. The kaffārah is in addition to blood money (diyah) owed to the victim's family.",
    icon: "⚠️",
  },
];

export interface KaffarahOption {
  order: number;
  action: string;
  detail: string;
  isFallback: boolean; // true if only when previous option is impossible
}

export interface KaffarahRuling {
  type: KaffarahType;
  madhab: Madhab;
  options: KaffarahOption[];
  notes: string[];
  isSequential: boolean; // true = must try in order; false = choose any
}
