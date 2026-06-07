export interface Readiness {
  mythicPlus: number;
  heroicRaid: number;
  mythicRaid: number;
}

export interface Bottleneck {
  title: string;
  explanation: string;
}

export interface RoadmapStep {
  step: number;
  title: string;
  detail: string;
}

export interface Suggestion {
  title: string;
  description: string;
  cta: string;
}

export interface Analysis {
  characterScore: number;
  readiness: Readiness;
  strengths: string[]; // 3-5
  weaknesses: string[]; // 3-5
  bottlenecks: Bottleneck[]; // 2-4
  actionPlan: string[]; // 4-6
  roadmap: RoadmapStep[]; // 3-5
  skycoachSuggestions: Suggestion[]; // exactly 3
}

export type AnalysisSource = "claude" | "fallback";

export interface AnalysisResult {
  character: import("@/types/character").NormalizedCharacter;
  analysis: Analysis;
  meta: {
    source: AnalysisSource;
    cached: boolean;
    usedFixture: boolean;
    keyExpected: boolean;
  };
}
