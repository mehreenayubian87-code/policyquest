import WorkspaceClient from "./WorkspaceClient";

export default async function WorkspacePage({
  searchParams
}: {
  searchParams: Promise<{ issue?: string; context?: string }>;
}) {
  const params = await searchParams;

  return <WorkspaceClient issueId={params.issue ?? "mental-health-access"} contextId={params.context ?? "qatar"} />;
}
