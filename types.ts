
export enum AppSection {
  GUIDANCE = 'GUIDANCE',
  GOALS = 'GOALS',
  CALCULATOR = 'CALCULATOR',
  CHECKLIST = 'CHECKLIST',
  THEORY = 'THEORY'
}

export interface CalculationResult {
  etSize: string;
  etDepth: string;
  epiIV: string;
  epiET: string;
  volumeExpansion: string;
}

export interface SpO2Target {
  time: string;
  target: string;
}

export interface TheorySection {
  id: string;
  title: string;
  content: string;
}
