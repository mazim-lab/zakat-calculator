
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

export const jafariSystemInfo: InfoPanel = {
  title: "Jaʿfarī (Shīʿa Twelver) Inheritance System",
  description: "The Jaʿfarī school uses a fundamentally different structure from the Sunni schools. It rejects the concept of ʿaṣabah (residuary/agnatic heirs) and instead uses a strict class-based system where closer classes completely exclude more distant ones.",
  positions: [
    {
      school: "Class System (Jaʿfarī)",
      position: "Heirs are divided into three classes: Class 1 (parents and children/grandchildren), Class 2 (grandparents and siblings/their descendants), Class 3 (uncles, aunts, and their descendants). A higher class blocks all lower classes entirely.",
      reasoning: "Based on the Quranic principle of priority by degree of closeness (al-aqrab fa-l-aqrab). Unlike the Sunni system which uses a more complex interplay of sharers and residuaries, the Jaʿfarī system applies a cleaner hierarchy.",
    },
    {
      school: "No ʿAṣabah (Jaʿfarī)",
      position: "There are no 'residuary' heirs. When fixed shares don't exhaust the estate, the surplus returns to the fixed-share heirs via radd — it does NOT pass to male agnatic relatives.",
      reasoning: "The Jaʿfarī school argues that the Sunni concept of ʿaṣabah contradicts the Quranic inheritance verses, which they interpret as giving specific shares to all heirs. Surplus should return proportionally to those same heirs.",
    },
    {
      school: "No ʿAwl (Jaʿfarī)",
      position: "Shares are never proportionally reduced. If shares would exceed 100%, the shortfall is borne by daughters or sisters, not distributed across all heirs.",
      reasoning: "The Jaʿfarī jurists (following Ibn ʿAbbās) argue that God would not prescribe shares that exceed the total estate. The Sunni mechanism of ʿawl (attributed to Caliph ʿUmar) is rejected.",
    },
    {
      school: "Daughters Block Siblings (Jaʿfarī)",
      position: "Daughters (Class 1) completely block brothers and sisters (Class 2) from inheriting.",
      reasoning: "In the Sunni system, brothers can inherit alongside daughters as residuaries (ʿaṣabah). Since Jaʿfarī rejects ʿaṣabah and uses the class system, daughters (Class 1) block siblings (Class 2) entirely.",
    },
  ],
  note: "These differences can lead to dramatically different distributions. For example, if someone dies leaving a daughter and a brother: in Sunni schools, the daughter gets 1/2 and the brother gets 1/2 as residuary. In Jaʿfarī, the daughter gets the entire estate (brother is blocked as Class 2).",
};

export const baytAlMalInfo: InfoPanel = {
    title: "Bayt al-Māl (بيت المال) — The Public Treasury",
    description: "When there are no heirs, or when fixed shares do not exhaust the estate and there are no residuary heirs (ʿaṣabah) to receive the remainder, the surplus goes to Bayt al-Māl — the Islamic public treasury. In countries without a functioning Bayt al-Māl, scholars differ on what should be done with this portion.",
    positions: [
        {
            school: "Majority of Contemporary Scholars (Fiqh Council of North America, European Council for Fatwa and Research)",
            position: "The Bayt al-Māl portion should be directed to Islamic charitable causes — mosques, Islamic schools, Muslim welfare organizations, and community institutions.",
            reasoning: "Since no legitimate Bayt al-Māl exists in Western nations, Islamic community institutions are the closest functional equivalent. They serve the same purpose of benefiting the Muslim public. This is the most widely recommended position for Muslims living in non-Muslim-majority countries."
        },
        {
            school: "Some Contemporary Scholars (based on the position of ʿUthmān ibn ʿAffān)",
            position: "In the absence of a functioning Bayt al-Māl, the surplus should be redistributed to the spouse via radd, rather than leaving it unallocated.",
            reasoning: "ʿUthmān ibn ʿAffān (raḍiya Allāhu ʿanhu) held that radd applies to all fixed-share heirs, including the spouse. Several modern personal status codes (Egypt, Pakistan, some Gulf states) have adopted this view. Some scholars specifically recommend it for Western Muslims to prevent the estate from falling under non-Islamic intestacy laws."
        },
        {
            school: "Minority View",
            position: "The Western government functions as a de facto Bayt al-Māl, and the estate may escheat to the state under intestacy law.",
            reasoning: "Since Western governments provide public services (infrastructure, welfare, security), they serve a similar function. Most scholars reject this view because Western governments do not distribute wealth according to Sharīʿah priorities."
        },
    ],
    note: "Practical advice: The best approach is to write a waṣiyyah (Islamic will) that explicitly directs any Bayt al-Māl portion to specific Islamic charities. This prevents the estate from going through Western intestacy courts, which would distribute it according to non-Islamic rules. In many jurisdictions, dying without a will means the state decides how your estate is distributed — which almost certainly will not follow Islamic inheritance law."
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
