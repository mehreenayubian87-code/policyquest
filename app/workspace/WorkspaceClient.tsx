"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  const categoryName = useMemo(
    () => categories.find((category) => category.id === issue.category)?.name ?? "Policy",
    [issue.category]
  );
  const deck = issuePack.events;
  const evidencePack = issuePack.evidence;
  const difficulty = difficultySettings[state.difficulty];
  const selectedResourceBonus = state.selectedTokens.length;
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
    console.log("PolicyQuest saved session before final output:", state);
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

      <section className="workspaceLayout">
        <aside className="sideRail">
          <div className="railBlock">
            <p className="eyebrow">Team identity</p>
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
            <p className="eyebrow">Countdown timer</p>
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

          <div className="railBlock">
            <p className="eyebrow">Difficulty</p>
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
            <p className="mutedText">
              {difficulty.tokenPool} resource tokens and {difficulty.selectionLimit} selectable resources.
            </p>
          </div>

          <div className="railBlock">
            <p className="eyebrow">Co-design stages</p>
            {stages.map((stage) => (
              <button
                className={activeStage === stage.id ? "stageTab active" : "stageTab"}
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
              >
                <strong>{stage.title}</strong>
                <span>{stage.short}</span>
              </button>
            ))}
          </div>
          <div className="railBlock">
            <p className="eyebrow">Less-heard groups</p>
            <div className="miniList vertical">
              {issue.lessHeardGroups.map((group) => (
                <span key={group}>{group}</span>
              ))}
            </div>
          </div>

          <div className="railBlock facilitatorPanel">
            <p className="eyebrow">Facilitator mode</p>
            <button className="button dark full" onClick={drawEvent}>
              Trigger event card
            </button>
            <button className="button light full" onClick={addBonusResource}>
              Add bonus resource
            </button>
            <button className="button light full" onClick={removeResource}>
              Remove resource
            </button>
            <button className="button light full" onClick={togglePause}>
              {state.paused ? "Resume activity" : "Pause activity"}
            </button>
            <button className="button light full" onClick={revealChallengeUpdate}>
              Reveal challenge update
            </button>
            <Link className="button light full" href={`/guide?issue=${issue.id}&context=${context.id}`}>
              Facilitator guide
            </Link>
            <button className="button light full dangerButton" onClick={resetSession}>
              Reset session
            </button>
          </div>
        </aside>

        <section className="workspaceMain">
          <div className="processBand">
            {stages.map((stage, index) => (
              <button
                className={activeStage === stage.id ? "processStep active" : "processStep"}
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
              >
                <span>0{index + 1}</span>
                {stage.title}
              </button>
            ))}
          </div>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">{stages.find((stage) => stage.id === activeStage)?.short}</p>
              <h2>{stages.find((stage) => stage.id === activeStage)?.title}</h2>
            </div>
            <div className="cardsGrid">
              {activityCards[activeStage].map((card) => (
                <article className="toolCard activity" key={card.title}>
                  <span>Activity card</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <strong>{card.prompt}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="contentBlock split">
            <div>
              <div className="sectionHead compact">
                <p className="eyebrow">Stakeholders</p>
                <h2>Assigned Stakeholders</h2>
              </div>
              <div className="assignedStakeholderList">
                {issuePack.stakeholders.map((card) => (
                  <div key={card.title}>
                    <strong>{card.title}</strong>
                    <span>Assigned</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="sectionHead compact">
                <p className="eyebrow">Reality check</p>
                <h2>Event card</h2>
              </div>
              <article className="eventCard">
                <span>Trigger</span>
                <h3>{(state.currentEvent ?? deck[eventIndex]).title}</h3>
                <p>{(state.currentEvent ?? deck[eventIndex]).description}</p>
                <strong>{(state.currentEvent ?? deck[eventIndex]).consequence}</strong>
                <div className="choiceStack">
                  {(state.currentEvent ?? deck[eventIndex]).choices.map((choice) => (
                    <button className="choiceButton" key={choice.id} onClick={() => chooseEventOption(choice)}>
                      <strong>{choice.id.toUpperCase()}. {choice.label}</strong>
                      <span>{choice.consequence}</span>
                      <small>{effectSummary(choice)}</small>
                    </button>
                  ))}
                </div>
                <button className="button dark full" onClick={drawEvent}>
                  Draw next event
                </button>
              </article>
              <div className="eventHistory">
                <h3>Event history</h3>
                {state.eventHistory.length > 0 ? (
                  state.eventHistory.map((event, index) => (
                    <div className="historyItem" key={`${event.title}-${event.drawnAt}-${index}`}>
                      <strong>{event.title}</strong>
                      <span>{event.drawnAt}</span>
                      <p>{event.selectedChoice ? `Choice: ${event.selectedChoice.label}` : event.consequence}</p>
                    </div>
                  ))
                ) : (
                  <p className="mutedText">No events drawn yet.</p>
                )}
              </div>
              <div className="wisdomStack">
                {wisdomCards.map((card) => (
                  <article className="wisdomItem" key={card.title}>
                    <strong>{card.title}</strong>
                    <p>{card.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Resources</p>
              <h2>Choose the tokens your solution needs.</h2>
              <p className="ruleText">
                Teams start with {difficulty.tokenPool} tokens and can select up to {resourceLimit} resources.
                Remaining tokens: <strong>{remainingTokens}</strong>
              </p>
            </div>
            <div className="tokenGrid">
              {resourceTokens.map((token) => (
                <button
                  className={state.selectedTokens.includes(token.id) ? "token active" : "token"}
                  disabled={!state.selectedTokens.includes(token.id) && state.selectedTokens.length >= resourceLimit}
                  key={token.id}
                  onClick={() => toggleToken(token.id)}
                >
                  <strong>{token.name}</strong>
                  <span>{token.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Evidence pack</p>
              <h2>Select at least two evidence cards before finalizing.</h2>
              <p className="ruleText">
                Selected evidence: <strong>{state.selectedEvidence.length}</strong>/2 minimum
              </p>
            </div>
            <div className="evidenceGrid">
              {evidencePack.map((evidence) => (
                <button
                  className={state.selectedEvidence.includes(evidence.id) ? "evidenceCard active" : "evidenceCard"}
                  key={evidence.id}
                  onClick={() => toggleEvidence(evidence.id)}
                >
                  <span>{evidence.type}</span>
                  <strong>{evidence.title}</strong>
                  <p>{evidence.finding}</p>
                  <small>{evidence.implication}</small>
                  <small>Source Organisation: {evidence.sourceOrganisation}</small>
                  <small>Document Title: {evidence.sourceTitle}</small>
                  <small>Year: {evidence.sourceYear}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Constraint cards</p>
              <h2>Select constraints your plan must address.</h2>
            </div>
            <div className="constraintGrid">
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
              <p className="eyebrow">Stakeholder voting</p>
              <h2>Private stakeholder ballots.</h2>
              <p className="ruleText">
                Each stakeholder votes from their confidential role perspective. The facilitator records ballots here.
                Results appear after all votes are submitted.
              </p>
            </div>
            <div className="voteGrid">
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
              <div className="voteSummary">
                <div><strong>{supportCount}</strong><span>Support</span></div>
                <div><strong>{changesCount}</strong><span>Support with changes</span></div>
                <div><strong>{opposeCount}</strong><span>Oppose</span></div>
                <div><strong>{approvalPercentage}%</strong><span>Approval Rate</span></div>
              </div>
            ) : (
              <p className="mutedText">Stakeholder Support Summary will appear after all {issuePack.stakeholders.length} votes are submitted.</p>
            )}
            {castVotes === issuePack.stakeholders.length && approvalPercentage < 70 ? (
              <p className="warningText">Revise proposal before implementation.</p>
            ) : null}
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Assessment dashboard</p>
              <h2>Policy assessment status.</h2>
              <p className="ruleText">
                Scores are generated only after evidence, resources, event responses, stakeholder voting, and final outputs are recorded.
              </p>
            </div>
            {assessment.ready && assessment.scores ? (
              <>
                <div className="scoreDashboard">
                  {Object.entries(assessment.scores).map(([key, score]) => (
                    <div className="scoreControl staticScore" key={key}>
                      <span>{key}</span>
                      <strong>{score}/5</strong>
                    </div>
                  ))}
                  <div className="totalScore">
                    <span>Overall Policy Score</span>
                    <strong>{assessment.overall}/25</strong>
                  </div>
                </div>
                <div className="readinessFeedback">
                  <h3>Why did we get this score?</h3>
                  <div className="feedbackGrid">
                    {assessment.trace.map((item) => (
                      <div className="feedbackItem met" key={item.label}>
                        <strong>{item.label}</strong>
                        <span>{item.evidence}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="assessmentPending">
                <strong>Not yet assessed</strong>
                <span>Awaiting team decisions</span>
                <p>Complete the simulation to generate results.</p>
                <small>{assessment.message}</small>
                <div className="miniList">
                  {assessment.missing.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            )}
          </section>

          <section className="contentBlock">
            <div className="sectionHead compact">
              <p className="eyebrow">Group notes</p>
              <h2>Build your final output as you go.</h2>
            </div>
            <div className="notesGrid">
              <label>
                Access problem
                <textarea value={state.outputs.problem} onChange={(event) => updateOutput("problem", event.target.value)} />
              </label>
              <label>
                Key insight
                <textarea value={state.outputs.insight} onChange={(event) => updateOutput("insight", event.target.value)} />
              </label>
              <label>
                Service improvement idea
                <textarea value={state.outputs.idea} onChange={(event) => updateOutput("idea", event.target.value)} />
              </label>
              <label>
                Prototype or journey
                <textarea value={state.outputs.prototype} onChange={(event) => updateOutput("prototype", event.target.value)} />
              </label>
              <label>
                Equity adjustment
                <textarea value={state.outputs.equity} onChange={(event) => updateOutput("equity", event.target.value)} />
              </label>
              <label>
                First test
                <textarea value={state.outputs.test} onChange={(event) => updateOutput("test", event.target.value)} />
              </label>
              <label className="wide">
                Success measures
                <textarea value={state.outputs.measures} onChange={(event) => updateOutput("measures", event.target.value)} />
              </label>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
