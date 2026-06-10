import type { WorkspaceState } from "./types";

export type SimulationAssessment = {
  ready: boolean;
  status: "Not yet assessed" | "Assessed";
  message: string;
  missing: string[];
  scores?: {
    inclusion: number;
    feasibility: number;
    impact: number;
    equity: number;
    sustainability: number;
  };
  overall?: number;
  strengths: string[];
  improvements: string[];
  trace: {
    label: string;
    evidence: string;
  }[];
};

const weakResponses = new Set([
  "to be done",
  "tbd",
  "placeholder",
  "not sure",
  "n/a",
  "none",
  "test"
]);

export function isMeaningfulContent(text: string): boolean {
  const normalized = text.trim().toLowerCase();

  if (!normalized || normalized.length < 20) {
    return false;
  }

  return !weakResponses.has(normalized);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateApprovalPercentage(state: WorkspaceState) {
  const voteValues = Object.values(state.stakeholderVotes);
  const supportCount = voteValues.filter((vote) => vote === "support").length;
  const changesCount = voteValues.filter((vote) => vote === "changes").length;
  const opposeCount = voteValues.filter((vote) => vote === "oppose").length;
  const castVotes = supportCount + changesCount + opposeCount;

  return castVotes > 0 ? Math.round(((supportCount + changesCount * 0.5) / castVotes) * 100) : state.approvalPercentage;
}

function scoreFromEvidence(count: number) {
  return clamp(1 + count, 1, 5);
}

function scoreFromVotes(state: WorkspaceState) {
  const voteValues = Object.values(state.stakeholderVotes);
  const castVotes = voteValues.length;
  const approval = calculateApprovalPercentage(state);

  if (castVotes === 0) {
    return 1;
  }

  return approval >= 80 ? 5 : approval >= 65 ? 4 : approval >= 50 ? 3 : approval >= 30 ? 2 : 1;
}

function scoreFromMeaningfulContent(...values: string[]) {
  const count = values.filter(isMeaningfulContent).length;
  return clamp(1 + count, 1, 5);
}

export function calculateSimulationAssessment(state: WorkspaceState): SimulationAssessment {
  const eventResponses = state.eventHistory.filter((event) => event.selectedChoice);
  const voteCount = Object.values(state.stakeholderVotes).filter((vote) => vote !== "none").length;
  const meaningfulPlanSections = [
    state.outputs.problem,
    state.outputs.insight,
    state.outputs.idea,
    state.outputs.prototype,
    state.outputs.equity,
    state.outputs.test
  ].filter(isMeaningfulContent).length;
  const missing = [
    state.selectedEvidence.length >= 2 ? "" : "Use at least 2 evidence cards",
    state.selectedTokens.length > 0 ? "" : "Allocate resources",
    state.selectedConstraints.length > 0 ? "" : "Select at least 1 constraint",
    eventResponses.length > 0 ? "" : "Respond to at least 1 policy event",
    voteCount >= 4 ? "" : "Complete stakeholder voting",
    meaningfulPlanSections >= 4 ? "" : "Complete key final output fields"
  ].filter(Boolean);

  if (missing.length > 0) {
    return {
      ready: false,
      status: "Not yet assessed",
      message: "Results will be generated after completing the simulation and responding to policy events.",
      missing,
      strengths: [],
      improvements: [],
      trace: []
    };
  }

  const approvalScore = scoreFromVotes(state);
  const eventQualityScore = clamp(2 + Math.min(3, state.eventQualityTotal), 1, 5);
  const evidenceScore = scoreFromEvidence(state.selectedEvidence.length);
  const resourceScore = clamp(1 + state.selectedTokens.length, 1, 5);
  const constraintPenalty = Math.min(2, state.selectedConstraints.length);
  const inclusion = clamp(Math.round((approvalScore + evidenceScore + scoreFromMeaningfulContent(state.outputs.insight, state.outputs.equity)) / 3), 1, 5);
  const feasibility = clamp(Math.round((resourceScore + eventQualityScore + (state.selectedConstraints.length > 0 ? 3 : 1)) / 3), 1, 5);
  const impact = clamp(Math.round((eventQualityScore + evidenceScore + scoreFromMeaningfulContent(state.outputs.idea, state.outputs.test, state.outputs.measures)) / 3), 1, 5);
  const equity = clamp(Math.round((scoreFromMeaningfulContent(state.outputs.equity, state.outputs.problem) + approvalScore + evidenceScore) / 3), 1, 5);
  const sustainability = clamp(Math.round((resourceScore + eventQualityScore + 4 - constraintPenalty) / 3), 1, 5);
  const scores = { inclusion, feasibility, impact, equity, sustainability };
  const overall = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const strengths = [
    inclusion >= 4 ? "Strong community inclusion" : "",
    equity >= 4 ? "High equity" : "",
    impact >= 4 ? "Clear potential impact" : "",
    evidenceScore >= 4 ? "Evidence-informed decisions" : ""
  ].filter(Boolean);
  const improvements = [
    feasibility <= 3 ? "Moderate implementation feasibility" : "",
    sustainability <= 3 ? "Resource or sustainability constraints" : "",
    state.selectedConstraints.length > 0 ? "Budget, capacity, or governance constraints need management" : "",
    approvalScore <= 3 ? "Stakeholder support needs further negotiation" : ""
  ].filter(Boolean);

  return {
    ready: true,
    status: "Assessed",
    message: "Scores are generated from recorded evidence use, resources, event choices, stakeholder votes, and written outputs.",
    missing: [],
    scores,
    overall,
    strengths: strengths.length ? strengths : ["Balanced policy proposal"],
    improvements: improvements.length ? improvements : ["Continue testing before wider implementation"],
    trace: [
      { label: "Evidence use", evidence: `${state.selectedEvidence.length} evidence cards selected` },
      { label: "Resource allocation", evidence: `${state.selectedTokens.length} resources selected` },
      { label: "Policy events", evidence: `${eventResponses.length} event response recorded` },
      { label: "Stakeholder discussion", evidence: `${voteCount} stakeholder votes submitted` },
      { label: "Plan completeness", evidence: `${meaningfulPlanSections}/6 key plan sections completed` }
    ]
  };
}
