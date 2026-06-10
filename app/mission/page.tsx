import Link from "next/link";
import { contextPacks, getMissionBrief, policyIssues, type ContextId } from "../data";

function getIssue(issueId?: string) {
  return policyIssues.find((issue) => issue.id === issueId) ?? policyIssues[0];
}

function getContext(contextId?: string) {
  return contextPacks[contextId as ContextId] ?? contextPacks.qatar;
}

export default async function MissionPage({
  searchParams
}: {
  searchParams: Promise<{ issue?: string; context?: string }>;
}) {
  const params = await searchParams;
  const issue = getIssue(params.issue);
  const context = getContext(params.context);

  return (
    <main>
      <header className="pageHeader">
        <Link className="backLink" href={`/roles?issue=${issue.id}&context=${context.id}`}>
          Back to roles
        </Link>
        <div>
          <p className="eyebrow">Mission brief</p>
          <h1>{issue.title}</h1>
          <p>{context.name} context</p>
        </div>
      </header>

      <section className="outputSheet missionSheet">
        <div className="outputTitle">
          <p className="eyebrow">Policy mission</p>
          <h2>{getMissionBrief(context.name, issue.title)}</h2>
          <p>Your team must negotiate evidence, constraints, stakeholder interests, and implementation trade-offs to produce a feasible, equitable, evidence-informed pilot proposal.</p>
        </div>

        <div className="outputGrid">
          <article><span>Context</span><h3>{context.name}</h3><p>{context.description}</p></article>
          <article><span>Policy issue</span><h3>{issue.title}</h3><p>{issue.challenge}</p></article>
          <article><span>Team size</span><h3>4-6 students</h3><p>One shared screen, one facilitator, one team working together.</p></article>
          <article><span>Session duration</span><h3>60-120 minutes</h3><p>Use the timer modes in the workspace to match seminar or workshop length.</p></article>
        </div>

        <div className="outputPanel">
          <h3>You have</h3>
          <div className="miniList">
            <span>Limited resources</span>
            <span>Real-world constraints</span>
            <span>Stakeholder interests</span>
            <span>Evidence to review</span>
          </div>
        </div>

        <div className="outputPanel">
          <h3>Final deliverables</h3>
          <div className="miniList">
            <span>Service improvement proposal</span>
            <span>Evidence-based policy brief</span>
            <span>Traceable policy assessment</span>
            <span>3-minute cabinet pitch</span>
          </div>
        </div>

        <Link className="button primary full" href={`/workspace?issue=${issue.id}&context=${context.id}`}>
          START POLICY MISSION
        </Link>
      </section>
    </main>
  );
}
