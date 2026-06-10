"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contextPacks, getIssuePack, policyIssues, resourceTokens } from "../data";
import { defaultScores, defaultTimer, emptyAssistantOutputs, emptyOutputs, type WorkspaceState } from "../types";
import { calculateApprovalPercentage, calculatePolicyImpactScore, calculateReadiness } from "../readiness";

const storageKey = "policyquest-workspace";

function createInitialState(issueId: string): WorkspaceState {
  return {
    issueId,
    contextId: "qatar",
    difficulty: "standard",
    selectedTokens: [],
    selectedEvidence: [],
    selectedConstraints: [],
    stakeholderVotes: {},
    bonusResources: 0,
    paused: false,
    activeChallengeUpdate: "",
    eventHistory: [],
    currentEvent: undefined,
    resourceEffects: {},
    scoreEffects: {},
    eventQualityTotal: 0,
    facilitatorActions: 0,
    approvalPercentage: 0,
    implementationReadinessScore: 0,
    team: {
      name: "",
      members: ""
    },
    scores: defaultScores,
    timer: defaultTimer,
    outputs: emptyOutputs,
    assistantOutputs: emptyAssistantOutputs
  };
}

function normalizeState(saved: Partial<WorkspaceState>): WorkspaceState {
  const legacy = saved as Partial<WorkspaceState> & {
    selectedResources?: string[];
    finalOutputFields?: WorkspaceState["outputs"];
    scoreDashboard?: WorkspaceState["scores"];
  };
  const base = createInitialState(saved.issueId ?? "mental-health-access");

  return {
    ...base,
    ...saved,
    contextId: saved.contextId ?? base.contextId,
    selectedTokens: saved.selectedTokens ?? legacy.selectedResources ?? base.selectedTokens,
    selectedEvidence: saved.selectedEvidence ?? base.selectedEvidence,
    selectedConstraints: saved.selectedConstraints ?? base.selectedConstraints,
    stakeholderVotes: saved.stakeholderVotes ?? base.stakeholderVotes,
    bonusResources: saved.bonusResources ?? base.bonusResources,
    activeChallengeUpdate: saved.activeChallengeUpdate ?? base.activeChallengeUpdate,
    eventHistory: saved.eventHistory ?? base.eventHistory,
    difficulty: saved.difficulty ?? base.difficulty,
    currentEvent: saved.currentEvent ?? base.currentEvent,
    resourceEffects: saved.resourceEffects ?? base.resourceEffects,
    scoreEffects: saved.scoreEffects ?? base.scoreEffects,
    eventQualityTotal: saved.eventQualityTotal ?? base.eventQualityTotal,
    facilitatorActions: saved.facilitatorActions ?? base.facilitatorActions,
    approvalPercentage: saved.approvalPercentage ?? base.approvalPercentage,
    implementationReadinessScore: saved.implementationReadinessScore ?? base.implementationReadinessScore,
    team: {
      ...base.team,
      ...saved.team
    },
    scores: {
      ...base.scores,
      ...legacy.scoreDashboard,
      ...saved.scores
    },
    timer: {
      ...base.timer,
      ...saved.timer
    },
    outputs: {
      ...base.outputs,
      ...legacy.finalOutputFields,
      ...saved.outputs
    },
    assistantOutputs: {
      ...base.assistantOutputs,
      ...saved.assistantOutputs
    }
  };
}

function saveSessionState(state: WorkspaceState, readinessOverride?: number) {
  const policyImpactScore = calculatePolicyImpactScore(state);

  window.localStorage.setItem(storageKey, JSON.stringify(state));
  window.localStorage.setItem("policyquest-selectedEvidence", JSON.stringify(state.selectedEvidence));
  window.localStorage.setItem("policyquest-selectedConstraints", JSON.stringify(state.selectedConstraints));
  window.localStorage.setItem("policyquest-selectedResources", JSON.stringify(state.selectedTokens));
  window.localStorage.setItem("policyquest-finalOutputFields", JSON.stringify(state.outputs));
  window.localStorage.setItem("policyquest-eventHistory", JSON.stringify(state.eventHistory));
  window.localStorage.setItem("policyquest-stakeholderVotes", JSON.stringify(state.stakeholderVotes));
  window.localStorage.setItem("policyquest-scoreDashboard", JSON.stringify(state.scores));
  window.localStorage.setItem("policyquest-difficulty", JSON.stringify(state.difficulty));
  window.localStorage.setItem("policyquest-policyImpactScore", JSON.stringify(policyImpactScore));
  window.localStorage.setItem("policyquest-implementationReadiness", JSON.stringify(readinessOverride ?? state.implementationReadinessScore));
}

function fallback(value: string, text: string) {
  return value.trim() || text;
}

function listOrFallback(items: string[], text: string) {
  return items.length > 0 ? items.join(", ") : text;
}

function responseOrEmpty(value: string) {
  return value.trim() || "No response recorded";
}

export default function FinalPage() {
  const [state, setState] = useState<WorkspaceState>(createInitialState("mental-health-access"));
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [showStakeholderRoles, setShowStakeholderRoles] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = normalizeState(JSON.parse(saved) as Partial<WorkspaceState>);
        console.log("PolicyQuest final page loaded session:", parsed);
        setState(parsed);
      } catch {
        window.localStorage.removeItem(storageKey);
        setState(createInitialState("mental-health-access"));
      }
    }

    setHasLoadedSession(true);
  }, []);

  const issue = useMemo(
    () => policyIssues.find((item) => item.id === state.issueId) ?? policyIssues[0],
    [state.issueId]
  );
  const context = contextPacks[state.contextId] ?? contextPacks.qatar;
  const issuePack = getIssuePack(context, issue.id);

  const selectedTokens = resourceTokens.filter((token) => state.selectedTokens.includes(token.id));
  const evidencePack = issuePack.evidence;
  const selectedEvidence = evidencePack.filter((evidence) => state.selectedEvidence.includes(evidence.id));
  const selectedConstraints = issuePack.constraints.filter((constraint) => state.selectedConstraints.includes(constraint.id));
  const totalScore = Object.values(state.scores).reduce((sum, score) => sum + score, 0);
  const voteValues = Object.values(state.stakeholderVotes);
  const supportCount = voteValues.filter((vote) => vote === "support").length;
  const changesCount = voteValues.filter((vote) => vote === "changes").length;
  const opposeCount = voteValues.filter((vote) => vote === "oppose").length;
  const castVotes = supportCount + changesCount + opposeCount;
  const approvalPercentage = calculateApprovalPercentage(state);
  const policyImpactScore = calculatePolicyImpactScore(state);
  const rating =
    policyImpactScore >= 86
      ? "Policy Champion"
      : policyImpactScore >= 70
        ? "Strong Co-Design Plan"
        : policyImpactScore >= 52
          ? "Feasible Pilot"
          : "Emerging Idea";
  const readiness = calculateReadiness(state);
  const implementationReadinessScore = readiness.score;
  const eventDecisionLines = state.eventHistory
    .filter((event) => event.selectedChoice)
    .map((event) => `${event.title}: ${event.selectedChoice?.label}`);
  const readinessStatus = readiness.category;
  const selectedResourceNames = selectedTokens.map((token) => token.name);
  const selectedEvidenceNames = selectedEvidence.map((evidence) => evidence.title);
  const selectedConstraintNames = selectedConstraints.map((constraint) => constraint.title);
  const mostSignificantEvent = state.eventHistory[0];
  const stakeholderNames = issuePack.stakeholders.map((card) => card.title);
  const referenceLines = issuePack.references.map((reference) => `${reference.organisation} - ${reference.title} (${reference.year})`);
  const achievements = [
    state.selectedEvidence.length >= 2 ? "Evidence Champion" : "",
    state.scores.equity >= 4 && readiness.meaningfulSections.equityAdjustment ? "Equity Champion" : "",
    approvalPercentage >= 70 ? "Consensus Builder" : "",
    state.selectedConstraints.length >= 1 && state.scores.feasibility >= 4 ? "Implementation Thinker" : "",
    state.scores.innovation >= 4 ? "Policy Innovator" : "",
    Object.values(state.stakeholderVotes).filter((vote) => vote === "changes" || vote === "support").length >= 3 ? "Community Builder" : ""
  ].filter(Boolean);

  useEffect(() => {
    if (!hasLoadedSession) {
      return;
    }

    saveSessionState(state, implementationReadinessScore);
  }, [hasLoadedSession, implementationReadinessScore, state]);

  function updateAssistantOutput(field: keyof WorkspaceState["assistantOutputs"], value: string) {
    setState((current) => ({
      ...current,
      assistantOutputs: {
        ...current.assistantOutputs,
        [field]: value
      }
    }));
  }

  function generatePolicyBriefDraft() {
    const draft = `1. Policy Challenge
${issue.challenge}

2. Problem Statement
${fallback(state.outputs.problem, "No response recorded")}

3. Key Insights from Co-Design
${fallback(state.outputs.insight, "No response recorded")}

4. Proposed Intervention
${fallback(state.outputs.idea, "No response recorded")}

5. Stakeholders Involved
${stakeholderNames.join(", ")}

6. Equity Considerations
${fallback(state.outputs.equity, "No response recorded")}

7. Resource Requirements
${listOrFallback(selectedResourceNames, "No response recorded")}

8. Pilot Proposal
${fallback(state.outputs.test, "No response recorded")}

9. Success Indicators
${fallback(state.outputs.measures, "No response recorded")}

10. Risks and Challenges
${listOrFallback([...eventDecisionLines, ...selectedConstraintNames], "No response recorded")}

References Used
${referenceLines.join("\n")}`;

    updateAssistantOutput("policyBrief", draft);
  }

  function generateReflectionReport() {
    const draft = `1. What We Learned
${fallback(state.outputs.insight, "No response recorded")}

2. Stakeholder Perspectives That Influenced Us
${stakeholderNames.join(", ")}

3. Most Significant Event
${mostSignificantEvent ? `${mostSignificantEvent.title}: ${mostSignificantEvent.selectedChoice ? mostSignificantEvent.selectedChoice.label : mostSignificantEvent.consequence}` : "No response recorded"}

4. Trade-offs We Faced
${listOrFallback(eventDecisionLines, "No response recorded")}

5. Equity Considerations
${fallback(state.outputs.equity, "No response recorded")}

6. What We Would Test Next
${fallback(state.outputs.test, "No response recorded")}

7. Evidence Needed Before Scaling
${listOrFallback(selectedEvidenceNames, fallback(state.outputs.measures, "No response recorded"))}

References Used
${referenceLines.join("\n")}`;

    updateAssistantOutput("reflectionReport", draft);
  }

  function generateFacilitatorAssessment() {
    const draft = `Team Name
${state.team.name || "Unnamed team"}

Policy Issue
${issue.title}

Difficulty Level
${state.difficulty}

Policy Impact Score
${policyImpactScore}/100

Resources Used
${listOrFallback(selectedResourceNames, "No response recorded")}

Evidence Used
${listOrFallback(selectedEvidenceNames, "No response recorded")}

Constraints Encountered
${listOrFallback(selectedConstraintNames, "No response recorded")}

Events Encountered
${listOrFallback(state.eventHistory.map((event) => event.title), "No response recorded")}

Stakeholder Approval
${approvalPercentage}%

Implementation Readiness
${implementationReadinessScore}/100 - ${readinessStatus}

Final Rating
${rating}

Facilitator Rubric
Evidence Use: ${readiness.rubric.evidenceUse}/5
Feasibility: ${readiness.rubric.feasibility}/5
Equity: ${readiness.rubric.equity}/5
Stakeholder Engagement: ${readiness.rubric.stakeholderEngagement}/5
Testing Plan: ${readiness.rubric.testingPlan}/5

Facilitator Comments
${readiness.rubric.comments.join("\n")}

Assessment Prompts
- Which stakeholder perspective was most influential?
- Which group remained underserved?
- What evidence would be needed before implementation?
- What assumptions changed during the exercise?

References Used
${referenceLines.join("\n")}`;

    updateAssistantOutput("facilitatorAssessment", draft);
  }

  function generateProgressSummary() {
    const completedStages = [
      state.outputs.problem || state.outputs.insight ? "Understand Experiences" : "",
      state.outputs.insight || state.outputs.prototype ? "Imagine the Ideal" : "",
      state.outputs.idea || state.outputs.prototype ? "Create New Ideas" : "",
      state.outputs.test || state.outputs.measures ? "Make Decisions" : ""
    ].filter(Boolean);
    const draft = `Stages Completed
${listOrFallback(completedStages, "No stage notes completed yet.")}

Resources Selected
${listOrFallback(selectedResourceNames, "No response recorded")}

Evidence Selected
${state.selectedEvidence.length}

Event Decisions Made
${listOrFallback(eventDecisionLines, "No response recorded")}

Stakeholder Approval
${approvalPercentage}%

Implementation Readiness
${implementationReadinessScore}/100 - ${readinessStatus}

Total Score
${totalScore}/25

Final Rating
${rating}

References Used
${referenceLines.join("\n")}`;

    updateAssistantOutput("progressSummary", draft);
  }

  return (
    <main>
      <header className="pageHeader finalHeader">
        <Link className="backLink" href={`/workspace?issue=${issue.id}&context=${context.id}`}>
          Back to workspace
        </Link>
        <div>
          <p className="eyebrow">Final output</p>
          <h1>Service improvement plan</h1>
          <p>{context.name} · {issue.title}</p>
        </div>
        <div className="buttonRow finalActions">
          <button className="button dark" onClick={() => window.print()}>
            Export PDF
          </button>
          <button className="button light" onClick={() => window.print()}>
            Print report
          </button>
          <Link className="button primary" href="/pitch">
            Cabinet Pitch
          </Link>
        </div>
      </header>

      <section className="outputSheet">
        <div className="outputTitle">
          <p className="eyebrow">PolicyQuest plan</p>
          <h2>{issue.challenge}</h2>
          <div className="ratingBanner">
            <span>End-game rating</span>
            <strong>{rating}</strong>
            <small>Policy Impact Score: {policyImpactScore}/100</small>
          </div>
          <div className="achievementStrip">
            {achievements.length > 0 ? achievements.map((achievement) => (
              <span className="achievementBadge" key={achievement}>{achievement}</span>
            )) : <span className="achievementBadge mutedBadge">No badges awarded yet</span>}
          </div>
          <div className="teamSummary">
            <div>
              <strong>Team</strong>
              <span>{state.team.name || "Unnamed team"}</span>
            </div>
            <div>
              <strong>Members</strong>
              <span>{state.team.members || "Not added yet"}</span>
            </div>
          </div>
        </div>

        <div className="outputGrid">
          <article>
            <span>1</span>
            <h3>Access problem</h3>
            <p>{responseOrEmpty(state.outputs.problem)}</p>
          </article>
          <article>
            <span>2</span>
            <h3>Key insight</h3>
            <p>{responseOrEmpty(state.outputs.insight)}</p>
          </article>
          <article>
            <span>3</span>
            <h3>Improvement idea</h3>
            <p>{responseOrEmpty(state.outputs.idea)}</p>
          </article>
          <article>
            <span>4</span>
            <h3>Prototype or journey</h3>
            <p>{responseOrEmpty(state.outputs.prototype)}</p>
          </article>
          <article>
            <span>5</span>
            <h3>Equity adjustment</h3>
            <p>{responseOrEmpty(state.outputs.equity)}</p>
          </article>
          <article>
            <span>6</span>
            <h3>First test</h3>
            <p>{responseOrEmpty(state.outputs.test)}</p>
          </article>
        </div>

        <div className="outputPanel">
          <h3>Resources needed</h3>
          <div className="miniList">
            {selectedTokens.length > 0 ? (
              selectedTokens.map((token) => <span key={token.id}>{token.name}</span>)
            ) : (
              <span>No response recorded</span>
            )}
          </div>
        </div>

        <div className="outputPanel">
          <h3>Evidence cards used</h3>
          {selectedEvidence.length > 0 ? (
            <div className="reportHistory">
              {selectedEvidence.map((evidence) => (
                <div key={evidence.id}>
                  <strong>{evidence.title}</strong>
                  <span>{evidence.type}: {evidence.finding}</span>
                  <span>Source Organisation: {evidence.sourceOrganisation}</span>
                  <span>Document Title: {evidence.sourceTitle}</span>
                  <span>Year: {evidence.sourceYear}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No response recorded</p>
          )}
        </div>

        <div className="outputPanel">
          <h3>Constraints encountered</h3>
          {selectedConstraints.length > 0 ? (
            <div className="reportHistory">
              {selectedConstraints.map((constraint) => (
                <div key={constraint.id}>
                  <strong>{constraint.title}</strong>
                  <span>{constraint.impact} Response: {constraint.response}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No response recorded</p>
          )}
        </div>

        <div className="outputPanel">
          <h3>Simulation events considered</h3>
          {state.eventHistory.length > 0 ? (
            <div className="reportHistory">
              {state.eventHistory.slice(0, 6).map((event, index) => (
                <div key={`${event.title}-${index}`}>
                  <strong>{event.title}</strong>
                  <span>{event.selectedChoice ? `${event.selectedChoice.label}: ${event.selectedChoice.consequence}` : event.consequence}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No response recorded</p>
          )}
        </div>

        <div className="outputPanel">
          <h3>Success measures</h3>
          <p>{responseOrEmpty(state.outputs.measures)}</p>
        </div>

        <div className="outputPanel">
          <h3>Stakeholder voting results</h3>
          <div className="voteSummary reportVoteSummary">
            <div><strong>{supportCount}</strong><span>Supporting</span></div>
            <div><strong>{changesCount}</strong><span>Support with changes</span></div>
            <div><strong>{opposeCount}</strong><span>Opposing</span></div>
            <div><strong>{approvalPercentage}%</strong><span>Approval</span></div>
          </div>
          {approvalPercentage < 70 && castVotes > 0 ? <p className="warningText">Revise proposal before implementation.</p> : null}
        </div>

        <div className="outputPanel">
          <h3>Final debrief</h3>
          <p className="ruleText">Reveal confidential stakeholder roles only after voting and final submission.</p>
          <button className="button light noPrint" onClick={() => setShowStakeholderRoles((current) => !current)}>
            {showStakeholderRoles ? "Hide Stakeholder Roles" : "Reveal Stakeholder Roles"}
          </button>
          {showStakeholderRoles ? (
            <div className="roleRevealGrid">
              {issuePack.roleObjectives.map((role) => (
                <article className="printRoleCard confidentialRoleCard" key={role.id}>
                  <div className="roleTitle">
                    <div>
                      <p className="eyebrow">Debrief role</p>
                      <h2>{role.name}</h2>
                    </div>
                  </div>
                  <div className="roleSection"><strong>Role Description</strong><p>{role.purpose}</p></div>
                  <div className="roleSection"><strong>Hidden Priority</strong><p>{role.hiddenPriority}</p></div>
                  <div className="roleSection"><strong>Approval Conditions</strong><p>{role.hiddenObjective}</p></div>
                  <div className="roleSection"><strong>Voting Preference</strong><p>{role.defends}</p></div>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="outputPanel">
          <h3>Implementation readiness</h3>
          <div className="ratingBanner">
            <span>Implementation Readiness Score</span>
            <strong>{implementationReadinessScore}/100</strong>
            <small>{readinessStatus}</small>
          </div>
          <div className="readinessBreakdown">
            <div><strong>{state.selectedEvidence.length}</strong><span>Evidence used</span><small>{state.selectedEvidence.length >= 2 ? "Meets requirement" : "Needs at least 2"}</small></div>
            <div><strong>{state.selectedConstraints.length}</strong><span>Constraints addressed</span><small>{state.selectedConstraints.length >= 1 ? "Meets requirement" : "Needs at least 1"}</small></div>
            <div><strong>{state.eventHistory.some((event) => event.selectedChoice) ? "Yes" : "No"}</strong><span>Event response completed</span><small>{state.eventHistory.some((event) => event.selectedChoice) ? "Meets requirement" : "Draw and respond to an event"}</small></div>
            <div><strong>{approvalPercentage}%</strong><span>Stakeholder approval</span><small>{approvalPercentage >= 60 ? "Meets requirement" : "Needs 60%+"}</small></div>
            <div><strong>{readiness.completedSections}/6</strong><span>Final output completeness</span><small>{readiness.completionStatus}</small></div>
            <div><strong>{state.scores.feasibility}/5</strong><span>Feasibility score</span><small>{state.scores.feasibility >= 3 ? "Meets requirement" : "Needs 3+"}</small></div>
            <div><strong>{state.scores.equity}/5</strong><span>Equity score</span><small>{state.scores.equity >= 3 ? "Meets requirement" : "Needs 3+"}</small></div>
          </div>
          <div className="readinessFeedback">
            <h3>Why did we get this score?</h3>
            <div className="feedbackGrid">
              {readiness.checks.map((check) => (
                <div className={check.met ? "feedbackItem met" : "feedbackItem warn"} key={check.label}>
                  <strong>{check.met ? "✓" : "⚠"} {check.label}</strong>
                  <span>{check.met ? "Requirement met" : check.warning}</span>
                </div>
              ))}
            </div>
            <p className="ruleText">Completed sections: <strong>{readiness.completedSections}/6</strong> · {readiness.completionStatus}</p>
            {readiness.stakeholderWarning ? <p className="warningText">{readiness.stakeholderWarning}</p> : null}
          </div>
        </div>

        <div className="outputPanel">
          <h3>Facilitator assessment rubric</h3>
          <div className="readinessBreakdown">
            <div><strong>{readiness.rubric.evidenceUse}/5</strong><span>Evidence Use</span></div>
            <div><strong>{readiness.rubric.feasibility}/5</strong><span>Feasibility</span></div>
            <div><strong>{readiness.rubric.equity}/5</strong><span>Equity</span></div>
            <div><strong>{readiness.rubric.stakeholderEngagement}/5</strong><span>Stakeholder Engagement</span></div>
            <div><strong>{readiness.rubric.testingPlan}/5</strong><span>Testing Plan</span></div>
          </div>
          <div className="reportHistory">
            {readiness.rubric.comments.map((comment) => (
              <div key={comment}>
                <span>{comment}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="outputPanel">
          <h3>References used</h3>
          <div className="reportHistory">
            {issuePack.references.map((reference) => (
              <div key={`${reference.organisation}-${reference.title}`}>
                <strong>{reference.organisation}</strong>
                <span>{reference.title} ({reference.year})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rubricStrip scoreReport">
          {Object.entries(state.scores).map(([category, score]) => (
            <div key={category}>
              <strong>{category}</strong>
              <span>{score}/5</span>
            </div>
          ))}
          <div>
            <strong>Total</strong>
            <span>{totalScore}/25</span>
          </div>
        </div>

        <div className="outputPanel assistantPanel">
          <div className="assistantHeader">
            <div>
              <p className="eyebrow">Co-Design Output Assistant</p>
              <h3>Structured learning outputs</h3>
              <p>Generate concise drafts from gameplay decisions. Students should edit, challenge, and improve them.</p>
            </div>
            <div className="assistantActions">
              <button className="button dark" onClick={generatePolicyBriefDraft}>
                Generate Policy Brief Draft
              </button>
              <button className="button light" onClick={generateReflectionReport}>
                Generate Reflection Report
              </button>
              <button className="button light" onClick={generateFacilitatorAssessment}>
                Generate Facilitator Assessment Sheet
              </button>
              <button className="button light" onClick={generateProgressSummary}>
                Generate Progress Summary
              </button>
            </div>
          </div>
        </div>

        <div className="assistantOutputGrid">
          <label className="assistantOutput">
            Policy Brief Draft
            <div className="printGeneratedOutput">{state.assistantOutputs.policyBrief || "Not generated."}</div>
            <textarea
              value={state.assistantOutputs.policyBrief}
              onChange={(event) => updateAssistantOutput("policyBrief", event.target.value)}
              placeholder=""
            />
          </label>
          <label className="assistantOutput">
            Reflection Report
            <div className="printGeneratedOutput">{state.assistantOutputs.reflectionReport || "Not generated."}</div>
            <textarea
              value={state.assistantOutputs.reflectionReport}
              onChange={(event) => updateAssistantOutput("reflectionReport", event.target.value)}
              placeholder=""
            />
          </label>
          <label className="assistantOutput">
            Facilitator Assessment Sheet
            <div className="printGeneratedOutput">{state.assistantOutputs.facilitatorAssessment || "Not generated."}</div>
            <textarea
              value={state.assistantOutputs.facilitatorAssessment}
              onChange={(event) => updateAssistantOutput("facilitatorAssessment", event.target.value)}
              placeholder=""
            />
          </label>
          <label className="assistantOutput">
            Session Summary
            <div className="printGeneratedOutput">{state.assistantOutputs.progressSummary || "Not generated."}</div>
            <textarea
              value={state.assistantOutputs.progressSummary}
              onChange={(event) => updateAssistantOutput("progressSummary", event.target.value)}
              placeholder=""
            />
          </label>
        </div>
      </section>
    </main>
  );
}
