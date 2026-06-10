"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PolicyIcon } from "../components";
import { contextPacks, getIssuePack, policyIssues, type ContextId } from "../data";

function makeSessionId(contextId: string, issueId: string) {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${contextId}-${issueId}-${randomPart}`;
}

function qrUrl(target: string) {
  return `https://quickchart.io/qr?size=180&margin=1&text=${encodeURIComponent(target)}`;
}

export default function RolesClient({
  contextId,
  contextName,
  issueId,
  issueTitle
}: {
  contextId: ContextId;
  contextName: string;
  issueId: string;
  issueTitle: string;
}) {
  const context = contextPacks[contextId] ?? contextPacks.qatar;
  const issue = policyIssues.find((item) => item.id === issueId) ?? policyIssues[0];
  const roles = getIssuePack(context, issue.id).roleObjectives;
  const storageKey = `policyquest-role-session-${contextId}-${issueId}`;
  const [sessionId, setSessionId] = useState("");
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [showFacilitatorRoles, setShowFacilitatorRoles] = useState(false);
  const [includePrintPack, setIncludePrintPack] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const nextSessionId = saved || makeSessionId(contextId, issueId);
    window.localStorage.setItem(storageKey, nextSessionId);
    setSessionId(nextSessionId);
    setOrigin(window.location.origin);
  }, [contextId, issueId, storageKey]);

  const assignments = useMemo(
    () => roles.slice(0, 6).map((role, index) => ({
      participant: `Participant ${index + 1}`,
      role,
      privateUrl: `${origin}/role/${sessionId || `${contextId}-${issueId}`}/${role.id}?issue=${issueId}&context=${contextId}`
    })),
    [contextId, issueId, origin, roles, sessionId]
  );

  function generatePrintableRolePack() {
    setIncludePrintPack(true);
    window.setTimeout(() => window.print(), 0);
  }

  return (
    <main>
      <header className="pageHeader finalHeader">
        <Link className="backLink" href={`/select?context=${context.id}`}>
          Change issue
        </Link>
        <div>
          <p className="eyebrow">{contextName} · {issueTitle}</p>
          <h1>Confidential Stakeholder Roles</h1>
          <p>
            Each participant receives a confidential stakeholder role. Scan your QR code or print your role card.
            Do not reveal hidden priorities to other participants.
          </p>
        </div>
        <button className="button dark printButton" onClick={generatePrintableRolePack}>
          Generate Printable Role Pack
        </button>
      </header>

      <section className="outputSheet missionSheet noPrint">
        <div className="outputTitle">
          <p className="eyebrow">Role assignment</p>
          <h2>Each participant should access their role privately.</h2>
          <p>Access options: scan your assigned QR code or generate the printable role pack.</p>
          <p className="warningText">Do not share your hidden stakeholder priorities with other participants.</p>
        </div>

        <div className="assignmentGrid">
          {assignments.map((assignment) => (
            <article className="assignmentCard" key={assignment.role.id}>
              <div>
                <span>{assignment.participant}</span>
                <strong>Role Assigned</strong>
                <small>Scan assigned QR code</small>
              </div>
              <img src={qrUrl(assignment.privateUrl)} alt={`${assignment.participant} confidential role QR code`} />
            </article>
          ))}
        </div>

        <div className="facilitatorReveal">
          <button className="button light full" onClick={() => setShowFacilitatorRoles((current) => !current)}>
            {showFacilitatorRoles ? "Hide Role Cards" : "Reveal Role Cards"}
          </button>
          <p className="mutedText">Facilitator only. Keep hidden priorities private until final debrief.</p>
        </div>

        {showFacilitatorRoles ? (
          <div className="roleRevealGrid">
            {assignments.map((assignment) => (
              <article className="printRoleCard confidentialRoleCard" key={assignment.role.id}>
                <div className="roleTitle">
                  <PolicyIcon name={assignment.role.icon} />
                  <div>
                    <p className="eyebrow">Facilitator preview</p>
                    <h2>{assignment.role.name}</h2>
                  </div>
                </div>
                <div className="roleSection"><strong>Role Description</strong><p>{assignment.role.purpose}</p></div>
                <div className="roleSection"><strong>Hidden Priority</strong><p>{assignment.role.hiddenPriority}</p></div>
                <div className="roleSection"><strong>Approval Conditions</strong><p>{assignment.role.hiddenObjective}</p></div>
                <div className="roleSection"><strong>Voting Preference</strong><p>{assignment.role.defends}</p></div>
              </article>
            ))}
          </div>
        ) : null}

        <Link className="button primary full" href={`/mission?issue=${issueId}&context=${contextId}`}>
          Continue to Mission Brief
        </Link>
      </section>

      {includePrintPack ? (
        <section className="roleCardGrid printOnly">
          {assignments.map((assignment) => (
            <article className="printRoleCard confidentialRoleCard" key={assignment.role.id}>
              <div className="roleTitle">
                <PolicyIcon name={assignment.role.icon} />
                <div>
                  <p className="eyebrow">Confidential role card</p>
                  <h2>{assignment.role.name}</h2>
                </div>
              </div>
              <div className="roleSection"><strong>Role Description</strong><p>{assignment.role.purpose}</p></div>
              <div className="roleSection"><strong>Your Priority</strong><p>{assignment.role.hiddenPriority}</p></div>
              <div className="roleSection"><strong>Your Concerns</strong><p>{assignment.role.questions.join(" ")}</p></div>
              <div className="roleSection"><strong>Approval Conditions</strong><p>{assignment.role.hiddenObjective}</p></div>
              <div className="roleSection"><strong>Voting Preference</strong><p>{assignment.role.defends}</p></div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
