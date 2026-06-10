import Link from "next/link";
import { activityCards, contextPacks, getIssuePack, policyIssues, stages, type ContextId } from "../data";
import PrintButton from "./PrintButton";

function getIssue(issueId?: string) {
  return policyIssues.find((issue) => issue.id === issueId) ?? policyIssues[0];
}

function getContext(contextId?: string) {
  return contextPacks[contextId as ContextId] ?? contextPacks.qatar;
}

export default async function GuidePage({
  searchParams
}: {
  searchParams: Promise<{ issue?: string; context?: string }>;
}) {
  const params = await searchParams;
  const issue = getIssue(params.issue);
  const context = getContext(params.context);
  const issuePack = getIssuePack(context, issue.id);
  const deck = issuePack.events;
  const evidencePack = issuePack.evidence;

  return (
    <main>
      <header className="pageHeader finalHeader">
        <Link className="backLink" href={`/workspace?issue=${issue.id}&context=${context.id}`}>
          Back to workspace
        </Link>
        <div>
          <p className="eyebrow">Printable facilitator guide</p>
          <h1>{issue.title}</h1>
          <p>{context.name} · {issue.challenge}</p>
        </div>
        <PrintButton />
      </header>

      <section className="outputSheet guideSheet">
        <div className="outputTitle">
          <p className="eyebrow">Session setup</p>
          <h2>PolicyQuest classroom simulation guide</h2>
          <p>{issue.brief}</p>
        </div>

        <div className="outputGrid">
          <article>
            <span>Setup</span>
            <h3>Before class</h3>
            <p>Use groups of 5-6. Ask each team to choose a name, select a difficulty, and assign stakeholder roles. Keep the facilitator panel visible for events and challenge updates.</p>
          </article>
          <article>
            <span>Timing</span>
            <h3>Suggested timing</h3>
            <p>60 minutes: one card per stage. 90 minutes: two cards in Understand and Create. 120 minutes: add event discussion, scoring review, and peer feedback.</p>
          </article>
          <article>
            <span>Roles</span>
            <h3>Stakeholder roles</h3>
            <p>{issuePack.stakeholders.map((card) => card.title).join(", ")}.</p>
          </article>
          <article>
            <span>Flow</span>
            <h3>Activity flow</h3>
            <p>{stages.map((stage) => stage.title).join(" -> ")}. Teams should keep notes in the workspace after each stage.</p>
          </article>
        </div>

        <div className="outputPanel">
          <h3>Activity prompts</h3>
          <div className="reportHistory">
            {stages.map((stage) => (
              <div key={stage.id}>
                <strong>{stage.title}</strong>
                <span>{activityCards[stage.id].map((card) => card.title).join(", ")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="outputPanel">
          <h3>Event instructions</h3>
          <p>Draw an event when teams finish a stage, when energy dips, or when you want to force a policy trade-off. Ask teams to choose A, B, or C and explain why. The app applies score and resource effects automatically.</p>
          <div className="reportHistory">
            {deck.slice(0, 5).map((event) => (
              <div key={event.title}>
                <strong>{event.title}</strong>
                <span>{event.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="outputPanel">
          <h3>Evidence and constraints</h3>
          <div className="reportHistory">
            {evidencePack.slice(0, 5).map((evidence) => (
              <div key={evidence.id}>
                <strong>{evidence.title}</strong>
                <span>{evidence.sourceOrganisation} - {evidence.sourceTitle} ({evidence.sourceYear})</span>
              </div>
            ))}
            {issuePack.constraints.map((constraint) => (
              <div key={constraint.id}>
                <strong>{constraint.title}</strong>
                <span>{constraint.response}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="outputPanel">
          <h3>Debrief questions</h3>
          <div className="reportHistory">
            {[...issuePack.reflectionPrompts.learning, ...issuePack.reflectionPrompts.debrief].map((prompt) => (
              <div key={prompt}>
                <span>{prompt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="outputPanel">
          <h3>Scoring interpretation</h3>
          <p>Emerging Idea means the concept needs sharper evidence or feasibility. Feasible Pilot means it can be tested but may need stronger inclusion. Strong Co-Design Plan means the idea balances lived experience and delivery. Policy Champion means the team has a credible, inclusive, testable plan with strong event responses.</p>
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
      </section>
    </main>
  );
}
