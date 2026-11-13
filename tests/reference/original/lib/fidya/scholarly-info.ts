import { InfoPanel } from "@/lib/scholarly-info";

export const FIDYA_OVERVIEW_INFO: InfoPanel = {
  title: "What is Fidya? (فِدْيَة)",
  description: "Fidya is a compensatory payment made when a Muslim is unable to fast during Ramadan due to a valid, permanent or long-term reason — such as chronic illness, old age, pregnancy/nursing (in some schools), or a medical condition that makes fasting dangerous. It is NOT for deliberately broken fasts (that requires Kaffārah instead).",
  positions: [
    {
      school: "All Schools",
      position: "Fidya is feeding one poor person for each missed day of fasting",
      reasoning: "Based on Quran 2:184 — 'And upon those who are able [to fast, but with hardship] — a ransom [as substitute] of feeding a poor person [each day].' Scholars agree this applies to those with permanent inability to fast.",
    },
  ],
  note: "Fidya only applies when you CANNOT fast at all — not when you choose not to. If you are temporarily ill and will recover, you should make up (qaḍāʾ) the missed fasts later. Fidya is for those who have no reasonable expectation of being able to fast in the future.",
};

export const FIDYA_AMOUNT_INFO: InfoPanel = {
  title: "How Much is Fidya Per Day?",
  description: "The amount of fidya per day varies by school of jurisprudence. All schools agree it involves feeding one poor person, but they differ on the quantity of food.",
  positions: [
    {
      school: "Ḥanafī School",
      position: "Half a ṣāʿ of wheat (~1.6 kg) or one ṣāʿ of barley/dates (~3.2 kg), or its cash equivalent",
      reasoning: "The Ḥanafī school permits paying fidya in cash equivalent, making it practical for modern contexts. The amount is based on the prophetic measure of a ṣāʿ (an ancient volumetric unit). This tends to be the most generous amount. Many Ḥanafī scholars set this at approximately $10–15 USD per day, depending on local food costs.",
    },
    {
      school: "Mālikī School",
      position: "One mudd (~510g) of the local staple food",
      reasoning: "A mudd is a smaller unit — roughly the amount that fills two average cupped hands. The Mālikī school specifies it should be the predominant staple food of your area (wheat, rice, corn, etc.).",
    },
    {
      school: "Shāfiʿī School",
      position: "One mudd (~510g) of the local staple food",
      reasoning: "Same measure as the Mālikī school. The Shāfiʿī school strongly prefers giving actual food over cash, though many contemporary scholars permit cash when more practical for the poor.",
    },
    {
      school: "Ḥanbalī School",
      position: "One mudd of wheat (~510g), or half a ṣāʿ of other staples (~1.6 kg)",
      reasoning: "The Ḥanbalī school differentiates by food type: wheat requires one mudd, while barley, dates, and raisins require half a ṣāʿ (about three times more by weight).",
    },
    {
      school: "Jaʿfarī School",
      position: "One mudd of food (~750g)",
      reasoning: "The Jaʿfarī mudd is slightly larger than the Sunni measurement. It should be given as staple food (wheat, rice, flour) or its monetary equivalent to a poor person.",
    },
  ],
  note: "In practice, many scholars today recommend paying the cost of one average meal in your local area for each missed day. This ensures the poor person receives a meaningful amount regardless of commodity prices.",
};

export const FIDYA_ELIGIBILITY_INFO: InfoPanel = {
  title: "Who Must Pay Fidya?",
  description: "Fidya is specifically for those with a permanent or long-term inability to fast. The categories differ slightly between schools.",
  positions: [
    {
      school: "All Schools (agreed)",
      position: "Elderly persons who cannot fast, and those with chronic/terminal illness",
      reasoning: "There is consensus that someone who is too old or too ill to fast — with no expectation of recovery — pays fidya instead.",
    },
    {
      school: "Ḥanafī School",
      position: "Also includes pregnant and nursing women IF they fear harm to themselves or their child, and they are unable to make up fasts later",
      reasoning: "In the Ḥanafī school, pregnant and nursing women who break their fast must make up (qaḍāʾ) the missed fasts later. Fidya alone is not sufficient unless they are permanently unable to fast.",
    },
    {
      school: "Shāfiʿī & Ḥanbalī Schools",
      position: "Pregnant and nursing women pay fidya AND make up missed fasts",
      reasoning: "These schools require both qaḍāʾ (making up the fast) and fidya when a pregnant or nursing woman breaks her fast out of fear for her child. If the fear was only for herself, only qaḍāʾ is required.",
    },
  ],
  note: "If you are temporarily unable to fast (e.g., short-term illness, travel), you do not pay fidya — you make up the missed fasts later (qaḍāʾ). Fidya is only when making up fasts is not possible.",
};
