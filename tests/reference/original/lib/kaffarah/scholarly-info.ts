import { InfoPanel } from "@/lib/scholarly-info";

export const KAFFARAH_OVERVIEW_INFO: InfoPanel = {
  title: "What is Kaffārah? (كَفَّارَة)",
  description: "Kaffārah (literally 'covering' or 'expiation') is a penalty prescribed by Islamic law for specific violations of religious obligations. Unlike fidya (which compensates for inability), kaffārah is atonement for deliberate wrongdoing. It serves as both a spiritual purification and a practical form of charity.",
  positions: [
    {
      school: "All Schools (agreed)",
      position: "Kaffārah is obligatory when specific violations occur",
      reasoning: "The Quran explicitly prescribes kaffārah for broken oaths (5:89), ẓihār (58:3-4), and accidental killing (4:92). The Prophet ﷺ prescribed it for deliberately broken fasts (Bukhari, Muslim).",
    },
  ],
  note: "Kaffārah and fidya are different. Fidya = compensation for inability. Kaffārah = expiation for deliberate violation. They should not be confused.",
};

export const KAFFARAH_FAST_INFO: InfoPanel = {
  title: "Kaffārah for Deliberately Broken Fast",
  description: "Schools disagree on WHAT triggers kaffārah during Ramadan and WHETHER the options must be tried in order.",
  positions: [
    {
      school: "Ḥanafī School",
      position: "Kaffārah required for deliberately eating, drinking, OR sexual intercourse",
      reasoning: "Any intentional breaking of the fast — including eating and drinking — requires kaffārah plus making up the day. The three options (free a slave → fast 60 days → feed 60 people) must be tried in order.",
    },
    {
      school: "Shāfiʿī & Ḥanbalī Schools",
      position: "Kaffārah required ONLY for sexual intercourse during a fast",
      reasoning: "Deliberately eating or drinking is sinful and requires making up the day (qaḍāʾ) plus repentance (tawbah), but does NOT require kaffārah. Only sexual intercourse triggers the full expiation. Options are sequential.",
    },
    {
      school: "Mālikī School",
      position: "Kaffārah for eating, drinking, or intercourse — AND the options are interchangeable",
      reasoning: "Like the Ḥanafī school, any deliberate breaking triggers kaffārah. Unlike other schools, the Mālikī school allows you to choose freely between the options (they are not strictly ordered).",
    },
    {
      school: "Jaʿfarī School",
      position: "Options are alternatives (choose any). If the violation was ḥarām, some require all three combined",
      reasoning: "The three standard options are interchangeable. However, if the fast was broken by something intrinsically forbidden (ḥarām — e.g., alcohol, forbidden food), some Jaʿfarī authorities require the combined kaffārah (kaffārat al-jamʿ): all three at once.",
    },
  ],
  note: "This difference matters enormously in practice. Under the Shāfiʿī/Ḥanbalī view, someone who deliberately ate during Ramadan owes only one day of make-up fasting. Under the Ḥanafī/Mālikī view, they owe 60 days of fasting (or the equivalent).",
};

export const KAFFARAH_OATH_INFO: InfoPanel = {
  title: "Kaffārah for a Broken Oath",
  description: "This is the most commonly encountered kaffārah. All schools largely agree on the ruling, based on Quran 5:89.",
  positions: [
    {
      school: "All Schools (agreed)",
      position: "Feed 10 poor people, OR clothe 10 poor people, OR free a slave. If unable: fast 3 days.",
      reasoning: "The first three options are interchangeable — you may choose whichever is most practical. Fasting 3 days is ONLY permitted if you genuinely cannot afford any of the first three.",
    },
    {
      school: "Ḥanafī & Ḥanbalī Schools",
      position: "The 3 fasting days must be consecutive",
      reasoning: "Based on the recitation of Ibn Masʿūd which includes 'three consecutive days.'",
    },
    {
      school: "Mālikī & Shāfiʿī Schools",
      position: "Consecutive fasting is preferred but not required",
      reasoning: "The standard Quranic text says 'three days' without specifying consecutiveness.",
    },
  ],
};
