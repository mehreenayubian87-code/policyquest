import Link from "next/link";
import { contextPacks, getIssuePack, policyIssues, type ContextId } from "../../../data";

function getIssue(issueId?: string) {
  return policyIssues.find((issue) => issue.id === issueId) ?? policyIssues[0];
}

function getContext(contextId?: string) {
  return contextPacks[contextId as ContextId] ?? contextPacks.qatar;
}

export default async function PrivateRolePage({
  params,
  searchParams
}: {
  params: Promise<{ sessionId: string; roleId: string }>;
  searchParams: Promise<{ issue?: string; context?: string }>;
}) {
  const routeParams = await params;
  const query = await searchParams;
  const issue = getIssue(query.issue);
  const context = getContext(query.context);
  const issuePack = getIssuePack(context, issue.id);
  const role = issuePack.roleObjectives.find((item) => item.id === routeParams.roleId) ?? issuePack.roleObjectives[0];

  return (
    <main>
      <header className="pageHeader">
        <Link className="backLink" href={`/roles?issue=${issue.id}&context=${context.id}`}>
          Back to role assignment
        </Link>
        <div>
          <p className="eyebrow">Private stakeholder role · {context.name}</p>
          <h1>{role.name}</h1>
          <p>Session {routeParams.sessionId}</p>
        </div>
      </header>

      <section className="outputSheet privateRoleSheet">
        <div className="outputTitle">
          <p className="eyebrow">Confidential role profile</p>
          <h2>{role.name}</h2>
          <p>{role.purpose}</p>
        </div>

        <div className="privateRoleGrid">
          <article>
            <span>Role description</span>
            <h3>What you represent</h3>
            <p>{role.purpose}</p>
          </article>
          <article>
            <span>Your priority</span>
            <h3>Hidden priority</h3>
            <p>{role.hiddenPriority}</p>
          </article>
          <article>
            <span>Your concerns</span>
            <h3>Questions to defend</h3>
            <p>{role.questions.join(" ")}</p>
          </article>
          <article>
            <span>Approval conditions</span>
            <h3>Support if</h3>
            <p>{role.hiddenObjective}</p>
          </article>
          <article>
            <span>Voting preference</span>
            <h3>What you should protect</h3>
            <p>{role.defends}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
