
export type Heir =
  | 'husband'
  | 'wife'
  | 'son'
  | 'daughter'
  | 'father'
  | 'mother'
  | 'paternalGrandfather'
  | 'paternalGrandmother'
  | 'maternalGrandmother'
  | 'fullBrother'
  | 'fullSister'
  | 'paternalHalfBrother'
  | 'paternalHalfSister'
  | 'maternalHalfBrother'
  | 'maternalHalfSister'
  | 'sonsSon'
  | 'sonsDaughter';

export interface HeirInput {
  heir: Heir;
  count: number;
}

export interface Heirs {
  husband?: number;
  wife?: number;
  son?: number;
  daughter?: number;
  father?: boolean;
  mother?: boolean;
  paternalGrandfather?: boolean;
  paternalGrandmother?: boolean;
  maternalGrandmother?: boolean;
  fullBrother?: number;
  fullSister?: number;
  paternalHalfBrother?: number;
  paternalHalfSister?: number;
  maternalHalfBrother?: number;
  maternalHalfSister?: number;
  sonsSon?: number;
  sonsDaughter?: number;
}

export interface Share {
  heir: Heir;
  label: string;
  count: number;
  share: number | null; // Null if blocked
  reason: string;
  amount: number;
}

export type Madhab = 'hanafi' | 'maliki' | 'shafii' | 'hanbali' | 'jafari';

export interface CalculationResult {
  shares: Share[];
  blocked: Share[];
  totalShares: number;
  wasAwlApplied: boolean;
  awlExplanation?: string;
  wasRaddApplied: boolean;
  raddExplanation?: string;
  notes: string[];
}

export interface ScholarlyPosition {
  school: string;
  position: string;
  reasoning: string;
}

export interface InfoPanel {
  title: string;
  description: string;
  positions: ScholarlyPosition[];
  note?: string;
}
