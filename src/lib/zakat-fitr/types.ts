export type Madhab = "hanafi" | "maliki" | "shafii" | "hanbali" | "jafari";

export interface FitrAmountInfo {
  weightKg: number;
  measure: string;
  description: string;
  cashPermitted: boolean;
}

// Zakat al-Fitr amounts by school
// One ṣāʿ ≈ 2.5–3 kg depending on commodity. Hanafi uses half ṣāʿ for wheat.
export const FITR_AMOUNTS: Record<Madhab, FitrAmountInfo> = {
  hanafi: {
    weightKg: 1.6, // half ṣāʿ of wheat
    measure: "Half a ṣāʿ of wheat (~1.6 kg), or one ṣāʿ (~3.2 kg) of barley, dates, or raisins",
    description:
      "The Ḥanafī school uniquely allows half a ṣāʿ of wheat (the most common staple) as sufficient, while other grains require a full ṣāʿ. Cash payment is explicitly permitted — you may pay the monetary equivalent of the food instead of actual food. This makes it the most practical option in modern contexts.",
    cashPermitted: true,
  },
  maliki: {
    weightKg: 2.5, // one ṣāʿ
    measure: "One ṣāʿ (~2.5 kg) of the local staple food",
    description:
      "The Mālikī school requires one ṣāʿ of the predominant staple food in your area (wheat, rice, corn, barley, dates, etc.). The classical position is that it must be given as actual food, not cash. However, many contemporary Mālikī scholars permit cash if it better serves the poor.",
    cashPermitted: false,
  },
  shafii: {
    weightKg: 2.5,
    measure: "One ṣāʿ (~2.5 kg) of the local staple food",
    description:
      "The Shāfiʿī school requires one ṣāʿ of the predominant local staple. Like the Mālikī school, the classical position requires actual food. Cash is not permitted in the relied-upon (muʿtamad) Shāfiʿī opinion, though some modern scholars allow it.",
    cashPermitted: false,
  },
  hanbali: {
    weightKg: 2.5,
    measure: "One ṣāʿ (~2.5 kg) of the local staple food",
    description:
      "The Ḥanbalī school requires one ṣāʿ of staple food. Like the Shāfiʿī and Mālikī schools, the classical position requires giving food, not cash. The five traditional food types are: wheat, barley, dates, raisins, and dried cottage cheese (aqiṭ).",
    cashPermitted: false,
  },
  jafari: {
    weightKg: 3.0, // Ja'fari ṣāʿ is slightly larger
    measure: "One ṣāʿ (~3 kg) of commonly consumed food",
    description:
      "The Jaʿfarī school requires one ṣāʿ (approximately 3 kg) of food commonly consumed in your area — such as wheat, barley, dates, raisins, rice, or corn. Cash equivalent is permitted. The obligation applies to every household member, including guests who are present at the time of sunset on the eve of Eid al-Fiṭr.",
    cashPermitted: true,
  },
};
