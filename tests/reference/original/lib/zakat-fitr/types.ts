export type Madhab = "hanafi" | "maliki" | "shafii" | "hanbali" | "jafari";

export interface FitrAmountInfo {
  weightKg: number;
  measure: string;
  description: string;
  cashPermitted: boolean;
  /** Present when cashPermitted is false but modern scholars/charities commonly accept cash */
  modernCashNote?: string;
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
    modernCashNote:
      "Many contemporary Mālikī scholars and most Islamic charities accept cash payments, especially in Western countries where food distribution is impractical. If paying through an organization like Islamic Relief or ISNA, cash is the standard method.",
  },
  shafii: {
    weightKg: 2.5,
    measure: "One ṣāʿ (~2.5 kg) of the local staple food",
    description:
      "The Shāfiʿī school requires one ṣāʿ of the predominant local staple. Like the Mālikī school, the classical position requires actual food. Cash is not permitted in the relied-upon (muʿtamad) Shāfiʿī opinion, though some modern scholars allow it.",
    cashPermitted: false,
    modernCashNote:
      "While the classical Shāfiʿī position requires food, most Islamic organizations worldwide accept cash on your behalf and purchase food for distribution. Scholars like Dr. Yusuf al-Qaradawi (though not strictly Shāfiʿī) and others argue cash is permissible when it better serves the poor.",
  },
  hanbali: {
    weightKg: 2.5,
    measure: "One ṣāʿ (~2.5 kg) of the local staple food",
    description:
      "The Ḥanbalī school requires one ṣāʿ of staple food. Like the Shāfiʿī and Mālikī schools, the classical position requires giving food, not cash. The five traditional food types are: wheat, barley, dates, raisins, and dried cottage cheese (aqiṭ).",
    cashPermitted: false,
    modernCashNote:
      "In practice, most Ḥanbalī-majority countries (Saudi Arabia, Qatar) have official Zakat al-Fiṭr amounts published in their local currency, and charities accept cash. Paying cash through a trusted organization that distributes food on your behalf is widely accepted.",
  },
  jafari: {
    weightKg: 3.0, // Ja'fari ṣāʿ is slightly larger
    measure: "One ṣāʿ (~3 kg) of commonly consumed food",
    description:
      "The Jaʿfarī school requires one ṣāʿ (approximately 3 kg) of food commonly consumed in your area — such as wheat, barley, dates, raisins, rice, or corn. Cash equivalent is permitted. The obligation applies to every household member, including guests who are present at the time of sunset on the eve of Eid al-Fiṭr.",
    cashPermitted: true,
  },
};
