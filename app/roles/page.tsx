import { contextPacks, policyIssues, type ContextId } from "../data";
import RolesClient from "./RolesClient";

function getIssue(issueId?: string) {
  return policyIssues.find((issue) => issue.id === issueId) ?? policyIssues[0];
}

function getContext(contextId?: string) {
  return contextPacks[contextId as ContextId] ?? contextPacks.qatar;
}

export default async function RolesPage({
  searchParams
}: {
  searchParams: Promise<{ issue?: string; context?: string }>;
}) {
  const params = await searchParams;
  const issue = getIssue(params.issue);
  const context = getContext(params.context);

  return (
    <RolesClient
      contextId={context.id}
      contextName={context.name}
      issueId={issue.id}
      issueTitle={issue.title}
    />
  );
}
