import { KaffarahType, Madhab, KaffarahRuling } from "./types";

// Each kaffarah type has specific rulings per madhab
// The "sequential" flag means you must attempt options in order (can only fall back if unable)

export function getKaffarahRuling(type: KaffarahType, madhab: Madhab): KaffarahRuling {
  const key = `${type}_${madhab}`;

  // ===== DELIBERATELY BROKEN FAST =====
  if (type === "broken_fast") {
    if (madhab === "hanafi") {
      return {
        type, madhab, isSequential: true,
        options: [
          { order: 1, action: "Free a slave", detail: "Historical requirement — no longer practically applicable.", isFallback: false },
          { order: 2, action: "Fast 60 consecutive days", detail: "If you break the continuity (miss a day without valid excuse), you must restart from day 1. Valid excuses include menstruation, illness, or travel.", isFallback: true },
          { order: 3, action: "Feed 60 poor people", detail: "Provide two meals to 60 different poor people, or the monetary equivalent (~$10–15 per person depending on your area, totaling $600–900).", isFallback: true },
        ],
        notes: [
          "In the Ḥanafī school, kaffārah is required for deliberately breaking a fast by eating, drinking, OR sexual intercourse.",
          "If you broke the fast by eating/drinking AND sexual intercourse on the same day, only one kaffārah is required.",
          "Each day deliberately broken requires a separate kaffārah.",
          "You must also make up (qaḍāʾ) the broken fast day.",
        ],
      };
    }
    if (madhab === "maliki") {
      return {
        type, madhab, isSequential: false, // Maliki allows choice
        options: [
          { order: 1, action: "Free a slave", detail: "Historical — no longer applicable.", isFallback: false },
          { order: 2, action: "Fast 60 consecutive days", detail: "Must be consecutive. Menstruation is excused and does not break continuity.", isFallback: false },
          { order: 3, action: "Feed 60 poor people", detail: "One mudd (~510g) of staple food per person, or the equivalent in cash.", isFallback: false },
        ],
        notes: [
          "The Mālikī school uniquely allows choosing between the three options (they are not strictly sequential).",
          "Kaffārah is required for deliberately eating, drinking, or having sexual intercourse during a Ramadan fast.",
          "You must also make up the broken fast day (qaḍāʾ).",
        ],
      };
    }
    if (madhab === "shafii") {
      return {
        type, madhab, isSequential: true,
        options: [
          { order: 1, action: "Free a slave", detail: "Historical — no longer applicable.", isFallback: false },
          { order: 2, action: "Fast 60 consecutive days", detail: "Strictly consecutive. Must restart if broken without valid excuse.", isFallback: true },
          { order: 3, action: "Feed 60 poor people", detail: "One mudd (~510g) of staple food per person.", isFallback: true },
        ],
        notes: [
          "In the Shāfiʿī school, kaffārah for fasting is ONLY required for sexual intercourse during a Ramadan fast — NOT for eating or drinking.",
          "Deliberately eating or drinking requires only qaḍāʾ (making up the day) plus sincere repentance (tawbah).",
          "This is a significant difference from the other Sunni schools.",
        ],
      };
    }
    if (madhab === "hanbali") {
      return {
        type, madhab, isSequential: true,
        options: [
          { order: 1, action: "Free a slave", detail: "Historical — no longer applicable.", isFallback: false },
          { order: 2, action: "Fast 60 consecutive days", detail: "Must be consecutive. Valid excuses (illness, menstruation) do not break continuity.", isFallback: true },
          { order: 3, action: "Feed 60 poor people", detail: "One mudd (~510g) of staple food per person, or cash equivalent.", isFallback: true },
        ],
        notes: [
          "Like the Shāfiʿī school, the Ḥanbalī school requires kaffārah only for sexual intercourse during a Ramadan fast.",
          "Deliberately eating or drinking requires qaḍāʾ and repentance, but not kaffārah.",
          "You must also make up the broken fast day.",
        ],
      };
    }
    if (madhab === "jafari") {
      return {
        type, madhab, isSequential: false,
        options: [
          { order: 1, action: "Free a slave", detail: "Historical — no longer applicable.", isFallback: false },
          { order: 2, action: "Fast 60 days (31 consecutive + 29 remaining)", detail: "You must fast at least 31 days consecutively; the remaining 29 can be non-consecutive.", isFallback: false },
          { order: 3, action: "Feed 60 poor people", detail: "Approximately 750g of food per person (one Jaʿfarī mudd).", isFallback: false },
        ],
        notes: [
          "In Jaʿfarī fiqh, the three options are alternatives — you may choose any one.",
          "Kaffārah applies to deliberately breaking a fast by eating, drinking, or sexual intercourse.",
          "If the fast was broken by a ḥarām (forbidden) act, some authorities require all three as a combined kaffārah (kaffārat al-jamʿ).",
          "You must also make up the broken fast day.",
        ],
      };
    }
  }

  // ===== BROKEN OATH =====
  if (type === "broken_oath") {
    // All schools agree on this, with minor variations
    const baseOptions = [
      { order: 1, action: "Feed 10 poor people", detail: "One meal each, or the equivalent in staple food (one mudd per person in most schools; half a ṣāʿ in the Ḥanafī school).", isFallback: false },
      { order: 2, action: "Clothe 10 poor people", detail: "Provide each person with clothing sufficient to cover their body for prayer (at minimum, a garment covering the ʿawrah).", isFallback: false },
      { order: 3, action: "Free a slave", detail: "Historical — no longer applicable.", isFallback: false },
      { order: 4, action: "Fast 3 days", detail: madhab === "hanafi" || madhab === "hanbali" ? "Must be 3 consecutive days." : "3 days (consecutive is preferred but not required in this school).", isFallback: true },
    ];

    return {
      type, madhab,
      isSequential: false, // first 3 are interchangeable; fasting is fallback
      options: baseOptions,
      notes: [
        "For a broken oath, you may choose ANY of the first three options (feeding, clothing, or freeing a slave).",
        "Fasting 3 days is ONLY permitted if you genuinely cannot afford the other options.",
        "This is based on Quran 5:89.",
        madhab === "hanafi"
          ? "The Ḥanafī school requires the 3 fasting days to be consecutive."
          : madhab === "hanbali"
          ? "The Ḥanbalī school also requires the 3 fasting days to be consecutive."
          : "In this school, the 3 fasting days do not need to be consecutive (though it is preferred).",
      ],
    };
  }

  // ===== ẒIHĀR =====
  if (type === "zihar") {
    return {
      type, madhab, isSequential: true,
      options: [
        { order: 1, action: "Free a slave", detail: "Historical — no longer applicable.", isFallback: false },
        { order: 2, action: "Fast 60 consecutive days", detail: "Must be completed before resuming marital relations. Menstruation does not break continuity.", isFallback: true },
        { order: 3, action: "Feed 60 poor people", detail: "If unable to fast, feed 60 poor people one meal each.", isFallback: true },
      ],
      notes: [
        "Ẓihār is when a husband says to his wife 'You are to me like my mother's back' — declaring her unlawful to himself.",
        "This was a pre-Islamic form of divorce. Islam condemned it but required kaffārah as atonement.",
        "The kaffārah must be completed BEFORE the couple can resume marital relations.",
        "Based on Quran 58:3-4.",
      ],
    };
  }

  // ===== ACCIDENTAL KILLING =====
  if (type === "accidental_killing") {
    return {
      type, madhab, isSequential: true,
      options: [
        { order: 1, action: "Free a believing slave", detail: "Historical — no longer applicable.", isFallback: false },
        { order: 2, action: "Fast 60 consecutive days", detail: "Must be strictly consecutive. This is the primary practical option today.", isFallback: true },
      ],
      notes: [
        "Based on Quran 4:92. This kaffārah is in ADDITION to blood money (diyah) paid to the victim's family.",
        "There is no option to feed the poor for this type — only freeing a slave or fasting.",
        madhab === "jafari"
          ? "In Jaʿfarī fiqh, the three options (free a slave, fast 60 days, feed 60 poor) apply here as well, and are alternatives."
          : "Most Sunni schools agree there is no feeding option for accidental killing — only freeing a slave or fasting.",
        "The blood money (diyah) amount is a separate calculation and is borne by the killer's ʿāqilah (extended family/clan) in most schools.",
      ],
    };
  }

  // Fallback (shouldn't reach here)
  return {
    type, madhab, isSequential: true,
    options: [],
    notes: ["No specific ruling found for this combination."],
  };
}

export function estimateFeedingCost(
  type: KaffarahType,
  madhab: Madhab,
  costPerMeal: number
): { people: number; totalCost: number } {
  if (type === "broken_oath") {
    return { people: 10, totalCost: 10 * costPerMeal };
  }
  // All other types that include feeding: 60 people
  return { people: 60, totalCost: 60 * costPerMeal };
}
