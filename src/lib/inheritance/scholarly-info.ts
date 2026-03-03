
import { InfoPanel } from './types';

export const awlInfo: InfoPanel = {
  title: "Understanding 'ʿAwl' (Proportional Reduction)",
  description:
    "ʿAwl, or proportional reduction, is a mechanism applied when the fixed, Quranically-defined shares (Furūḍ) of all heirs add up to more than 100% of the estate. Instead of some heirs being denied their share, all shares are reduced proportionally to make the total equal 100%.",
  positions: [
    {
      school: 'All Sunni Schools (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī)',
      position: 'Accept and apply the principle of ʿAwl.',
      reasoning:
        'This approach was famously applied by the Caliph ʿUmar ibn al-Khaṭṭāb and is based on the principle of equity, ensuring that the deficit is shared justly among all the fixed-share heirs.',
    },
    {
      school: 'Some Shīʿa Schools',
      position: 'Reject the principle of ʿAwl.',
      reasoning:
        'They argue that God, in His wisdom, would not prescribe shares that exceed the total. In cases of a shortfall, the deficiency is borne by specific heirs, typically daughters or sisters.',
    },
  ],
  note: 'This calculator applies the majority Sunni position.',
};

export const raddInfo: InfoPanel = {
  title: "Understanding 'Radd' (Redistribution)",
  description:
    "Radd, or redistribution, is the opposite of ʿAwl. It occurs when the fixed shares of the heirs add up to less than 100% of the estate, leaving a surplus. This surplus is then redistributed proportionally among the fixed-share heirs.",
  positions: [
    {
      school: 'Majority (Ḥanafī, Shāfiʿī, later Ḥanbalī view)',
      position: 'The surplus is redistributed to all fixed-share heirs *except* for the spouse (husband or wife).',
      reasoning:
        'The spouse\'s share is considered fixed and contractual, tied to the marriage itself, while the other relationships are based on blood ties (nasab), which are considered a stronger basis for receiving the surplus.',
    },
    {
      school: 'Minority (Some Ḥanbalī and Shīʿa scholars)',
      position: 'The surplus is redistributed to all fixed-share heirs, *including* the spouse.',
      reasoning: 'They argue that the spouse is also one of the fixed-share heirs and there is no explicit text to exclude them from the redistribution of the surplus.',
    },
  ],
  note: 'This calculator allows choosing which madhab to follow for this ruling.',
};

export const hajbInfo: InfoPanel = {
  title: "Understanding 'Ḥajb' (Blocking or Exclusion)",
  description:
    'Ḥajb is the principle by which a closer heir to the deceased blocks a more distant heir from inheriting, either completely (Ḥajb al-Ḥirmān) or by reducing their prescribed share (Ḥajb al-Nuqṣān).',
  positions: [
    {
      school: 'Consensus (Ijmāʿ)',
      position: 'The presence of a closer relative excludes a more distant one. For example, a son blocks a grandson, and a father blocks a grandfather.',
      reasoning: 'This is based on the foundational principle of proximity in inheritance law, "The closest in relation inherits." The Quran and Sunnah provide clear examples of this, such as the son taking precedence over the grandson.',
    },
     {
      school: 'Example of Partial Exclusion',
      position: 'The presence of a child reduces the share of the spouse. For example, a husband inherits 1/2, but this is reduced to 1/4 if the deceased has a child. A wife inherits 1/4, but this is reduced to 1/8 in the presence of a child.',
      reasoning: 'These reductions are explicitly mentioned in the Quran in Sūrat al-Nisāʾ, verses 12.',
    },
  ],
};

export const grandfatherSiblingsInfo: InfoPanel = {
  title: 'Grandfather vs. Siblings',
  description: 'A major area of scholarly difference is whether the paternal grandfather inherits alongside the deceased\'s full or paternal siblings, or if he blocks them entirely.',
  positions: [
    {
      school: 'Ḥanafī School',
      position: 'The paternal grandfather is treated like the father in his absence and therefore blocks all siblings (full, paternal, and maternal) from inheriting.',
      reasoning: 'They consider the grandfather a direct ascendant (an "usul"), just like the father, and give him the same status in the absence of the father. The Quran refers to a grandfather as "father" (e.g., 2:133).',
    },
    {
      school: 'Mālikī, Shāfiʿī, Ḥanbalī Schools',
      position: 'The paternal grandfather inherits alongside the full and paternal siblings, sharing the estate with them according to specific, complex formulas. He does, however, block maternal siblings.',
      reasoning: 'They argue that both the grandfather and siblings are related to the deceased through the father, so they should inherit together. They rely on various narrations from companions like Zayd ibn Thābit who devised methods for them to share.',
    },
  ],
  note: 'This calculator implements the specified madhab for this calculation.',
};

export const umariyyatanInfo: InfoPanel = {
    title: 'The "Umariyyatān" (Two Cases of ʿUmar)',
    description: 'These are two specific inheritance scenarios where the mother\'s share is calculated differently to prevent her from inheriting more than or equal to the father, which would contradict the general principle of the male receiving double the female\'s share when they are of the same class.',
    positions: [
        {
            school: 'Majority (Based on the ruling of Caliph ʿUmar)',
            position: 'In the two specific cases of (1) Husband, Mother, Father and (2) Wife, Mother, Father, the mother receives one-third of the *remainder* after the spouse has taken their share, not one-third of the total estate.',
            reasoning: 'If the mother took 1/3 of the whole estate, in the first case she would get 1/3 while the father (as residuary) gets 1/6, and in the second she would get 1/3 while the father gets 5/12. In both cases she receives more than him. ʿUmar\'s ruling gives her 1/3 of the remainder, ensuring the father receives twice her share.'
        },
        {
            school: 'Ibn ʿAbbās (Minority View)',
            position: 'The mother should receive her Quranically prescribed share of 1/3 of the total estate in all cases where there are no children.',
            reasoning: 'This position adheres to the literal text (ẓāhir) of the Quran (4:11), which states "if the deceased left no child and the parents are the (only) heirs, the mother has a third." The re-interpretation is seen as an unnecessary deviation from the clear text.'
        }
    ],
    note: 'This calculator applies the majority ruling of Caliph ʿUmar.'
};
