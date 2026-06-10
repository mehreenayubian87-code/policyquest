import type { WorkspaceState } from "./types";

export type ReadinessResult = {
  baseScore: number;
  score: number;
  category: "Needs Major Revision" | "Needs Revision" | "Emerging Pilot" | "Pilot Ready";
  meaningfulSections: Record<string, boolean>;
  completedSections: number;
  completionStatus: "Incomplete" | "Partial" | "Complete";
  checks: {
    label: string;
    met: boolean;
    warning: string;
  }[];
  stakeholderWarning: string;
  rubric: {
    evidenceUse: number;
    feasibility: number;
    equity: number;
    stakeholderEngagement: number;
    testingPlan: number;
    comments: string[];
  };
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

export function calculatePolicyImpactScore(state: WorkspaceState) {
  const totalScore = Object.values(state.scores).reduce((sum, score) => sum + score, 0);
  const resourceEffectTotal = Object.values(state.resourceEffects).reduce((sum, effect) => sum + effect, 0);

  return clamp(
    totalScore * 3 +
      state.selectedTokens.length * 3 +
      Math.min(5, state.eventQualityTotal) * 4 +
      Math.max(0, resourceEffectTotal) * 2 +
      state.facilitatorActions,
    0,
    100
  );
}

export function calculateApprovalPercentage(state: WorkspaceState) {
  const voteValues = Object.values(state.stakeholderVotes);
  const supportCount = voteValues.filter((vote) => vote === "support").length;
  const changesCount = voteValues.filter((vote) => vote === "changes").length;
  const opposeCount = voteValues.filter((vote) => vote === "oppose").length;
  const castVotes = supportCount + changesCount + opposeCount;

  return castVotes > 0 ? Math.round(((supportCount + changesCount * 0.5) / castVotes) * 100) : state.approvalPercentage;
}

export function calculateReadiness(state: WorkspaceState): ReadinessResult {
  const policyImpactScore = calculatePolicyImpactScore(state);
  const approvalPercentage = calculateApprovalPercentage(state);
  const eventResponseCompleted = state.eventHistory.some((event) => event.selectedChoice);
  const successMeasuresComplete = isMeaningfulContent(state.outputs.measures);
  const meaningfulSections = {
    accessProblem: isMeaningfulContent(state.outputs.problem),
    keyInsight: isMeaningfulContent(state.outputs.insight),
    serviceImprovementIdea: isMeaningfulContent(state.outputs.idea),
    prototypeJourney: isMeaningfulContent(state.outputs.prototype),
    equityAdjustment: isMeaningfulContent(state.outputs.equity),
    firstTest: isMeaningfulContent(state.outputs.test)
  };
  const completedSections = Object.values(meaningfulSections).filter(Boolean).length;
  const completionStatus =
    completedSections === 6 ? "Complete" : completedSections >= 4 ? "Partial" : "Incomplete";
  const evidenceMet = state.selectedEvidence.length >= 2;
  const constraintMet = state.selectedConstraints.length >= 1;
  const approvalMet = approvalPercentage >= 60;
  const feasibilityMet = state.scores.feasibility >= 3;
  const equityMet = state.scores.equity >= 3;
  const pilotReadyRequirements =
    completedSections === 6 &&
    evidenceMet &&
    constraintMet &&
    eventResponseCompleted &&
    successMeasuresComplete &&
    approvalMet &&
    feasibilityMet &&
    equityMet;
  const baseScore = clamp(
    Math.round(
      state.scores.feasibility * 9 +
        state.scores.equity * 8 +
        approvalPercentage * 0.2 +
        Math.min(3, state.selectedTokens.length) * 4 +
        Math.min(4, state.selectedEvidence.length) * 4 +
        Math.min(3, state.selectedConstraints.length) * 3 +
        (eventResponseCompleted ? 10 : 0) +
        (successMeasuresComplete ? 8 : 0) +
        policyImpactScore * 0.1
    ),
    0,
    100
  );
  let score = baseScore;

  if (completedSections < 6) {
    score = Math.min(score, 69);
  }

  if (!eventResponseCompleted) {
    score = Math.min(score, 79);
  }

  if (!successMeasuresComplete) {
    score = Math.min(score, 79);
  }

  let category: ReadinessResult["category"] =
    score >= 85 && pilotReadyRequirements
      ? "Pilot Ready"
      : score >= 70
        ? "Emerging Pilot"
        : score >= 40
          ? "Needs Revision"
          : "Needs Major Revision";

  if (!pilotReadyRequirements && category === "Pilot Ready") {
    category = "Emerging Pilot";
  }

  if (completedSections < 6 && score > 69) {
    category = "Needs Revision";
  }

  const allSupport = Object.values(state.stakeholderVotes).length > 0 &&
    Object.values(state.stakeholderVotes).every((vote) => vote === "support");
  const stakeholderWarning =
    allSupport &&
    (state.scores.feasibility < 4 ||
      state.scores.equity < 4 ||
      state.selectedConstraints.length > 0 ||
      !eventResponseCompleted)
      ? "High stakeholder approval may be unrealistic. Ask whether any stakeholder would support only with changes."
      : "";
  const testingPlanScore = successMeasuresComplete && meaningfulSections.firstTest ? 5 : meaningfulSections.firstTest ? 3 : 1;
  const evidenceUse = evidenceMet ? 4 + Math.min(1, state.selectedEvidence.length - 2) : Math.max(1, state.selectedEvidence.length + 1);
  const stakeholderEngagement = approvalPercentage >= 70 ? 4 : approvalPercentage >= 50 ? 3 : 2;
  const comments = [
    evidenceMet ? "Evidence requirement met." : "Evidence requirement is incomplete.",
    successMeasuresComplete ? "Testing detail is present." : "The proposal needs stronger testing detail.",
    meaningfulSections.equityAdjustment ? "Equity considerations are recorded." : "Equity considerations are incomplete.",
    eventResponseCompleted ? "An event response was recorded." : "No event response was recorded, so implementation readiness is limited.",
    stakeholderWarning || (state.scores.feasibility < 4 ? "Stakeholder approval should be checked against feasibility concerns." : "")
  ].filter(Boolean);

  return {
    baseScore,
    score,
    category,
    meaningfulSections,
    completedSections,
    completionStatus,
    checks: [
      { label: "Evidence requirement met", met: evidenceMet, warning: "Select at least 2 evidence cards" },
      { label: "Constraint addressed", met: constraintMet, warning: "Select at least 1 constraint card" },
      { label: "Stakeholder approval achieved", met: approvalMet, warning: "Approval needs to reach at least 60%" },
      { label: "Event response completed", met: eventResponseCompleted, warning: "Draw and respond to at least 1 event" },
      { label: "Success measures complete", met: successMeasuresComplete, warning: "Write meaningful success measures" },
      { label: "Prototype has detail", met: meaningfulSections.prototypeJourney, warning: "Prototype/Journey needs more detail" },
      { label: "Equity adjustment complete", met: meaningfulSections.equityAdjustment, warning: "Equity adjustment is incomplete" }
    ],
    stakeholderWarning,
    rubric: {
      evidenceUse: clamp(evidenceUse, 1, 5),
      feasibility: state.scores.feasibility,
      equity: state.scores.equity,
      stakeholderEngagement: clamp(stakeholderEngagement, 1, 5),
      testingPlan: testingPlanScore,
      comments
    }
  };
}
