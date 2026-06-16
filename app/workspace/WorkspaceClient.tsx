"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  activityCards,
  categories,
  contextPacks,
  getIssuePack,
  type ContextId,
  type EventChoice,
  policyIssues,
  resourceTokens,
  type ScoreKey,
  stages,
  type StageId,
  wisdomCards
} from "../data";
import { defaultTimer, emptyAssistantOutputs, emptyOutputs, type WorkspaceState } from "../types";
import { calculateApprovalPercentage, calculateSimulationAssessment } from "../readiness";

const storageKey = "policyquest-workspace";
const challengeUpdates = [
  "A new listening session reveals that the least-heard group is not receiving information early enough.",
  "Frontline staff report that referral forms are discouraging people from completing the process.",
  "Community partners say trust improves when services explain what will happen after first contact.",
  "Recent feedback shows that timing and location are as important as the service offer itself.",
  "Participants ask for clearer feedback on how their input changes decisions."
];
const difficultySettings = {
  easy: {
    label: "Easy",
    tokenPool: 10,
    selectionLimit: 4,
    severity: 0.5
  },
  standard: {
    label: "Standard",
    tokenPool: 8,
    selectionLimit: 3,
    severity: 1
  },
  advanced: {
    label: "Advanced",
    tokenPool: 6,
    selectionLimit: 2,
    severity: 1.5
  }
} as const;

const stageGuidance: Record<StageId, string> = {
  understand: "Explore lived experiences, barriers, and missing voices before proposing solutions.",
  imagine: "Describe what a better future experience would look like.",
  create: "Generate and prototype possible solutions.",
  decide: "Prioritize, refine, and test the strongest idea."
};

const resourceIcons: Record<string, string> = {
  "community-trust": "🤝",
  "data-insight": "📊",
  "small-budget": "💰",
  "staff-time": "🕒",
  translation: "🌐",
  "time-to-test": "🧪",
  "venue-access": "📍",
  "digital-tool": "💻"
};

const fieldPrompts = {
  problem: "(What specific problem are people experiencing? Who is affected and why?)",
  insight: "(What important lesson emerged from the evidence, stakeholder discussion, or lived experience?)",
  idea: "(Describe your proposed policy, service, or intervention in 1–2 sentences.)",
  prototype: "(How will the solution work in practice? Describe the main steps from problem to support.)",
  equity: "(Who might still be left out? What change makes the solution more fair and inclusive?)",
  test: "(What small pilot or test would you run before scaling the solution?)",
  measures: "(How will you know the solution is working? List 2–3 indicators or outcomes.)"
} as const;

const fieldPlaceholders = {
  problem: "Example: Families miss follow-up because appointments are hard to reach and instructions are unclear.",
  insight: "Example: Trust improves when people know what will happen after first contact.",
  idea: "Example: Create a trusted community referral route with clear follow-up within 48 hours.",
  prototype: "Example: Community partner identifies need, staff explain options, team books support, follow-up is confirmed.",
  equity: "Example: Add multilingual messages and an offline route for people who cannot use digital forms.",
  test: "Example: Run a four-week pilot with one community partner and 20 participants.",
  measures: "Example: referral completion, waiting time, user confidence, stakeholder approval.",
  policyPitch: "Example: Our proposal improves access by using trusted partners, clear information, and a small pilot that can be measured before scaling."
} as const;

function cleanPrompt(prompt: string) {
  return prompt.replace(/^Output:\s*/i, "");
}

function roleFocus(index: number) {
  return [
    "Everyday impact and lived experience",
    "Feasibility and implementation",
    "Community trust and participation",
    "Governance and accountability",
    "Evidence, data, and outcomes",
    "Equity and inclusion"
  ][index] ?? "Policy delivery perspective";
}

type TrackerStatus = "complete" | "partial" | "pending";

function trackerStatus(done: boolean, partial = false): TrackerStatus {
  return done ? "complete" : partial ? "partial" : "pending";
}

function trackerIcon(status: TrackerStatus) {
  return status === "complete" ? "✅" : status === "partial" ? "🟨" : "⬜";
}

function reviewScore(value: number | undefined) {
  return value ?? 0;
}

function getInitialIssue(issueId: string) {
  return policyIssues.find((issue) => issue.id === issueId) ?? policyIssues[0];
}

function getContext(contextId: string) {
  return contextPacks[contextId as ContextId] ?? contextPacks.qatar;
}

function createInitialState(issueId: string, contextId: ContextId): WorkspaceState {
  return {
    issueId,
    contextId,
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
    team: {
      name: "",
      members: ""
    },
    scores: {
      inclusion: 0,
      feasibility: 0,
      impact: 0,
      equity: 0,
      innovation: 0
    },
    timer: defaultTimer,
    outputs: emptyOutputs,
    assistantOutputs: emptyAssistantOutputs
  };
}

function normalizeState(saved: Partial<WorkspaceState>, issueId: string, contextId: ContextId): WorkspaceState {
  const base = createInitialState(issueId, contextId);

  return {
    ...base,
    ...saved,
    issueId,
    contextId,
    difficulty: saved.difficulty ?? base.difficulty,
    selectedTokens: saved.selectedTokens ?? base.selectedTokens,
    selectedEvidence: saved.selectedEvidence ?? base.selectedEvidence,
    selectedConstraints: saved.selectedConstraints ?? base.selectedConstraints,
    stakeholderVotes: saved.stakeholderVotes ?? base.stakeholderVotes,
    bonusResources: saved.bonusResources ?? base.bonusResources,
    activeChallengeUpdate: saved.activeChallengeUpdate ?? base.activeChallengeUpdate,
    eventHistory: saved.eventHistory ?? base.eventHistory,
    currentEvent: saved.currentEvent ?? base.currentEvent,
    resourceEffects: saved.resourceEffects ?? base.resourceEffects,
    scoreEffects: saved.scoreEffects ?? base.scoreEffects,
    eventQualityTotal: saved.eventQualityTotal ?? base.eventQualityTotal,
    facilitatorActions: saved.facilitatorActions ?? base.facilitatorActions,
    approvalPercentage: saved.approvalPercentage ?? base.approvalPercentage,
    team: {
      ...base.team,
      ...saved.team
    },
    scores: {
      ...base.scores,
      ...saved.scores
    },
    timer: {
      ...base.timer,
      ...saved.timer
    },
    outputs: {
      ...base.outputs,
      ...saved.outputs
    },
    assistantOutputs: {
      ...base.assistantOutputs,
      ...saved.assistantOutputs
    }
  };
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function saveSessionState(state: WorkspaceState) {
  const assessment = calculateSimulationAssessment(state);

  window.localStorage.setItem(storageKey, JSON.stringify(state));
  window.localStorage.setItem("policyquest-selectedEvidence", JSON.stringify(state.selectedEvidence));
  window.localStorage.setItem("policyquest-selectedConstraints", JSON.stringify(state.selectedConstraints));
  window.localStorage.setItem("policyquest-selectedResources", JSON.stringify(state.selectedTokens));
  window.localStorage.setItem("policyquest-finalOutputFields", JSON.stringify(state.outputs));
  window.localStorage.setItem("policyquest-eventHistory", JSON.stringify(state.eventHistory));
  window.localStorage.setItem("policyquest-stakeholderVotes", JSON.stringify(state.stakeholderVotes));
  window.localStorage.setItem("policyquest-scoreDashboard", JSON.stringify(state.scores));
  window.localStorage.setItem("policyquest-difficulty", JSON.stringify(state.difficulty));
  if (assessment.ready) {
    window.localStorage.setItem("policyquest-policyAssessment", JSON.stringify(assessment));
  } else {
    window.localStorage.removeItem("policyquest-policyAssessment");
    window.localStorage.removeItem("policyquest-policyImpactScore");
    window.localStorage.removeItem("policyquest-implementationReadiness");
  }
}

export default function WorkspaceClient({ issueId, contextId }: { issueId: string; contextId: string }) {
  const issue = getInitialIssue(issueId);
  const context = getContext(contextId);
  const issuePack = getIssuePack(context, issue.id);
  const [activeStage, setActiveStage] = useState<StageId>("understand");
  const [eventIndex, setEventIndex] = useState(0);
  const [state, setState] = useState<WorkspaceState>(createInitialState(issue.id, context.id));
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  useEffect(() => {
    setHasLoadedSession(false);
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<WorkspaceState>;
        if (parsed.issueId === issue.id && (parsed.contextId ?? context.id) === context.id) {
          setState(normalizeState(parsed, issue.id, context.id));
          setHasLoadedSession(true);
          return;
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    setState(createInitialState(issue.id, context.id));
    setHasLoadedSession(true);
  }, [context.id, issue.id]);

  useEffect(() => {
    if (!hasLoadedSession) {
      return;
    }

    saveSessionState(state);
  }, [hasLoadedSession, state]);

  useEffect(() => {
    if (!state.timer.running || state.paused || state.timer.remainingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setState((current) => ({
        ...current,
        timer: {
          ...current.timer,
          remainingSeconds: Math.max(0, current.timer.remainingSeconds - 1),
          running: current.timer.remainingSeconds > 1
        }
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.paused, state.timer.remainingSeconds, state.timer.running]);

  const categoryName = categories.find((category) => category.id === issue.category)?.name ?? "Policy";
  const deck = issuePack.events;
  const evidencePack = issuePack.evidence;
  const difficulty = difficultySettings[state.difficulty];
  const resourceEffectTotal = Object.values(state.resourceEffects).reduce((sum, effect) => sum + effect, 0);

  const resourceLimit = difficulty.selectionLimit + state.bonusResources;
  const totalTokenPool = difficulty.tokenPool + state.bonusResources + Math.max(0, resourceEffectTotal);
  const remainingTokens = Math.max(0, totalTokenPool - state.selectedTokens.length);
  const voteValues = Object.values(state.stakeholderVotes);
  const supportCount = voteValues.filter((vote) => vote === "support").length;
  const changesCount = voteValues.filter((vote) => vote === "changes").length;
  const opposeCount = voteValues.filter((vote) => vote === "oppose").length;
  const castVotes = supportCount + changesCount + opposeCount;
  const approvalPercentage = calculateApprovalPercentage(state);
  const assessment = calculateSimulationAssessment(state);
  const activeStageData = stages.find((stage) => stage.id === activeStage) ?? stages[0];
  const currentEvent = state.currentEvent ?? deck[eventIndex];
  const selectedConstraintCards = issuePack.constraints.filter((constraint) => state.selectedConstraints.includes(constraint.id));
  const eventResolved = state.eventHistory.some((event) => event.selectedChoice);
  const finalProposalReady = [
    state.outputs.problem,
    state.outputs.insight,
    state.outputs.idea,
    state.outputs.prototype,
    state.outputs.equity,
    state.outputs.test,
    state.outputs.measures,
    state.outputs.policyPitch
  ].filter((value) => value.trim().length >= 20).length >= 5;
  const trackerItems = [
    ["Evidence Selected", trackerStatus(state.selectedEvidence.length >= 2, state.selectedEvidence.length > 0)],
    ["Resources Allocated", trackerStatus(state.selectedTokens.length > 0)],
    ["Constraint Selected", trackerStatus(state.selectedConstraints.length > 0)],
    ["Event Resolved", trackerStatus(eventResolved, state.eventHistory.length > 0)],
    ["Stakeholder Voting", trackerStatus(castVotes >= Math.min(4, issuePack.stakeholders.length), castVotes > 0)],
    ["Final Proposal", trackerStatus(finalProposalReady, Object.values(state.outputs).some((value) => value.trim().length > 0))]
  ] as const;
  const facilitatorScores = {
    feasibility: assessment.scores?.feasibility ?? state.scores.feasibility,
    equity: assessment.scores?.equity ?? state.scores.equity,
    innovation: reviewScore(state.scores.innovation || assessment.scores?.impact),
    consensus: castVotes > 0 ? Math.max(1, Math.round(approvalPercentage / 20)) : 0
  };

  useEffect(() => {
    if (state.approvalPercentage === approvalPercentage) {
      return;
    }

    setState((current) => ({
      ...current,
      approvalPercentage
    }));
  }, [approvalPercentage, state.approvalPercentage]);

  function effectSummary(choice: EventChoice) {
    const scoreText = Object.entries(choice.scoreEffects)
      .map(([key, value]) => `${value && value > 0 ? "+" : ""}${value} ${key}`)
      .join(", ");
    const resourceText = Object.entries(choice.resourceEffects ?? {})
      .map(([key, value]) => {
        const resourceName = resourceTokens.find((token) => token.id === key)?.name ?? key;
        return `${value && value > 0 ? "+" : ""}${value} ${resourceName}`;
      })
      .join(", ");

    return [scoreText, resourceText].filter(Boolean).join(" | ");
  }

  function toggleToken(tokenId: string) {
    setState((current) => {
      const isSelected = current.selectedTokens.includes(tokenId);
      const currentLimit = difficultySettings[current.difficulty].selectionLimit + current.bonusResources;
      if (!isSelected && current.selectedTokens.length >= currentLimit) {
        return current;
      }

      const selected = current.selectedTokens.includes(tokenId)
        ? current.selectedTokens.filter((item) => item !== tokenId)
        : [...current.selectedTokens, tokenId];

      return { ...current, selectedTokens: selected };
    });
  }

  function updateOutput(field: keyof WorkspaceState["outputs"], value: string) {
    setState((current) => ({
      ...current,
      outputs: {
        ...current.outputs,
        [field]: value
      }
    }));
  }

  function toggleEvidence(evidenceId: string) {
    setState((current) => ({
      ...current,
      selectedEvidence: current.selectedEvidence.includes(evidenceId)
        ? current.selectedEvidence.filter((id) => id !== evidenceId)
        : [...current.selectedEvidence, evidenceId]
    }));
  }

  function toggleConstraint(constraintId: string) {
    setState((current) => ({
      ...current,
      selectedConstraints: current.selectedConstraints.includes(constraintId)
        ? current.selectedConstraints.filter((id) => id !== constraintId)
        : [...current.selectedConstraints, constraintId]
    }));
  }

  function updateStakeholderVote(stakeholder: string, vote: WorkspaceState["stakeholderVotes"][string]) {
    setState((current) => ({
      ...current,
      stakeholderVotes: {
        ...current.stakeholderVotes,
        [stakeholder]: vote
      }
    }));
  }

  function drawEvent() {
    const nextIndex = Math.floor(Math.random() * deck.length);
    const card = deck[nextIndex];
    setEventIndex(nextIndex);
    setState((current) => ({
      ...current,
      currentEvent: card,
      eventHistory: [
        {
          ...card,
          drawnAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        },
        ...current.eventHistory
      ].slice(0, 12)
    }));
  }

  function scaleEffect(value: number) {
    if (value >= 0) {
      return value;
    }

    return Math.min(-1, Math.floor(value * difficultySettings[state.difficulty].severity));
  }

  function clampScore(value: number) {
    return Math.max(1, Math.min(5, value));
  }

  function chooseEventOption(choice: EventChoice) {
    setState((current) => {
      const activeEvent = current.currentEvent ?? deck[eventIndex];
      const [latestEvent, ...rest] = current.eventHistory;
      const latestMatchesActive = latestEvent?.title === activeEvent.title;
      if (latestMatchesActive && latestEvent.selectedChoice) {
        return current;
      }

      const scoreEffects = Object.fromEntries(
        Object.entries(choice.scoreEffects).map(([key, value]) => [key, scaleEffect(value ?? 0)])
      ) as Partial<Record<ScoreKey, number>>;
      const nextScores = { ...current.scores };

      Object.entries(scoreEffects).forEach(([key, value]) => {
        nextScores[key as ScoreKey] = clampScore(nextScores[key as ScoreKey] + (value ?? 0));
      });

      const nextResourceEffects = { ...current.resourceEffects };
      Object.entries(choice.resourceEffects ?? {}).forEach(([key, value]) => {
        nextResourceEffects[key] = (nextResourceEffects[key] ?? 0) + scaleEffect(value ?? 0);
      });

      const recordedEvent = latestMatchesActive
        ? latestEvent
        : {
            ...activeEvent,
            drawnAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
      const remainingHistory = latestMatchesActive ? rest : current.eventHistory;

      return {
        ...current,
        currentEvent: activeEvent,
        scores: nextScores,
        scoreEffects: {
          ...current.scoreEffects,
          ...scoreEffects
        },
        resourceEffects: nextResourceEffects,
        eventQualityTotal: current.eventQualityTotal + choice.quality,
        eventHistory: recordedEvent
          ? [
              {
                ...recordedEvent,
                selectedChoice: choice
              },
              ...remainingHistory
            ]
          : current.eventHistory
      };
    });
  }

  function updateTeam(field: keyof WorkspaceState["team"], value: string) {
    setState((current) => ({
      ...current,
      team: {
        ...current.team,
        [field]: value
      }
    }));
  }

  function setTimerMode(mode: 60 | 90 | 120) {
    setState((current) => ({
      ...current,
      timer: {
        mode,
        remainingSeconds: mode * 60,
        running: false
      }
    }));
  }

  function setDifficulty(nextDifficulty: WorkspaceState["difficulty"]) {
    const setting = difficultySettings[nextDifficulty];
    setState((current) => ({
      ...current,
      difficulty: nextDifficulty,
      selectedTokens: current.selectedTokens.slice(0, setting.selectionLimit + current.bonusResources),
      scores: {
        inclusion: 0,
        feasibility: 0,
        impact: 0,
        equity: 0,
        innovation: 0
      },
      scoreEffects: {},
      resourceEffects: {},
      eventQualityTotal: 0
    }));
  }

  function toggleTimer() {
    setState((current) => ({
      ...current,
      paused: false,
      timer: {
        ...current.timer,
        running: !current.timer.running
      }
    }));
  }

  function resetTimer() {
    setState((current) => ({
      ...current,
      timer: {
        ...current.timer,
        remainingSeconds: current.timer.mode * 60,
        running: false
      }
    }));
  }

  function addBonusResource() {
    setState((current) => ({
      ...current,
      bonusResources: current.bonusResources + 1,
      facilitatorActions: current.facilitatorActions + 1
    }));
  }

  function removeResource() {
    setState((current) => ({
      ...current,
      selectedTokens: current.selectedTokens.slice(0, -1),
      bonusResources: Math.max(0, current.bonusResources - 1),
      facilitatorActions: current.facilitatorActions + 1
    }));
  }

  function togglePause() {
    setState((current) => ({
      ...current,
      paused: !current.paused,
      timer: {
        ...current.timer,
        running: current.paused ? current.timer.running : false
      }
    }));
  }

  function revealChallengeUpdate() {
    const update = challengeUpdates[Math.floor(Math.random() * challengeUpdates.length)];
    setState((current) => ({
      ...current,
      activeChallengeUpdate: update,
      facilitatorActions: current.facilitatorActions + 1
    }));
  }

  function resetSession() {
    if (!window.confirm("Reset this PolicyQuest session? This clears team details, events, resources, scores, timer, and written outputs for this issue.")) {
      return;
    }

    const nextState = createInitialState(issue.id, context.id);
    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    setActiveStage("understand");
    setEventIndex(0);
    setState(nextState);
  }

  function persistAndDebugBeforeFinal() {
    saveSessionState(state);
  }

  return (
    <main>
      <header className="workspaceHeader">
        <div>
          <Link className="backLink" href="/select">
            Change issue
          </Link>
          <p className="eyebrow">{context.name} context · {categoryName}</p>
          <h1>{issue.title}</h1>
          <p>{issue.challenge}</p>
          {state.activeChallengeUpdate ? (
            <div className="challengeUpdate">
              <strong>Challenge update</strong>
              <span>{state.activeChallengeUpdate}</span>
            </div>
          ) : null}
        </div>
        <Link className="button primary" href="/final" onClick={persistAndDebugBeforeFinal}>
          Build final output
        </Link>
      </header>

      {state.paused ? <div className="pauseBanner">Activity paused by facilitator</div> : null}

      <section className="workspaceLayout workspaceLayoutV2">
        <aside className="sideRail referencePanel">
          <div className="railBlock">
            <p className="eyebrow">Reference area</p>
            <h2>Team Setup</h2>
            <label className="compactLabel">
              Team name
              <input
                className="textInput"
                value={state.team.name}
                onChange={(event) => updateTeam("name", event.target.value)}
                placeholder="Enter team name"
              />
            </label>
            <label className="compactLabel">
              Team members
              <textarea
                className="smallTextarea"
                value={state.team.members}
                onChange={(event) => updateTeam("members", event.target.value)}
                placeholder="Names or roles"
              />
            </label>
          </div>

          <div className="railBlock">
            <p className="eyebrow">Timer</p>
            <div className="timerDisplay">{formatTime(state.timer.remainingSeconds)}</div>
            <div className="timerModes">
              {[60, 90, 120].map((mode) => (
                <button
                  className={state.timer.mode === mode ? "filter active" : "filter"}
                  key={mode}
                  onClick={() => setTimerMode(mode as 60 | 90 | 120)}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="buttonRow">
              <button className="button dark" onClick={toggleTimer}>
                {state.timer.running ? "Stop" : "Start"}
              </button>
              <button className="button light" onClick={resetTimer}>
                Reset
              </button>
            </div>
          </div>

          <section className="railBlock">
            <p className="eyebrow">Stakeholder panel</p>
            <h2>Assigned Stakeholders</h2>
            <div className="stakeholderFocusList">
              {issuePack.stakeholders.map((card, index) => (
                <article key={card.title}>
                  <strong>{card.title}</strong>
                  <span>Focus: {roleFocus(index)}</span>
                </article>
              ))}
            </div>
            <div className="stakeholderVotingArea">
              <div className="sectionHead compact">
                <p className="eyebrow">Stakeholder engagement</p>
                <h3>Private stakeholder ballots</h3>
                <p className="ruleText">
                  Record each vote from the confidential role perspective.
                </p>
              </div>
              <div className="voteGrid compactVoteGrid">
                {issuePack.stakeholders.map((stakeholder) => (
                  <div className="voteCard" key={stakeholder.title}>
                    <strong>{stakeholder.title}</strong>
                    <span className="privateVoteStatus">
                      {state.stakeholderVotes[stakeholder.title] ? "Vote submitted" : "Awaiting vote"}
                    </span>
                    <div className="voteButtons">
                      {[
                        ["support", "Support"],
                        ["changes", "Support with Changes"],
                        ["oppose", "Oppose"]
                      ].map(([value, label]) => (
                        <button
                          className={state.stakeholderVotes[stakeholder.title] === value ? "filter active" : "filter"}
                          key={value}
                          onClick={() => updateStakeholderVote(stakeholder.title, value as WorkspaceState["stakeholderVotes"][string])}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {castVotes === issuePack.stakeholders.length ? (
                <div className="voteSummary compactVoteSummary">
                  <div><strong>{supportCount}</strong><span>Support</span></div>
                  <div><strong>{changesCount}</strong><span>Changes</span></div>
                  <div><strong>{opposeCount}</strong><span>Oppose</span></div>
                  <div><strong>{approvalPercentage}%</strong><span>Approval</span></div>
                </div>
              ) : (
                <p className="mutedText">Summary appears after all {issuePack.stakeholders.length} votes are submitted.</p>
              )}
              {castVotes === issuePack.stakeholders.length && approvalPercentage < 70 ? (
                <p className="warningText">Revise proposal before implementation.</p>
              ) : null}
            </div>
          </section>

          <section className="railBlock wisdomSection">
            <div className="sectionHead compact">
              <p className="eyebrow">🧠 Co-Design Principles</p>
              <p className="ruleText">
                Use these reminders throughout the activity to challenge assumptions and improve your decisions.
              </p>
            </div>
            <div className="wisdomStack">
              {wisdomCards.map((card) => (
                <article className="wisdomItem guidanceCard" key={card.title}>
                  <strong>{card.title}</strong>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>

        <section className="workspaceMain mainWorkPanel">
          <div className="processBand processBandV2">
            {stages.map((stage, index) => (
              <button
                className={activeStage === stage.id ? "processStep active" : "processStep"}
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
              >
                <span>Stage {index + 1}</span>
                {stage.title}
              </button>
            ))}
          </div>

          <section className="contentBlock stageWorkBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Stage workspace</p>
              <h2>{activeStageData.title}</h2>
              <p className="ruleText">{stageGuidance[activeStage]}</p>
            </div>
            <div className="cardsGrid activityGridV2">
              {activityCards[activeStage].map((card) => (
                <article className="toolCard activity activityCardV2" key={card.title}>
                  <h3>{card.title}</h3>
                  <div>
                    <span>Question</span>
                    <p>{card.text}</p>
                  </div>
                  <div>
                    <span>Expected Output</span>
                    <strong>{cleanPrompt(card.prompt)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Resource Tokens</p>
              <h2>Allocate limited resources.</h2>
              <p className="ruleText">
                Allocate up to {resourceLimit}. Remaining tokens: <strong>{remainingTokens}</strong>
              </p>
            </div>
            <div className="tokenGrid resourceTokenGrid centerResourceGrid">
              {resourceTokens.map((token) => (
                <button
                  className={state.selectedTokens.includes(token.id) ? "token active resourceToken" : "token resourceToken"}
                  disabled={!state.selectedTokens.includes(token.id) && state.selectedTokens.length >= resourceLimit}
                  key={token.id}
                  onClick={() => toggleToken(token.id)}
                >
                  <span>{resourceIcons[token.id] ?? "•"}</span>
                  <strong>{token.name}</strong>
                  <small>{token.description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Evidence Pack</p>
              <h2>Select evidence for the proposal.</h2>
              <p className="ruleText">Selected evidence: <strong>{state.selectedEvidence.length}</strong>/2 minimum</p>
            </div>
            <div className="evidenceGrid centerEvidenceGrid">
              {evidencePack.map((evidence) => (
                <button
                  className={state.selectedEvidence.includes(evidence.id) ? "evidenceCard active evidenceCardV2" : "evidenceCard evidenceCardV2"}
                  key={evidence.id}
                  onClick={() => toggleEvidence(evidence.id)}
                >
                  <span>{evidence.type}</span>
                  <strong>{evidence.sourceTitle}</strong>
                  <p><b>Key Insight:</b> {evidence.finding}</p>
                  <small><b>Why It Matters:</b> {evidence.implication}</small>
                  <small>{evidence.sourceOrganisation} · {evidence.sourceYear}</small>
                  {state.selectedEvidence.includes(evidence.id) ? <em>✓ Selected</em> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Constraints</p>
              <h2>Select constraints your plan must address.</h2>
            </div>
            <div className="constraintGrid centerConstraintGrid">
              {issuePack.constraints.map((constraint) => (
                <button
                  className={state.selectedConstraints.includes(constraint.id) ? "constraintCard active" : "constraintCard"}
                  key={constraint.id}
                  onClick={() => toggleConstraint(constraint.id)}
                >
                  <strong>{constraint.title}</strong>
                  <p>{constraint.description}</p>
                  <span>{constraint.impact}</span>
                  <small>{constraint.response}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Final proposal</p>
              <h2>Build your final output as you go.</h2>
            </div>
            <div className="notesGrid finalOutputGrid">
              <label>
                Access problem
                <span className="fieldPrompt">{fieldPrompts.problem}</span>
                <textarea value={state.outputs.problem} onChange={(event) => updateOutput("problem", event.target.value)} />
              </label>
              <label>
                Key insight
                <span className="fieldPrompt">{fieldPrompts.insight}</span>
                <textarea value={state.outputs.insight} onChange={(event) => updateOutput("insight", event.target.value)} />
              </label>
              <label>
                Service improvement idea
                <span className="fieldPrompt">{fieldPrompts.idea}</span>
                <textarea value={state.outputs.idea} onChange={(event) => updateOutput("idea", event.target.value)} />
              </label>
              <label>
                Prototype or journey
                <span className="fieldPrompt">{fieldPrompts.prototype}</span>
                <textarea value={state.outputs.prototype} onChange={(event) => updateOutput("prototype", event.target.value)} />
              </label>
              <label>
                Equity adjustment
                <span className="fieldPrompt">{fieldPrompts.equity}</span>
                <textarea value={state.outputs.equity} onChange={(event) => updateOutput("equity", event.target.value)} />
              </label>
              <label>
                First test
                <span className="fieldPrompt">{fieldPrompts.test}</span>
                <textarea value={state.outputs.test} onChange={(event) => updateOutput("test", event.target.value)} />
              </label>
              <label className="wide">
                Success measures
                <span className="fieldPrompt">{fieldPrompts.measures}</span>
                <textarea value={state.outputs.measures} onChange={(event) => updateOutput("measures", event.target.value)} />
              </label>
            </div>
          </section>

          <section className="contentBlock pitchBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Policy Pitch</p>
              <h2>Decision-maker summary.</h2>
              <p className="ruleText">In 100 words or less, convince decision-makers to support your proposal.</p>
            </div>
            <textarea
              className="pitchTextarea"
              placeholder={fieldPlaceholders.policyPitch}
              value={state.outputs.policyPitch}
              onChange={(event) => updateOutput("policyPitch", event.target.value)}
            />
            <Link className="button primary full" href="/final" onClick={persistAndDebugBeforeFinal}>
              Submit proposal
            </Link>
          </section>

          <section className="contentBlock aiReviewBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">🤖 AI Facilitator Review</p>
              <h2>{assessment.ready ? "Review generated from team decisions." : "Review pending."}</h2>
              <p className="ruleText">
                Feedback is based on selected evidence, resources, constraints, event responses, stakeholder votes, and final proposal text.
              </p>
            </div>
            {assessment.ready && assessment.scores ? (
              <>
                <div className="reviewGrid">
                  <article><strong>Strengths</strong><p>{assessment.strengths.join("; ")}</p></article>
                  <article><strong>Potential Risks</strong><p>{assessment.improvements.join("; ")}</p></article>
                  <article><strong>Equity Considerations</strong><p>{state.outputs.equity || "Add a specific adjustment for groups still at risk of exclusion."}</p></article>
                  <article><strong>Implementation Challenges</strong><p>{selectedConstraintCards.map((constraint) => constraint.title).join(", ") || "Select at least one constraint to test feasibility."}</p></article>
                  <article className="wide"><strong>Overall Assessment</strong><p>{assessment.message} Overall policy score: {assessment.overall}/25.</p></article>
                </div>
                <div className="scoreDashboard reviewScores">
                  <div className="scoreControl staticScore"><span>Feasibility</span><strong>{facilitatorScores.feasibility}/5</strong></div>
                  <div className="scoreControl staticScore"><span>Equity</span><strong>{facilitatorScores.equity}/5</strong></div>
                  <div className="scoreControl staticScore"><span>Innovation</span><strong>{facilitatorScores.innovation}/5</strong></div>
                  <div className="scoreControl staticScore"><span>Stakeholder Consensus</span><strong>{facilitatorScores.consensus}/5</strong></div>
                </div>
              </>
            ) : (
              <div className="assessmentPending">
                <strong>Not yet assessed</strong>
                <span>Complete the policy simulation to generate feedback.</span>
                <div className="miniList">
                  {assessment.missing.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            )}
          </section>
        </section>

        <aside className="decisionPanel">
          <section className="railBlock trackerBlock">
            <p className="eyebrow">Policy Completion</p>
            <div className="completionList">
              {trackerItems.map(([label, status]) => (
                <div className={status} key={label}>
                  <span>{trackerIcon(status)}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="railBlock eventSupportBlock">
            <p className="eyebrow">⚠ POLICY EVENT</p>
            <h2>{currentEvent.title}</h2>
            <span className="eventCategory">{currentEvent.category ?? "Policy Event"}</span>
            <p>{currentEvent.description}</p>
            <strong>Impact statement: {currentEvent.consequence}</strong>
            <p className="ruleText">What will your team do?</p>
            <div className="choiceStack">
              {currentEvent.choices.map((choice) => (
                <button className="choiceButton" key={choice.id} onClick={() => chooseEventOption(choice)}>
                  <strong>{choice.id.toUpperCase()}. {choice.label}</strong>
                  <span>{choice.consequence}</span>
                  <small>Impact: {effectSummary(choice)}</small>
                </button>
              ))}
            </div>
            <button className="button dark full" onClick={drawEvent}>
              Draw random event
            </button>
          </section>

          <section className="railBlock">
            <p className="eyebrow">Facilitator controls</p>
            <div className="difficultyGrid">
              {Object.entries(difficultySettings).map(([key, setting]) => (
                <button
                  className={state.difficulty === key ? "filter active" : "filter"}
                  key={key}
                  onClick={() => setDifficulty(key as WorkspaceState["difficulty"])}
                >
                  {setting.label}
                </button>
              ))}
            </div>
            <p className="mutedText">{difficulty.tokenPool} tokens and {difficulty.selectionLimit} selectable resources.</p>
            <button className="button light full" onClick={addBonusResource}>Add bonus resource</button>
            <button className="button light full" onClick={removeResource}>Remove resource</button>
            <button className="button light full" onClick={togglePause}>{state.paused ? "Resume activity" : "Pause activity"}</button>
            <button className="button light full" onClick={revealChallengeUpdate}>Reveal challenge update</button>
            <Link className="button light full" href={`/guide?issue=${issue.id}&context=${context.id}`}>Facilitator guide</Link>
            <button className="button light full dangerButton" onClick={resetSession}>Reset session</button>
          </section>
        </aside>
      </section>
    </main>
  );
}
