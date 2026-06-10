import type { ContextId, EventChoice, ScoreKey } from "./data";

export type Difficulty = "easy" | "standard" | "advanced";

export type WorkspaceState = {
  issueId: string;
  contextId: ContextId;
  difficulty: Difficulty;
  selectedTokens: string[];
  selectedEvidence: string[];
  selectedConstraints: string[];
  stakeholderVotes: Record<string, "support" | "changes" | "oppose" | "none">;
  bonusResources: number;
  paused: boolean;
  activeChallengeUpdate: string;
  eventHistory: {
    title: string;
    description: string;
    consequence: string;
    choices: EventChoice[];
    selectedChoice?: EventChoice;
    drawnAt: string;
  }[];
  currentEvent?: {
    title: string;
    description: string;
    consequence: string;
    choices: EventChoice[];
  };
  resourceEffects: Record<string, number>;
  scoreEffects: Partial<Record<ScoreKey, number>>;
  eventQualityTotal: number;
  facilitatorActions: number;
  approvalPercentage: number;
  team: {
    name: string;
    members: string;
  };
  scores: {
    inclusion: number;
    feasibility: number;
    impact: number;
    equity: number;
    innovation: number;
  };
  timer: {
    mode: 60 | 90 | 120;
    remainingSeconds: number;
    running: boolean;
  };
  outputs: {
    problem: string;
    insight: string;
    idea: string;
    prototype: string;
    equity: string;
    test: string;
    measures: string;
  };
  assistantOutputs: {
    policyBrief: string;
    reflectionReport: string;
    facilitatorAssessment: string;
    progressSummary: string;
  };
};

export const defaultScores: WorkspaceState["scores"] = {
  inclusion: 0,
  feasibility: 0,
  impact: 0,
  equity: 0,
  innovation: 0
};

export const defaultTimer: WorkspaceState["timer"] = {
  mode: 60,
  remainingSeconds: 60 * 60,
  running: false
};

export const emptyOutputs: WorkspaceState["outputs"] = {
  problem: "",
  insight: "",
  idea: "",
  prototype: "",
  equity: "",
  test: "",
  measures: ""
};

export const emptyAssistantOutputs: WorkspaceState["assistantOutputs"] = {
  policyBrief: "",
  reflectionReport: "",
  facilitatorAssessment: "",
  progressSummary: ""
};
