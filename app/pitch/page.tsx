"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contextPacks, getIssuePack, policyIssues, resourceTokens } from "../data";
import { calculateReadiness } from "../readiness";
import { defaultScores, defaultTimer, emptyAssistantOutputs, emptyOutputs, type WorkspaceState } from "../types";

const storageKey = "policyquest-workspace";

type ReviewScores = {
  evidenceUse: number;
  feasibility: number;
  equity: number;
  innovation: number;
  stakeholderResponsiveness: number;
};

const defaultReviewScores: ReviewScores = {
  evidenceUse: 3,
  feasibility: 3,
  equity: 3,
  innovation: 3,
  stakeholderResponsiveness: 3
};

function createInitialState(): WorkspaceState {
  return {
    issueId: "mental-health-access",
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
    team: { name: "", members: "" },
    scores: defaultScores,
    timer: defaultTimer,
    outputs: emptyOutputs,
    assistantOutputs: emptyAssistantOutputs
  };
}

function normalizeState(saved: Partial<WorkspaceState>): WorkspaceState {
  const base = createInitialState();
  return {
    ...base,
    ...saved,
    team: { ...base.team, ...saved.team },
    scores: { ...base.scores, ...saved.scores },
    timer: { ...base.timer, ...saved.timer },
    outputs: { ...base.outputs, ...saved.outputs },
    assistantOutputs: { ...base.assistantOutputs, ...saved.assistantOutputs }
  };
}

function response(value: string) {
  return value.trim() || "No response recorded";
}

export default function PitchPage() {
  const [state, setState] = useState<WorkspaceState>(createInitialState());
  const [reviewScores, setReviewScores] = useState<ReviewScores>(defaultReviewScores);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setState(normalizeState(JSON.parse(saved) as Partial<WorkspaceState>));
    }
    const savedReview = window.localStorage.getItem("policyquest-cabinet-review");
    if (savedReview) {
      setReviewScores(JSON.parse(savedReview) as ReviewScores);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("policyquest-cabinet-review", JSON.stringify(reviewScores));
  }, [reviewScores]);

  const issue = policyIssues.find((item) => item.id === state.issueId) ?? policyIssues[0];
  const context = contextPacks[state.contextId] ?? contextPacks.qatar;
  const issuePack = getIssuePack(context, issue.id);
  const evidencePack = issuePack.evidence;
  const selectedEvidence = evidencePack.filter((evidence) => state.selectedEvidence.includes(evidence.id));
  const selectedResources = resourceTokens.filter((token) => state.selectedTokens.includes(token.id));
  const readiness = calculateReadiness(state);
  const reviewTotal = Object.values(reviewScores).reduce((sum, score) => sum + score, 0);
  const recommendation = reviewTotal >= 21 ? "Approve Pilot" : reviewTotal >= 14 ? "Revise" : "Reject";

  function updateReviewScore(field: keyof ReviewScores, value: number) {
    setReviewScores((current) => ({ ...current, [field]: value }));
  }

  const reviewLabels: Record<keyof ReviewScores, string> = {
    evidenceUse: "Evidence Use",
    feasibility: "Feasibility",
    equity: "Equity",
    innovation: "Innovation",
    stakeholderResponsiveness: "Stakeholder Responsiveness"
  };

  return (
    <main>
      <header className="pageHeader finalHeader">
        <Link className="backLink" href="/final">Back to final report</Link>
        <div>
          <p className="eyebrow">Final Cabinet Pitch</p>
          <h1>3-Minute Cabinet Pitch</h1>
          <p>{context.name} · {issue.title}</p>
        </div>
        <button className="button dark" onClick={() => window.print()}>Print pitch</button>
      </header>

      <section className="outputSheet">
        <div className="outputTitle">
          <p className="eyebrow">Cabinet briefing structure</p>
          <h2>{state.team.name || "PolicyQuest team"} recommendation</h2>
        </div>

        <div className="pitchGrid">
          <article><span>1</span><h3>The Problem</h3><p>{response(state.outputs.problem)}</p></article>
          <article><span>2</span><h3>What Evidence Shows</h3><p>{selectedEvidence.length ? selectedEvidence.map((evidence) => evidence.title).join("; ") : "No response recorded"}</p></article>
          <article><span>3</span><h3>What We Learned</h3><p>{response(state.outputs.insight)}</p></article>
          <article><span>4</span><h3>Proposed Solution</h3><p>{response(state.outputs.idea)}</p></article>
          <article><span>5</span><h3>Equity Considerations</h3><p>{response(state.outputs.equity)}</p></article>
          <article><span>6</span><h3>Pilot Design</h3><p>{response(state.outputs.test)}</p></article>
          <article><span>7</span><h3>Resources Required</h3><p>{selectedResources.length ? selectedResources.map((token) => token.name).join(", ") : "No response recorded"}</p></article>
          <article><span>8</span><h3>Recommendation</h3><p>Proceed with a pilot only if readiness remains at {readiness.category} or higher after facilitator review.</p></article>
        </div>

        <div className="outputPanel">
          <h3>Cabinet Review Panel</h3>
          <div className="scoreDashboard cabinetScores">
            {Object.entries(reviewScores).map(([key, score]) => (
              <label className="scoreControl" key={key}>
                <span>{reviewLabels[key as keyof ReviewScores]}</span>
                <input min="1" max="5" type="range" value={score} onChange={(event) => updateReviewScore(key as keyof ReviewScores, Number(event.target.value))} />
                <strong>{score}</strong>
              </label>
            ))}
            <div className="totalScore"><span>Cabinet Recommendation</span><strong>{recommendation}</strong></div>
          </div>
          <div className="miniList">
            <span>Reject: 5-13</span>
            <span>Revise: 14-20</span>
            <span>Approve Pilot: 21-25</span>
          </div>
        </div>
      </section>
    </main>
  );
}
